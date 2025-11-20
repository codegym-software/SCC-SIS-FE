// src/stores/userProfile.ts
import { create } from 'zustand';
import { getProfile, type Profile } from '@/api/profile';

type State = {
    userProfile?: Profile;
    loading: boolean;
    error?: string;
    fetchMe: () => Promise<void>;
};

export const useUserProfile = create<State>((set) => ({
    loading: false,
    async fetchMe() {
        try {
            set({ loading: true, error: undefined });
            const { data } = await getProfile();
            
            // Merge with localStorage data
            let phoneNumber: string | undefined;
            let bio: string | undefined;
            let avatarUrl: string | undefined;
            
            try {
                const savedProfile = localStorage.getItem('profileData');
                if (savedProfile) {
                    const parsed = JSON.parse(savedProfile);
                    phoneNumber = parsed.phone;
                    bio = parsed.bio;
                    if (parsed.avatar) {
                        avatarUrl = parsed.avatar;
                    }
                }
            } catch (e) {
                console.error('Failed to parse profileData from localStorage', e);
            }
            
            // Check userAvatar separately
            const savedAvatar = localStorage.getItem('userAvatar');
            if (savedAvatar) {
                avatarUrl = savedAvatar;
            }
            
            const mergedProfile: Profile = {
                ...data,
                phoneNumber,
                avatarUrl,
                bio,
            };
            
            set({ userProfile: mergedProfile, loading: false });
        } catch (e: any) {
            set({
                error: e?.message || 'Fetch profile failed',
                loading: false
            });
        }
    }
}));