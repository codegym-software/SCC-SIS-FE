import api from './http';
import type { ProfileDto } from '../types/auth';

export const getProfile = () => api.get<ProfileDto>('/api/auth/profile');
