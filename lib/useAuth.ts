import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import { isTokenExpired } from "./jwt";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  subscription?: {
    plan: string;
    documentsPerMonth: number;
    questionsPerMonth: number;
    questionsUsed: number;
    validUntil: Date;
  };
}

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => boolean;
  updateAuthFromSession: () => Promise<void>;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token: string, user: User) => {
        if (!token || isTokenExpired(token)) {
          console.error("Invalid or expired token provided to setAuth");
          get().logout();
          return;
        }

        set({ token, user });

        if (typeof window !== "undefined") {
          window.localStorage.setItem("auth-token", token);
        }
      },
      logout: async () => {
        try {
          await fetch("/api/auth/logout", { 
            method: "POST",
            credentials: "include" 
          });
        } catch (error) {
          console.error("Error during logout:", error);
        }
        set({ token: null, user: null });
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("auth-token");
          // Redirect to home page
          window.location.href = "/";
        }
      },
      checkAuth: () => {
        const state = get();
        if (!state.token) return false;

        try {
          if (isTokenExpired(state.token)) {
            get().logout();
            return false;
          }
          return true;
        } catch (error) {
          console.error("Error checking auth:", error);
          get().logout();
          return false;
        }
      },
      updateAuthFromSession: async () => {
        try {
          const response = await fetch("/api/auth/session", {
            credentials: "include"
          });
          
          if (!response.ok) {
            if (response.status === 401) {
              // Clear invalid auth state
              set({ token: null, user: null });
            }
            return;
          }

          const data = await response.json();
          
          if (data.token && data.user) {
            if (!isTokenExpired(data.token)) {
              set({ token: data.token, user: data.user });
            } else {
              console.error("Received expired token from session");
              set({ token: null, user: null });
            }
          } else {
            set({ token: null, user: null });
          }
        } catch (error) {
          console.error("Error updating auth from session:", error);
          set({ token: null, user: null });
        }
      },
    }),
    {
      name: "auth-storage",
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          try {
            const str = window.localStorage.getItem(name);
            if (!str) return null;
            return JSON.parse(str);
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(name, JSON.stringify(value));
          }
        },
        removeItem: (name) => {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(name);
          }
        },
      },
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);

// Helper function to get auth token with validation
export const getAuthToken = () => {
  const { token, checkAuth } = useAuth.getState();
  if (!token || !checkAuth()) return null;
  return token;
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const { checkAuth } = useAuth.getState();
  return checkAuth();
};

// Helper function to get current user
export const getCurrentUser = () => {
  const { user, checkAuth } = useAuth.getState();
  if (!checkAuth()) return null;
  return user;
};

// Custom fetch with auth header
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error("No authentication token available");
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${token}`,
  };

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  if (response.status === 401) {
    useAuth.getState().logout();
    throw new Error("Authentication failed");
  }

  return response;
};
