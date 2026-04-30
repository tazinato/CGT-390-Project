"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Media = {
  id: number;
  type: string;
  title: string;
  releaseDate: string | Date | null;
  coverUrl: string | null;
  movieDetails?: {
    runtimeMinutes: number | null;
  } | null;
  showDetails?: {
    seasonsCount: number | null;
    episodesCount: number | null;
    avgRuntimeMinutes: number | null;
    showStatus: string | null;
  } | null;
  bookDetails?: {
    pageCount: number | null;
    estimatedReadTimeMinutes: number | null;
    isbn13: string | null;
  } | null;
  albumDetails?: {
    totalTracks: number | null;
    durationSeconds: number | null;
    primaryArtistName: string | null;
  } | null;
  gameDetails?: {
    timeToBeatHours: unknown;
    multiplayer: boolean;
  } | null;
};

type ProfileFavorite = {
  userId: string;
  mediaId: number;
  slotNumber: number;
  media: Media;
};

type FavoriteOption = {
  entryId: number;
  status: string;
  ratingValue: number | null;
  updatedAt: string | Date;
  media: Media;
};

type Props = {
  favorites: ProfileFavorite[];
  isOwnProfile: boolean;
};

async function safeJson(res: Response) {
  const text = await res.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function formatYear(value: Date | string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value).slice(0, 4);
  }

  return String(date.getFullYear());
}

