export interface Client {
    id: number;
    firstName: string;
    lastName: string;
    dateOfBirth?: Date | null;
    gender?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    createdBy?: number | null;
  }
  
  export interface Program {
    id: number;
    name: string;
    description?: string | null;
    status?: 'active' | 'inactive' | 'completed' | null;
    createdAt?: Date | null;
    updatedAt?: Date | null;
    createdBy?: number | null;
  }
  
  export interface Enrollment {
    id: number;
    clientId: number | null;
    programId: number | null;
    status?: 'active' | 'completed' | 'dropped' | null;
    enrolledAt?: Date | null;
    completedAt?: Date | null;
    notes?: string | null;
    createdBy?: number | null;
  }
  
  export interface EnrollmentWithProgram extends Omit<Enrollment, 'programId'> {
    program: Program | null;
    client?: Client | null;
  }
  
  export interface ClientWithEnrollments extends Client {
    enrollments?: EnrollmentWithProgram[];
  }
  
  export interface User {
    id: number;
    username: string;
    password: string;
    role?: 'admin' | 'doctor' | 'staff';
    createdAt?: Date;
    updatedAt?: Date;
    isActive?: boolean;
  }