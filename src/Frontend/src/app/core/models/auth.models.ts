export interface User {
  id: string;
  email: string;
  role: string;
  organizationId: string;
  organizationName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface RegisterDto {
  email: string;
  password: string;
  organizationName: string;
}

export interface LoginDto {
  email: string;
  password: string;
}
