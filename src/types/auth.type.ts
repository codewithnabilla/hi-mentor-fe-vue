import type { User } from "./user.type";

export interface LoginPayload {
    email: string
    password: string
}

export interface LoginResponse {
  access_token?: string;
  accessToken?: string;
  token?: string;
  token_type?: string;
  permissions?: string[];
  user?: User;
  data?: LoginResponse;
  [key: string]: unknown;
}