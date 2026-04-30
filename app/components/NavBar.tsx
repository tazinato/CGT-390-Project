"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type CurrentUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl?: string | null;
};

const AUTH_CACHE_KEY = "media_app_current_user_cache";

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      style={{
        color: "#111",
        textDecoration: "none",
        fontWeight: 900,
        whiteSpace: "nowrap",
        fontSize: 16,
      }}
    >
      {label}
    </Link>
  );
}

function readCachedUser() {
  if (typeof window === "undefined") return null;

  try {
    const cached = window.sessionStorage.getItem(AUTH_CACHE_KEY);
    if (!cached) return null;

    return JSON.parse(cached) as CurrentUser | null;
  } catch {
    return null;
  }
}

export default function NavBar() {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    setCurrentUser(readCachedUser());

    function handleAuthChanged() {
      setCurrentUser(readCachedUser());
    }

    window.addEventListener("media-app-auth-changed", handleAuthChanged);
    window.addEventListener("storage", handleAuthChanged);

    return () => {
      window.removeEventListener("media-app-auth-changed", handleAuthChanged);
      window.removeEventListener("storage", handleAuthChanged);
    };
  }, []);

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = query.trim();

    if (!trimmed) return;

    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        padding: "24px clamp(24px, 4vw, 80px)",
        borderBottom: "1px solid rgba(0,0,0,0.08)",
        display: "grid",
        gridTemplateColumns: "auto minmax(0, 1fr) auto",
        alignItems: "center",
        gap: 34,
        background: "#ffd6dc",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", gap: 34, alignItems: "center" }}>
        <Link
          href="/"
          style={{
            color: "#111",
            textDecoration: "none",
            fontWeight: 1000,
            fontSize: 30,
            letterSpacing: "-0.045em",
            whiteSpace: "nowrap",
          }}
        >
          MediaApp
        </Link>

        <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
          <NavLink href="/" label="Home" />
          <NavLink href="/add-entry" label="Add Entry" />
          <NavLink href="/favorites" label="Favorites" />
          <NavLink href="/friends" label="Friends" />
        </div>
      </div>

      <form
        onSubmit={submitSearch}
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(240px, 1fr) auto",
          gap: 12,
          justifySelf: "stretch",
          maxWidth: 760,
          width: "100%",
          marginLeft: "auto",
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search titles, people, authors, artists..."
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "15px 18px",
            border: "1px solid rgba(150,143,143,0.42)",
            borderRadius: 10,
            fontSize: 16,
            background: "rgba(255,255,255,0.82)",
            outline: "none",
          }}
        />

        <button
          type="submit"
          style={{
            padding: "15px 22px",
            border: "1px solid #7c7575",
            borderRadius: 10,
            background: "#7c7575",
            color: "white",
            fontWeight: 900,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          justifyContent: "flex-end",
          minHeight: 22,
        }}
      >
        {currentUser ? (
          <>
            <Link
              href={`/profiles/${currentUser.username}`}
              style={{
                padding: "13px 18px",
                borderRadius: 9,
                background: "rgba(255,255,255,0.72)",
                color: "#111",
                textDecoration: "none",
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              Profile
            </Link>

            <Link
              href="/logout"
              style={{
                padding: "13px 18px",
                borderRadius: 9,
                background: "#7c7575",
                color: "white",
                textDecoration: "none",
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              Log Out
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/login"
              style={{
                padding: "13px 18px",
                borderRadius: 9,
                background: "rgba(255,255,255,0.72)",
                color: "#111",
                textDecoration: "none",
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              Log In
            </Link>

            <Link
              href="/signup"
              style={{
                padding: "13px 18px",
                borderRadius: 9,
                background: "#7c7575",
                color: "white",
                textDecoration: "none",
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
