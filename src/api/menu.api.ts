import api from './axios'
import { ENDPOINTS } from '@/constants/endpoint'

export const getMenus = async (): Promise<unknown> => {
  const response = await api.get(ENDPOINTS.MASTER.MENU)
  return response.data
}
