import type { LoginPayload, LoginResponse } from "@/types/auth.type";
import { ENDPOINTS } from "@/constants/endpoint";
import api from "./axios";

export const loginApi = async (
  payload: LoginPayload
) => {
  const response = await api.post<LoginResponse>(ENDPOINTS.AUTH.LOGIN, payload);
  return response.data
}

export const register = async (
  payload: LoginResponse
) => {
  const response = await api.post(ENDPOINTS.AUTH.REGISTER, payload);
  return response.data;
}

export const me = async () => {
  const response = await api.get(ENDPOINTS.AUTH.ME);
  return response.data;
};

export const logoutApi = async () => {
  const response = await api.post(ENDPOINTS.AUTH.LOGOUT);
  return response.data;
};