"use client";

import { Provider } from "react-redux";
import { QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/store";
import { queryClient } from "@/lib/queryClient";
import { useEffect } from "react";
import { logout } from "@/store/authSlices";

function AuthListener() {
  useEffect(() => {
    const handler = () => {
      store.dispatch(logout());
    };
    window.addEventListener("sociality:logout", handler);
    return () => window.removeEventListener("sociality:logout", handler);
  }, []);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthListener />
        {children}
      </QueryClientProvider>
    </Provider>
  );
}