function MediaCoverCard({ media }: { media: Media }) {
  if (media.type === "ALBUM") {
    return (
      <div
        style={{
          width: 160,
          height: 240,
          border: "1px solid var(--app-border)",
          borderRadius: 8,
          overflow: "hidden",
          background: "var(--app-surface-strong)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            height: 40,
            padding: "6px 8px",
            fontSize: 13,
            fontWeight: 600,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1.15,
          }}
        >
          {media.albumDetails?.primaryArtistName ?? "Unknown Artist"}
        </div>

        <div
          style={{
            width: 160,
            height: 160,
            background: "#eee",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {media.coverUrl ? (
            <img
              src={media.coverUrl}
              alt={media.title}
              loading="lazy"
              decoding="async"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <span style={{ fontSize: 12 }}>No cover</span>
          )}
        </div>

        <div
          style={{
            height: 40,
            padding: "6px 8px",
            fontSize: 13,
            fontWeight: 700,
            textAlign: "center",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            lineHeight: 1.15,
          }}
        >
          {media.title}
        </div>
      </div>
    );
  }

  if (media.coverUrl) {
    return (
      <img
        src={media.coverUrl}
        alt={media.title}
        loading="lazy"
        decoding="async"
        style={{
          width: 160,
          height: 240,
          objectFit: "cover",
          borderRadius: 8,
          flexShrink: 0,
          border: "1px solid var(--app-border)",
          background: "#eee",
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: 160,
        height: 240,
        border: "1px solid var(--app-border)",
        borderRadius: 8,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        background: "#eee",
        fontSize: 12,
      }}
    >
      No cover
    </div>
  );
}

function EmptyFavoriteSlot({ slotNumber }: { slotNumber: number }) {
  return (
    <div>
      <div style={{ marginBottom: 8, fontWeight: 700 }}>#{slotNumber}</div>
      <div
        style={{
          width: 160,
          height: 240,
          border: "1px dashed #bbb",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f7f7",
          color: "#777",
          fontSize: 13,
        }}
      >
        Empty
      </div>
    </div>
  );
}

function OptionCover({ media }: { media: Media }) {
  return (
    <div
      style={{
        width: 52,
        height: 78,
        borderRadius: 6,
        overflow: "hidden",
        border: "1px solid var(--app-border)",
        background: "#eee",
        flexShrink: 0,
      }}
    >
      {media.coverUrl ? (
        <img
          src={media.coverUrl}
          alt={media.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : null}
    </div>
  );
}

export default function ProfileTopFavorites({
  favorites,
  isOwnProfile,
}: Props) {
  const router = useRouter();

  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [options, setOptions] = useState<FavoriteOption[]>([]);
  const [query, setQuery] = useState("");
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const favoriteBySlot = useMemo(() => {
    const map = new Map<number, ProfileFavorite>();

    for (const favorite of favorites) {
      map.set(favorite.slotNumber, favorite);
    }

    return map;
  }, [favorites]);

  const activeFavorite = activeSlot ? favoriteBySlot.get(activeSlot) : null;

  const filteredOptions = options.filter((option) => {
    const searchText = `${option.media.title} ${option.media.type} ${
      option.media.albumDetails?.primaryArtistName ?? ""
    }`.toLowerCase();

    return searchText.includes(query.trim().toLowerCase());
  });

  async function openPicker(slotNumber: number) {
    if (!isOwnProfile) return;

    setActiveSlot(slotNumber);
    setQuery("");
    setMessage("");

    if (options.length > 0) return;

    setLoadingOptions(true);

    try {
      const res = await fetch("/api/favorites/options", {
        cache: "no-store",
      });

      const data = await safeJson(res);

      if (!res.ok || !Array.isArray(data)) {
        setMessage(data?.error || "Failed to load your logged media.");
        return;
      }

      setOptions(data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to load.");
    } finally {
      setLoadingOptions(false);
    }
  }

  async function saveFavorite(mediaId: number) {
    if (!activeSlot) return;

    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slotNumber: activeSlot,
          mediaId,
        }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        setMessage(data?.error || "Failed to save favorite.");
        return;
      }

      setActiveSlot(null);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  async function removeFavorite() {
    if (!activeSlot) return;

    setSaving(true);
    setMessage("");

    try {
      const params = new URLSearchParams({
        slotNumber: String(activeSlot),
      });

      const res = await fetch(`/api/favorites?${params.toString()}`, {
        method: "DELETE",
      });

      const data = await safeJson(res);

      if (!res.ok) {
        setMessage(data?.error || "Failed to remove favorite.");
        return;
      }

      setActiveSlot(null);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to remove.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {[1, 2, 3, 4].map((slotNumber) => {
          const favorite = favoriteBySlot.get(slotNumber);

          if (!isOwnProfile) {
            return favorite ? (
              <a
                key={slotNumber}
                href={`/media/${favorite.media.id}`}
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "block",
                }}
              >
                <div style={{ marginBottom: 8, fontWeight: 700 }}>
                  #{slotNumber}
                </div>
                <MediaCoverCard media={favorite.media} />
              </a>
            ) : (
              <EmptyFavoriteSlot key={slotNumber} slotNumber={slotNumber} />
            );
          }

          return (
            <button
              key={slotNumber}
              type="button"
              onClick={() => openPicker(slotNumber)}
              style={{
                padding: 0,
                border: 0,
                background: "transparent",
                color: "inherit",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              {favorite ? (
                <>
                  <div style={{ marginBottom: 8, fontWeight: 700 }}>
                    #{slotNumber}
                  </div>
                  <MediaCoverCard media={favorite.media} />
                </>
              ) : (
                <EmptyFavoriteSlot slotNumber={slotNumber} />
              )}

              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  color: "#666",
                  textAlign: "center",
                }}
              >
                {favorite ? "Click to replace" : "Click to add"}
              </div>
            </button>
          );
        })}
      </div>

      {activeSlot ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(0,0,0,0.35)",
            display: "grid",
            placeItems: "center",
            padding: 20,
          }}
          onClick={() => {
            if (!saving) setActiveSlot(null);
          }}
        >
          <div
            style={{
              width: "min(720px, 100%)",
              maxHeight: "80vh",
              overflow: "hidden",
              borderRadius: 18,
              background: "var(--app-surface-strong, white)",
              border: "1px solid var(--app-border)",
              boxShadow: "0 24px 80px rgba(0,0,0,0.22)",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={{ padding: 18, borderBottom: "1px solid #eee" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                <div>
                  <h2 style={{ margin: 0 }}>Choose favorite #{activeSlot}</h2>
                  <p style={{ margin: "6px 0 0", color: "#666" }}>
                    Pick from media you have already logged.
                  </p>
                </div>

                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setActiveSlot(null)}
                  style={{
                    border: "1px solid var(--app-border)",
                    background: "white",
                    borderRadius: 999,
                    padding: "7px 11px",
                    cursor: saving ? "not-allowed" : "pointer",
                    fontWeight: 800,
                  }}
                >
                  Close
                </button>
              </div>

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search your logged media..."
                style={{
                  marginTop: 14,
                  width: "100%",
                  boxSizing: "border-box",
                  border: "1px solid var(--app-border)",
                  borderRadius: 999,
                  padding: "10px 13px",
                  fontSize: 14,
                }}
              />

              {activeFavorite ? (
                <button
                  type="button"
                  disabled={saving}
                  onClick={removeFavorite}
                  style={{
                    marginTop: 10,
                    border: 0,
                    background: "transparent",
                    color: "#b00020",
                    fontWeight: 800,
                    textDecoration: "underline",
                    cursor: saving ? "not-allowed" : "pointer",
                    padding: 0,
                  }}
                >
                  Remove current favorite from this slot
                </button>
              ) : null}

              {message ? (
                <p style={{ color: "#b00020", fontWeight: 700 }}>{message}</p>
              ) : null}
            </div>

            <div
              style={{
                overflowY: "auto",
                padding: 14,
                display: "grid",
                gap: 10,
              }}
            >
              {loadingOptions ? (
                <p>Loading your logged media...</p>
              ) : filteredOptions.length === 0 ? (
                <p style={{ color: "#666" }}>
                  No logged media found. Add entries first, then choose your top 4.
                </p>
              ) : (
                filteredOptions.map((option) => (
                  <button
                    key={`${option.entryId}-${option.media.id}`}
                    type="button"
                    disabled={saving}
                    onClick={() => saveFavorite(option.media.id)}
                    style={{
                      border: "1px solid var(--app-border)",
                      borderRadius: 12,
                      background:
                        activeFavorite?.mediaId === option.media.id
                          ? "rgba(0,0,0,0.06)"
                          : "white",
                      padding: 10,
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      textAlign: "left",
                      cursor: saving ? "not-allowed" : "pointer",
                    }}
                  >
                    <OptionCover media={option.media} />

                    <div>
                      <strong style={{ display: "block" }}>
                        {option.media.title}
                      </strong>
                      <span style={{ color: "#666", fontSize: 13 }}>
                        {option.media.type}
                        {formatYear(option.media.releaseDate)
                          ? ` · ${formatYear(option.media.releaseDate)}`
                          : ""}
                        {option.ratingValue
                          ? ` · ${option.ratingValue}/10`
                          : ""}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
