"use client";

import { useEffect } from "react";

const AUTH_CACHE_KEY = "media_app_current_user_cache";
const AUTH_CHANGED_EVENT = "media-app-auth-changed";

export default function LogoutPage() {
  useEffect(() => {
    async function logout() {
      try {
        window.sessionStorage.removeItem(AUTH_CACHE_KEY);
        window.localStorage.removeItem(AUTH_CACHE_KEY);
        window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
      } catch {
        // Ignore storage errors.
      }

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => {
        controller.abort();
      }, 2500);

      try {
        await fetch("/api/auth/logout", {
          method: "POST",
          cache: "no-store",
          signal: controller.signal,
        });
      } catch (error) {
        console.error("Logout request failed or timed out:", error);
      } finally {
        window.clearTimeout(timeoutId);
        window.location.replace("/login");
      }
    }

    logout();
  }, []);

  return (
    <main
      style={{
        minHeight: "70vh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          border: "1px solid var(--app-border, #ddd)",
          borderRadius: 18,
          padding: 24,
          background: "var(--app-surface-strong, rgba(255,255,255,0.9))",
          textAlign: "center",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 24 }}>Logging out...</h1>
        <p style={{ marginTop: 10, marginBottom: 0, color: "#666" }}>
          Clearing your session.
        </p>
      </div>
    </main>
  );
}