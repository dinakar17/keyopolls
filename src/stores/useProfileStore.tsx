import Cookies from 'js-cookie';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ProfileDetailsSchema } from '@/api/schemas';

interface ProfileStore {
  // Profile data and token
  profileData: ProfileDetailsSchema | undefined;
  accessToken: string | undefined;
  isInitialized: boolean;

  // Actions
  setProfileData: (data: ProfileDetailsSchema | undefined) => void;
  setAccessToken: (token: string | undefined) => void;
  resetProfile: () => void;
  initializeProfile: () => Promise<void>;
  refreshProfile: () => void;

  // Helper getters
  isAuthenticated: () => boolean;
  hasProfile: () => boolean;
  getTotalAura: () => number;
}

// Type for the persisted state structure
interface PersistedProfileState {
  profileData: ProfileDetailsSchema | undefined;
  accessToken: string | undefined;
}

const ACCESS_TOKEN_COOKIE = 'auth_token';
const PROFILE_STORAGE_NAME = 'profile-storage';

// Helper function to check if a value is a valid token
const isValidToken = (token: any): token is string => {
  return typeof token === 'string' && token.trim().length > 0;
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      // Profile data and token
      profileData: undefined,
      accessToken: undefined,
      isInitialized: false,

      setProfileData: (data: ProfileDetailsSchema | undefined) => {
        set({ profileData: data });
      },

      setAccessToken: (token: string | undefined) => {
        // Store token in cookie
        if (isValidToken(token)) {
          Cookies.set(ACCESS_TOKEN_COOKIE, token, {
            secure: true,
            sameSite: 'strict',
            expires: 7, // 7 days
          });

          set((state) => ({
            ...state,
            accessToken: token,
            // Update token in profile data if it exists
            profileData: state.profileData
              ? { ...state.profileData, access_token: token }
              : undefined,
          }));
        } else {
          // Handle null/undefined token
          Cookies.remove(ACCESS_TOKEN_COOKIE);
          set((state) => ({
            ...state,
            accessToken: undefined,
            profileData: state.profileData
              ? { ...state.profileData, access_token: undefined }
              : undefined,
          }));
        }
      },

      resetProfile: () => {
        // Clear cookies
        Cookies.remove(ACCESS_TOKEN_COOKIE);

        // Clear localStorage
        localStorage.removeItem(PROFILE_STORAGE_NAME);

        set({
          profileData: undefined,
          accessToken: undefined,
          isInitialized: true,
        });
      },

      initializeProfile: async () => {
        // Get token from cookies
        const cookieToken = Cookies.get(ACCESS_TOKEN_COOKIE);

        // Get stored profile data from localStorage
        const storedProfile = localStorage.getItem(PROFILE_STORAGE_NAME);
        let storedState: PersistedProfileState | null = null;

        if (storedProfile) {
          try {
            const parsed = JSON.parse(storedProfile);
            // Type assertion with runtime validation
            if (parsed && typeof parsed === 'object' && 'state' in parsed) {
              storedState = parsed.state as PersistedProfileState;
            }
          } catch (error) {
            console.error('Error parsing stored profile:', error);
          }
        }

        // Merge cookie tokens with stored data
        // Priority: Cookies > localStorage > undefined
        const finalToken = cookieToken || storedState?.accessToken || undefined;

        set({
          profileData: storedState?.profileData || undefined,
          accessToken: finalToken,
          isInitialized: true,
        });

        // Update cookie if we got token from localStorage
        if (finalToken && !cookieToken) {
          Cookies.set(ACCESS_TOKEN_COOKIE, finalToken, {
            secure: true,
            sameSite: 'strict',
            expires: 7,
          });
        }
      },

      refreshProfile: () => {
        // This is a placeholder for triggering profile refresh
        // Can be used by components to indicate they want fresh profile data
        // The actual API call would be handled by the component using this store
      },

      // Helper getters
      isAuthenticated: () => {
        return !!get().accessToken;
      },

      hasProfile: () => {
        return !!get().accessToken && !!get().profileData;
      },

      getTotalAura: () => {
        const { profileData } = get();
        return profileData?.total_aura || 0;
      },
    }),
    {
      name: PROFILE_STORAGE_NAME,
      storage: createJSONStorage(() => localStorage),
      // Persist both profile data AND token in localStorage
      partialize: (state) => ({
        profileData: state.profileData,
        // Store token in localStorage as well (dual storage with cookies)
        accessToken: state.accessToken,
      }),
    }
  )
);
