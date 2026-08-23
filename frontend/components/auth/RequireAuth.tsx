"use client";

import { ReactNode } from "react";
import { Lock } from "lucide-react";
import keycloak from "@/lib/keycloak";
import { useAuth } from "@/providers/AuthProvider";
import { useAuthStore } from "@/store";

interface RequireAuthProps {
  children: ReactNode;
  /** Shown above the sign-in buttons to explain what is behind the gate. */
  message?: string;
}

/**
 * Renders its children only for signed-in users.
 *
 * <p>Guests get a sign-in prompt instead, and the children never mount — so a gated
 * page performs no data fetching at all until the visitor authenticates.
 */
export default function RequireAuth({ children, message }: RequireAuthProps) {
  const { initialized } = useAuth();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Keycloak restores sessions asynchronously; showing the gate before that
  // finishes would flash a sign-in prompt at already-authenticated users.
  if (!initialized) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-gray-3 uppercase tracking-[0.2em] animate-pulse">
          Checking your session
        </p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Return the user to this exact page once they finish signing in.
  const returnHere = () =>
    typeof window !== "undefined" ? window.location.href : undefined;

  return (
    <div className="py-24 flex justify-center px-4">
      <div className="max-w-lg w-full bg-white border border-gray-100 rounded-[2rem] p-10 shadow-premium text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary border border-primary/10">
          <Lock size={28} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-black-1 tracking-tight">
            Sign in to continue
          </h1>
          <p className="text-gray-2 font-medium leading-relaxed">
            {message ??
              "Log in or register to view tender details, download documents and submit a bid."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={() => keycloak?.login({ redirectUri: returnHere() })}
            className="flex-1 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all hover:shadow-primary shadow-sm active:scale-[0.98]"
          >
            Log In
          </button>
          <button
            onClick={() => keycloak?.register({ redirectUri: returnHere() })}
            className="flex-1 bg-white border border-gray-100 text-black-1 hover:border-primary/20 hover:text-primary px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-sm active:scale-[0.98]"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
