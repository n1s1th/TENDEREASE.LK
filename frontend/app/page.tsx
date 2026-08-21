"use client";

import HomePage from "@/components/home/HomePage";
import { useAuthStore } from "@/store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";

export default function Page() {
  const { isAuthenticated, user } = useAuthStore();
  const { initialized } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initialized && isAuthenticated && user?.roles?.includes("ADMIN")) {
      router.push("/admin");
    }
  }, [initialized, isAuthenticated, user, router]);

  return <HomePage />;
}
