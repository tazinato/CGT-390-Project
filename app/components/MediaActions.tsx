"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

async function safeJson(res: Response) {
  const text = await res.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

type Props = {
  mediaId: string;
  mediaType: string;
  existingEntry?: {
    id?: string;
    status?: string | null;
    rating?: number | null;
    review?: string | null;
  } | null;
};

function getCopy(type: string) {
  if (type === "MOVIE") {
    return {
      wishlist: "Want to watch",
      inProgress: null,
      completed: "Watched",
      review: "Review movie",
      placeholder: "What did you think of this movie?",
    };
  }

  if (type === "SHOW") {
    return {
      wishlist: "Want to watch",
      inProgress: "Watching",
      completed: "Watched",
      review: "Review show",
      placeholder: "What did you think of this show?",
    };
  }

  if (type === "BOOK") {
    return {
      wishlist: "Want to read",
      inProgress: "Reading",
      completed: "Read",
      review: "Review book",
      placeholder: "What did you think of this book?",
    };
  }

  if (type === "ALBUM") {
    return {
      wishlist: "Want to listen",
      inProgress: null,
      completed: "Listened",
      review: "Review album",
      placeholder: "What did you think of this album?",
    };
  }

  if (type === "GAME") {
    return {
      wishlist: "Want to play",
      inProgress: "Playing",
      completed: "Played",
      review: "Review game",
      placeholder: "What did you think of this game?",
    };
  }

  return {
    wishlist: "Want to check out",
    inProgress: "In progress",
    completed: "Done",
    review: "Review",
    placeholder: "What did you think?",
  };
}

export default function MediaActions({
  mediaId,
  mediaType,
  existingEntry = null,
}: Props) {
  const router = useRouter();
  const copy = getCopy(mediaType);

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(existingEntry?.status || "");
  const [rating, setRating] = useState(existingEntry?.rating || 0);
  const [review, setReview] = useState(existingEntry?.review || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function save(nextStatus = status || "COMPLETED") {
    setSaving(true);
    setMessage("");

    try {
      const numericMediaId = Number(mediaId);

      if (!Number.isInteger(numericMediaId) || numericMediaId <= 0) {
        throw new Error("Invalid media item.");
      }

      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mediaId: numericMediaId,
          status: nextStatus,
          ratingValue: rating || null,
          reviewText: review.trim() || null,
        }),
      });

      const data = await safeJson(response);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Please log in to add, rate, or review this.");
        }

        throw new Error(data?.error || data?.message || "Failed to save entry.");
      }

      setStatus(nextStatus);
      setMessage("Saved.");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  function StatusButton({ value, label }: { value: string; label: string }) {
    const active = status === value;

    return (
      <button
        type="button"
        disabled={saving}
        onClick={() => save(value)}
        style={{
          padding: "8px 12px",
          borderRadius: 8,
          border: active ? "1px solid #ff7f7a" : "1px solid #ddd",
          background: active ? "#ffe2df" : "#fff",
          color: "#111",
          fontWeight: active ? 700 : 600,
          fontSize: 13,
          cursor: saving ? "not-allowed" : "pointer",
        }}
      >
        {active ? "✓ " : ""}
        {label}
      </button>
    );
  }

  return (
    <section
      className="media-actions-root"
      style={{
        marginTop: 0,
        width: "100%",
        maxWidth: "none",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        style={{
          padding: "10px 14px",
          borderRadius: 8,
          border: "1px solid #ff7f7a",
          background: open ? "#ff7f7a" : "#ffe2df",
          color: open ? "white" : "#111",
          fontWeight: 700,
          fontSize: 14,
          cursor: "pointer",
        }}
      >
        {open ? "Close Log" : "Add / Rate / Review"}
      </button>

      {open ? (
        <div
          className="media-actions-panel"
          style={{
            marginTop: 12,
            border: "1px solid #ddd",
            borderRadius: 14,
            padding: 16,
            background: "#fff",
            width: "100%",
            maxWidth: "none",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) 280px",
              gap: 18,
              alignItems: "start",
            }}
          >
            <div
              style={{
                minWidth: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 8,
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                <StatusButton value="WISHLIST" label={copy.wishlist} />

                {copy.inProgress ? (
                  <StatusButton value="IN_PROGRESS" label={copy.inProgress} />
                ) : null}

                <StatusButton value="COMPLETED" label={copy.completed} />
              </div>

              <label
                htmlFor="review-text"
                style={{
                  display: "block",
                  fontWeight: 700,
                  fontSize: 14,
                  marginBottom: 6,
                }}
              >
                {copy.review}
              </label>

              <textarea
                id="review-text"
                value={review}
                onChange={(event) => setReview(event.target.value)}
                rows={5}
                disabled={saving}
                placeholder={copy.placeholder}
                style={{
                  display: "block",
                  width: "100%",
                  boxSizing: "border-box",
                  padding: 10,
                  borderRadius: 8,
                  border: "1px solid #ddd",
                  font: "inherit",
                  fontSize: 14,
                  lineHeight: 1.4,
                  resize: "vertical",
                  minHeight: 120,
                  background: saving ? "#f6f6f6" : "#fff",
                }}
              />
            </div>

            <div
              style={{
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: 14,
                alignItems: "flex-start",
              }}
            >
              <div>
                <strong
                  style={{
                    display: "block",
                    fontSize: 14,
                    marginBottom: 8,
                  }}
                >
                  Rating: {rating ? `${rating}/10` : "Not rated"}
                </strong>

                <div
                  style={{
                    display: "flex",
                    gap: 6,
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-label={`Rate ${value} out of 10`}
                      title={`${value}/10`}
                      disabled={saving}
                      onClick={() => setRating(value)}
                      style={{
                        width: 16,
                        height: 16,
                        borderRadius: 999,
                        border:
                          rating === value
                            ? "2px solid #d95d59"
                            : "1px solid #ccc",
                        background: rating >= value ? "#ff7f7a" : "#fff",
                        cursor: saving ? "not-allowed" : "pointer",
                        padding: 0,
                      }}
                    />
                  ))}
                </div>

                {rating ? (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setRating(0)}
                    style={{
                      marginTop: 8,
                      padding: 0,
                      border: 0,
                      background: "transparent",
                      color: "#d95d59",
                      cursor: saving ? "not-allowed" : "pointer",
                      fontSize: 13,
                      fontWeight: 600,
                      textDecoration: "underline",
                    }}
                  >
                    Clear rating
                  </button>
                ) : null}
              </div>

              <button
                className="media-actions-save"
                type="button"
                disabled={saving}
                onClick={() => save()}
                style={{
                  padding: "10px 16px",
                  borderRadius: 8,
                  border: "1px solid #ff7f7a",
                  background: saving ? "#f0b7b3" : "#ff7f7a",
                  color: "white",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {message ? (
            <p
              style={{
                color: message === "Saved." ? "#2f7d32" : "#555",
                margin: "12px 0 0",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {message}
            </p>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
