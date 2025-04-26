// In your types.ts file
export type Client = {
    id: number;
    first_Name: string;  // Note the underscore
    last_Name: string;   // Note the underscore
    dateOfBirth?: Date | null;
    gender?: string | null;
    address?: string | null;
    phone?: string | null;
    email?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
    createdBy?: number | null;
  };