export enum UserRole {
  ADMIN = 'admin',
  SUPERVISOR = 'supervisor',
  WORKER = 'worker',
}

export enum JobStatus {
  SCHEDULED = 'Agendado',
  COMPLETED = 'Completado',
  CANCELED = 'Cancelado',
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface Employee {
  id: string;
  name: string;
}

export interface Team {
  id: string;
  name: string;
  employee_ids: string[];
}

export interface Client {
  id: string;
  name: string;
  contact_info: string;
  phone: string;
  email: string;
}

export interface Building {
  id: string;
  name: string;
  address: string;
  client_ids: string[];
  access_code: string;
}

export interface Unit {
  id: string;
  name_identifier: string;
  building_id: string;
  square_meters: number;
  room_count: number;
  bathroom_count: number;
  floor_type: string;
  has_large_windows: boolean;
  fixed_price: number;
  access_code: string;
}

export interface CleaningJob {
  id: string;
  unit_id: string;
  job_date: Date;
  status: JobStatus;
  estimated_hours: number;
  actual_hours?: number;
  invoiced_price?: number;
  assigned_team: string[]; // array of employee_ids
  notes?: string;
}

export interface SystemConfig {
  minutes_per_sq_meter: number;
  minutes_per_room: number;
  minutes_per_bathroom: number;
  minutes_for_windows: number;
  employee_hourly_cost: number;
}