import { useCallback, useEffect, useState } from "react";
import type { UserProfile } from "../types/chat";
import { useActor } from "./useActor";

const TOKEN_KEY = "chat_token";

export type AuthStatus = "loading" | "unauthenticated" | "authenticated";

export function useChatAuth() {
  const { actor } = useActor();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Validate stored token on mount
  useEffect(() => {
    if (!actor) return;
    const stored = localStorage.getItem(TOKEN_KEY);
    if (!stored) {
      setStatus("unauthenticated");
      return;
    }
    void (async () => {
      try {
        const api = actor as any;
        const profile = await api.validateToken(stored);
        if (profile) {
          setCurrentUser(profile as UserProfile);
          setToken(stored);
          setStatus("authenticated");
        } else {
          localStorage.removeItem(TOKEN_KEY);
          setStatus("unauthenticated");
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setStatus("unauthenticated");
      }
    })();
  }, [actor]);

  const login = useCallback(
    async (username: string, password: string): Promise<void> => {
      if (!actor) throw new Error("Not connected");
      setAuthError(null);
      const api = actor as any;
      const result = await api.loginGetToken(username, password);
      if ("err" in result) {
        const msg = result.err as string;
        setAuthError(msg);
        throw new Error(msg);
      }
      const { profile, token: tok } = result.ok as {
        profile: UserProfile;
        token: string;
      };
      localStorage.setItem(TOKEN_KEY, tok);
      setCurrentUser(profile);
      setToken(tok);
      setStatus("authenticated");
    },
    [actor],
  );

  const register = useCallback(
    async (
      username: string,
      password: string,
      displayName: string,
    ): Promise<void> => {
      if (!actor) throw new Error("Not connected");
      setAuthError(null);
      const api = actor as any;
      const regResult = await api.register(username, password, displayName);
      if ("err" in regResult) {
        const msg = regResult.err as string;
        setAuthError(msg);
        throw new Error(msg);
      }
      // After register, login to get token
      await login(username, password);
    },
    [actor, login],
  );

  const logout = useCallback(async () => {
    if (!actor || !token) return;
    try {
      const api = actor as any;
      await api.logout(token);
    } catch {
      // ignore
    }
    localStorage.removeItem(TOKEN_KEY);
    setCurrentUser(null);
    setToken(null);
    setStatus("unauthenticated");
  }, [actor, token]);

  const updateDisplayName = useCallback(
    async (newName: string): Promise<void> => {
      if (!actor || !token) throw new Error("Not authenticated");
      const api = actor as any;
      const result = await api.updateDisplayName(token, newName);
      if ("err" in result) {
        throw new Error(result.err as string);
      }
      if (currentUser) {
        setCurrentUser({ ...currentUser, displayName: newName });
      }
    },
    [actor, token, currentUser],
  );

  return {
    status,
    currentUser,
    token,
    authError,
    setAuthError,
    login,
    register,
    logout,
    updateDisplayName,
  };
}
