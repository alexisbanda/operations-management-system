import express, { Router, Request, Response, NextFunction } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import admin from 'firebase-admin';

// NOTA: No podemos importar directamente desde '../types' porque el backend
// y el frontend son entornos separados. Definimos los roles aquí.
enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
}

// Cargar variables de entorno en desarrollo
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// Inicializar Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

export const db = admin.firestore();

// Extiende el tipo Request de Express para incluir al usuario decodificado
interface AuthenticatedRequest extends Request {
    user?: admin.auth.DecodedIdToken;
}

// Middleware de autenticación: Nuestro "guardián" de rutas
const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ message: 'No autorizado: Token no proporcionado.' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    try {
        // Verificamos el token usando el SDK de Admin
        req.user = await admin.auth().verifyIdToken(idToken);
        next(); // Si el token es válido, continuamos a la ruta solicitada
    } catch (error) {
        console.error('Error verificando el token:', error);
        return res.status(403).send({ message: 'No autorizado: Token inválido.' });
    }
};

const app = express();
const router = Router();

app.use(cors());
app.use(express.json());

// --- Endpoint para obtener el rol del usuario ---
router.get('/user-role', authenticate, (req: AuthenticatedRequest, res: Response) => {
    const email = req.user?.email;

    // Lógica simple para asignar roles. En una app real, esto podría venir de "custom claims" en Firebase.
    const role = email === 'admin@sgo.com' ? UserRole.ADMIN : UserRole.SUPERVISOR;
    res.json({ role });
});

// --- Endpoint para obtener todos los clientes ---
router.get('/clients', authenticate, async (req: AuthenticatedRequest, res: Response) => {
    try {
        const snapshot = await db.collection('clients').get();
        if (snapshot.empty) {
            return res.status(200).json([]);
        }
        // Mapeamos los documentos para incluir el ID del documento en el objeto
        const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.json(clients);
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ message: 'Error al obtener los clientes.' });
    }
});

app.use('/.netlify/functions/api', router);

export const handler = serverless(app);