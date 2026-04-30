"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Media = {
  id: number;
  type: string;
  title: string;
  description: string | null;
  releaseDate: Date | string | null;
  coverUrl: string | null;
  backdropUrl: string | null;
  languageCode: string | null;
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

type ProfileEntry = {
  id: number;
  status: string;
  ratingValue: number | null;
  reviewText: string | null;
  updatedAt: Date | string;
  media: Media;
};

type Props = {
  entries: ProfileEntry[];
  isOwnProfile: boolean;
};

const statusOptions = [
  { value: "WISHLIST", label: "Wishlist" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "PAUSED", label: "Paused" },
  { value: "DROPPED", label: "Dropped" },
];

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

function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return null;

  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
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

function MediaMeta({ media }: { media: Media }) {
  const year = formatYear(media.releaseDate);

  return (
    <div style={{ color: "#555", fontSize: 14, marginTop: 4 }}>
      <span>{media.type}</span>

      {year && <span> · {year}</span>}

      {media.type === "MOVIE" && media.movieDetails?.runtimeMinutes && (
        <span> · {media.movieDetails.runtimeMinutes} min</span>
      )}

      {media.type === "SHOW" && media.showDetails?.seasonsCount && (
        <span> · {media.showDetails.seasonsCount} seasons</span>
      )}

      {media.type === "BOOK" && media.bookDetails?.pageCount && (
        <span> · {media.bookDetails.pageCount} pages</span>
      )}

      {media.type === "ALBUM" && media.albumDetails?.primaryArtistName && (
        <span> · {media.albumDetails.primaryArtistName}</span>
      )}

      {media.type === "ALBUM" && media.albumDetails?.totalTracks && (
        <span> · {media.albumDetails.totalTracks} tracks</span>
      )}

      {media.type === "ALBUM" && media.albumDetails?.durationSeconds && (
        <span> · {formatDuration(media.albumDetails.durationSeconds)}</span>
      )}

      {media.type === "GAME" && media.gameDetails?.multiplayer !== undefined && (
        <span>
          {" "}
          · {media.gameDetails.multiplayer ? "Multiplayer" : "Single-player"}
        </span>
      )}
    </div>
  );
}

