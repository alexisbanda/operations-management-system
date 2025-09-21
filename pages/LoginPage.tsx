import React, { useState } from 'react';
import { signInWithEmailAndPassword, FirebaseError } from 'firebase/auth';
import { auth } from '../firebase';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (err) {
            const firebaseError = err as FirebaseError;
            console.error("Error de autenticación:", firebaseError.code);
            if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/wrong-password' || firebaseError.code === 'auth/user-not-found') {
                setError('Correo o contraseña incorrectos.');
            } else if (firebaseError.code === 'auth/too-many-requests') {
                setError('Demasiados intentos fallidos. Por favor, espera unos minutos.');
            } else {
                setError('Ocurrió un error inesperado al iniciar sesión.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex">
            <div className="hidden lg:block relative w-0 flex-1">
                <img
                    className="absolute inset-0 h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=2670&auto=format=fit=crop"
                    alt="Persona realizando limpieza profesional"
                />
                <div className="absolute inset-0 bg-brand-primary opacity-70"></div>
                <div className="absolute inset-0 flex items-center justify-center p-12" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                    <div className="text-white text-center max-w-lg">
                        <h1 className="text-6xl font-black text-accent tracking-wider" style={{ textShadow: '0 0 15px rgba(255, 193, 7, 0.5)' }}>
                            SGO
                        </h1>
                        <div className="w-24 h-1 bg-accent mx-auto my-6 rounded-full"></div>
                        <p className="text-2xl font-light text-brand-light leading-relaxed">
                            Orquestando la excelencia en cada rincón.
                        </p>
                        <p className="mt-8 text-sm font-semibold tracking-widest text-white/80">CLARIDAD &bull; CONTROL &bull; CRECIMIENTO</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
                <div className="mx-auto w-full max-w-sm lg:w-96">
                    <div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                            Bienvenido de nuevo
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Inicia sesión para acceder a tu panel de control.
                        </p>
                    </div>

                    <div className="mt-8">
                        <form onSubmit={handleLogin} className="space-y-6">
                            {error && <p className="bg-red-100 text-red-700 p-3 rounded-md text-sm font-medium">{error}</p>}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Correo electrónico
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                    Contraseña
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-brand-secondary focus:border-brand-secondary sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-primary hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300">
                                    {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};