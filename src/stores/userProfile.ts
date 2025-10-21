// src/stores/userProfile.ts
import { create } from 'zustand';
import { getProfile, type Profile } from '@/api/profile';

type State = {
    me?: Profile;
    loading: boolean;
    error?: string;
    fetchMe: () => Promise<void>;
};

// Mock profile for development
const mockProfile: Profile = {
    userId: 1,
    fullName: 'Dev User',
    email: 'dev@example.com',
    keycloak: {
        username: 'dev-user',
        firstName: 'Dev',
        lastName: 'User'
    },
    roles: [
        {
            code: 'SUPER_ADMIN',
            scope: 'GLOBAL'
        }
    ],
    centerId: 1,
    centerName: 'Dev Center'
};

export const useUserProfile = create<State>((set) => ({
    loading: false,
    async fetchMe() {
        try {
            set({ loading: true, error: undefined });
            const { data } = await getProfile();
            set({ me: data, loading: false });
        } catch (e: any) {
            console.log('Profile API failed, using mock data:', e?.message);
            
            // Use mock data in development mode
            if (import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                set({ 
                    me: mockProfile, 
                    loading: false,
                    error: undefined 
                });
            } else {
                set({
                    error: e?.message || 'Fetch profile failed',
                    loading: false
                });
            }
        }
    }
}));