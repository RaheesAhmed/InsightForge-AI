import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";

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
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token: string, user: User) => {
        set({ token, user });

        if (typeof window !== "undefined") {
          window.localStorage.setItem("auth-token", token);

          const authValue = `Bearer ${token}`;
          if (window.fetch) {
            const originalFetch = window.fetch;
            window.fetch = function (
              input: RequestInfo | URL,
              init?: RequestInit
            ) {
              if (!init) {
                init = {};
              }
              if (!init.headers) {
                init.headers = {};
              }

              const url =
                input instanceof Request ? input.url : input.toString();
              const isSameOrigin =
                url.startsWith(window.location.origin) || url.startsWith("/");

              if (
                isSameOrigin &&
                !init.headers.hasOwnProperty("Authorization")
              ) {
                (init.headers as Record<string, string>)["Authorization"] =
                  authValue;
              }

              return originalFetch(input, init);
            };
          }
        }
      },
      logout: () => {
        set({ token: null, user: null });
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("auth-token");
        }
      },
      checkAuth: () => {
        const state = get();
        if (!state.token) return false;

        try {
          const decoded = jwtDecode(state.token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp && decoded.exp < currentTime) {
            get().logout();
            return false;
          }
          return true;
        } catch (error) {
          get().logout();
          return false;
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
            return str ? JSON.parse(str) : null;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          window.localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          window.localStorage.removeItem(name);
        },
      },
      partialize: (state) => {
        const { token, user } = state;
        return {
          token,
          user,
        } as const;
      },
    }
  )
);

// Helper function to get auth token with validation
export const getAuthToken = () => {
  const { token, checkAuth } = useAuth.getState();
  return checkAuth() ? token : null;
};

// Helper function to check if user is authenticated
export const isAuthenticated = () => {
  const { checkAuth } = useAuth.getState();
  return checkAuth();
};

// Helper function to get current user
export const getCurrentUser = () => {
  const { user, checkAuth } = useAuth.getState();
  return checkAuth() ? user : null;
};

// Custom fetch with auth header
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = getAuthToken();

  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired or invalid
    useAuth.getState().logout();
    window.location.href = "/sign-in";
    throw new Error("Authentication required");
  }

  return response;
};
