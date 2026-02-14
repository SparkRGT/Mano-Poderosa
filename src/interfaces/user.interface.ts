export type UserRole = 'admin' | 'customer';

export interface User {
  id: string;
  email: string;
  password?: string;
  name: string;
  phone: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserInsert {
  email: string;
  password: string;
  name: string;
  phone: string;
  role?: UserRole;
}

export interface UserUpdate {
  name?: string;
  phone?: string;
  role?: UserRole;
  password?: string;
}
