// src/api/profile.ts
import api from '../shared/api/http';

export type ProfileRole = {
    code: string;
    scope: 'GLOBAL' | 'CENTER';
};

export type KeycloakInfo = {
    username?: string | null;
    firstName?: string | null;
    lastName?: string | null;
};

export type Profile = {
    userId: number;
    fullName: string;
    email: string;
    keycloak: KeycloakInfo;
    roles: ProfileRole[];
    centerId?: number | null;
    centerName?: string | null;
    // Extended fields (stored in localStorage)
    phoneNumber?: string;
    avatarUrl?: string;
    bio?: string;
};

export const getProfile = () => api.get<Profile>('/api/users/profile');