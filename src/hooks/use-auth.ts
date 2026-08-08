"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authService } from "@/lib/api/services/auth.service";
import { queryKeys } from "@/lib/query-keys";
import { useAuthStore } from "@/store/auth-store";
import { ApiError } from "@/lib/api/client";
import type { LoginInput, RegisterInput } from "@/types/auth";

export function useCurrentUser() {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: async () => {
      try {
        const user = await authService.me();
        setUser(user);
        return user;
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout();
        }
        throw error;
      }
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function useLogin(redirectTo?: string) {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.setQueryData(queryKeys.auth.me, data.user);
      toast.success(`Welcome back, ${data.user.name.split(" ")[0]}!`);

      if (redirectTo) {
        router.push(redirectTo);
        return;
      }

      const isStaff = data.user.roles?.some((role) => role !== "customer");
      router.push(isStaff ? "/admin" : "/dashboard");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Invalid email or password.");
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterInput) => authService.register(input),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.setQueryData(queryKeys.auth.me, data.user);
      toast.success("Account created! Welcome to Royal SL.");
      router.push("/dashboard");
    },
    onError: (error: ApiError) => {
      toast.error(error.message || "Could not create your account.");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSettled: () => {
      logout();
      queryClient.clear();
      toast.success("Logged out.");
      router.push("/");
    },
  });
}

/** Rehydrates the current user once the persisted auth store is ready. */
export function useAuthBootstrap() {
  const token = useAuthStore((state) => state.token);
  // Must start `false` on both server and first client render (never read
  // the store's persist state during render) so SSR/prerender output matches
  // the initial client render; hydration status is only ever set in an effect.
  const [hasHydrated, setHasHydrated] = React.useState(false);

  React.useEffect(() => {
    if (useAuthStore.persist.hasHydrated()) {
      setHasHydrated(true);
      return;
    }

    const unsub = useAuthStore.persist.onFinishHydration(() =>
      setHasHydrated(true)
    );
    return unsub;
  }, []);

  return { hasHydrated, token };
}