export default function ProfileEntriesList({ entries, isOwnProfile }: Props) {
  const router = useRouter();

  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);
  const [status, setStatus] = useState("COMPLETED");
  const [ratingValue, setRatingValue] = useState<number | "">("");
  const [reviewText, setReviewText] = useState("");
  const [saving, setSaving] = useState(false);
  const [messageByEntry, setMessageByEntry] = useState<Record<number, string>>(
    {}
  );

  function setEntryMessage(entryId: number, message: string) {
    setMessageByEntry((current) => ({
      ...current,
      [entryId]: message,
    }));
  }

  function startEditing(entry: ProfileEntry) {
    setEditingEntryId(entry.id);
    setStatus(entry.status);
    setRatingValue(entry.ratingValue ?? "");
    setReviewText(entry.reviewText ?? "");
    setEntryMessage(entry.id, "");
  }

  async function saveEntry(entry: ProfileEntry) {
    setSaving(true);
    setEntryMessage(entry.id, "");

    try {
      const res = await fetch("/api/entries", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entryId: entry.id,
          status,
          ratingValue: ratingValue === "" ? null : ratingValue,
          reviewText,
        }),
      });

      const data = await safeJson(res);

      if (!res.ok) {
        setEntryMessage(entry.id, data?.error || "Failed to save entry.");
        return;
      }

      setEditingEntryId(null);
      router.refresh();
    } catch (error) {
      setEntryMessage(
        entry.id,
        error instanceof Error ? error.message : "Failed to save entry."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(entry: ProfileEntry) {
    const confirmed = window.confirm(
      `Delete your entry for "${entry.media.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setSaving(true);
    setEntryMessage(entry.id, "");

    try {
      const params = new URLSearchParams({
        entryId: String(entry.id),
      });

      const res = await fetch(`/api/entries?${params.toString()}`, {
        method: "DELETE",
      });

      const data = await safeJson(res);

      if (!res.ok) {
        setEntryMessage(entry.id, data?.error || "Failed to delete entry.");
        return;
      }

      router.refresh();
    } catch (error) {
      setEntryMessage(
        entry.id,
        error instanceof Error ? error.message : "Failed to delete entry."
      );
    } finally {
      setSaving(false);
    }
  }

  if (entries.length === 0) {
    return <p>No entries yet.</p>;
  }

  return (
    <div>
      <style>{`
        .profile-entry-actions {
          opacity: 0;
          pointer-events: none;
          transform: translateY(-2px);
          transition: opacity 140ms ease, transform 140ms ease;
        }

        .profile-entry-card:hover .profile-entry-actions,
        .profile-entry-card:focus-within .profile-entry-actions {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
        }
      `}</style>

      {entries.map((entry) => {
        const isEditing = editingEntryId === entry.id;
        const message = messageByEntry[entry.id];

        return (
          <article
            key={entry.id}
            className="profile-entry-card"
            style={{
              border: "1px solid var(--app-border)",
              padding: 16,
              marginBottom: 16,
              borderRadius: 12,
              display: "flex",
              gap: 18,
              alignItems: "flex-start",
              background: "var(--app-surface-strong)",
            }}
          >
            <a href={`/media/${entry.media.id}`} style={{ textDecoration: "none" }}>
              <MediaCoverCard media={entry.media} />
            </a>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 16,
                  alignItems: "flex-start",
                }}
              >
                <div>
                  <h3 style={{ marginTop: 0, marginBottom: 4 }}>
                    <a href={`/media/${entry.media.id}`}>{entry.media.title}</a>
                  </h3>

                  <MediaMeta media={entry.media} />
                </div>

                {isOwnProfile ? (
                  <div
                    className="profile-entry-actions"
                    style={{ display: "flex", gap: 8, flexShrink: 0 }}
                  >
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => startEditing(entry)}
                      style={{
                        padding: "7px 11px",
                        borderRadius: 999,
                        border: "1px solid var(--app-border)",
                        background: "white",
                        fontWeight: 800,
                        cursor: saving ? "not-allowed" : "pointer",
                      }}
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => deleteEntry(entry)}
                      style={{
                        padding: "7px 11px",
                        borderRadius: 999,
                        border: "1px solid #b00020",
                        background: "white",
                        color: "#b00020",
                        fontWeight: 800,
                        cursor: saving ? "not-allowed" : "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>

              {isEditing ? (
                <div
                  style={{
                    marginTop: 14,
                    border: "1px solid var(--app-border)",
                    borderRadius: 12,
                    padding: 12,
                    background: "rgba(255,255,255,0.62)",
                  }}
                >
                  <label style={{ display: "block", fontWeight: 800, fontSize: 13 }}>
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    disabled={saving}
                    style={{
                      marginTop: 6,
                      width: "100%",
                      maxWidth: 260,
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid var(--app-border)",
                    }}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <label
                    style={{
                      display: "block",
                      fontWeight: 800,
                      fontSize: 13,
                      marginTop: 12,
                    }}
                  >
                    Rating
                  </label>

                  <select
                    value={ratingValue}
                    onChange={(event) =>
                      setRatingValue(
                        event.target.value === "" ? "" : Number(event.target.value)
                      )
                    }
                    disabled={saving}
                    style={{
                      marginTop: 6,
                      width: "100%",
                      maxWidth: 260,
                      padding: 8,
                      borderRadius: 8,
                      border: "1px solid var(--app-border)",
                    }}
                  >
                    <option value="">No rating</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <option key={value} value={value}>
                        {value}/10
                      </option>
                    ))}
                  </select>

                  <label
                    style={{
                      display: "block",
                      fontWeight: 800,
                      fontSize: 13,
                      marginTop: 12,
                    }}
                  >
                    Review
                  </label>

                  <textarea
                    value={reviewText}
                    onChange={(event) => setReviewText(event.target.value)}
                    disabled={saving}
                    rows={4}
                    style={{
                      marginTop: 6,
                      width: "100%",
                      boxSizing: "border-box",
                      padding: 10,
                      borderRadius: 10,
                      border: "1px solid var(--app-border)",
                      font: "inherit",
                      resize: "vertical",
                    }}
                  />

                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => saveEntry(entry)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 999,
                        border: "1px solid #111",
                        background: "#111",
                        color: "white",
                        fontWeight: 900,
                        cursor: saving ? "not-allowed" : "pointer",
                      }}
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => setEditingEntryId(null)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 999,
                        border: "1px solid var(--app-border)",
                        background: "white",
                        fontWeight: 900,
                        cursor: saving ? "not-allowed" : "pointer",
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p style={{ marginTop: 12, marginBottom: 0 }}>
                    Status: <strong>{entry.status}</strong>
                  </p>

                  {entry.ratingValue !== null && (
                    <p style={{ marginTop: 8, marginBottom: 0 }}>
                      Rating: <strong>{entry.ratingValue}/10</strong>
                    </p>
                  )}

                  {entry.reviewText && (
                    <p
                      style={{
                        marginTop: 12,
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.45,
                      }}
                    >
                      {entry.reviewText}
                    </p>
                  )}

                  <div style={{ marginTop: 12 }}>
                    <a href={`/media/${entry.media.id}`}>View Media</a>
                  </div>
                </>
              )}

              {message ? (
                <p style={{ color: "#b00020", fontWeight: 800 }}>{message}</p>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
