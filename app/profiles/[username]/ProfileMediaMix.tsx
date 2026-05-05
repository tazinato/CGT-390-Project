"use client";

import { useEffect, useMemo, useState } from "react";

type Media = {
  type: string;
};

type ProfileEntry = {
  media: Media;
};

type Props = {
  entries: ProfileEntry[];
};

const DURATION_MS = 850;

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

export default function ProfileMediaMix({ entries }: Props) {
  const [progress, setProgress] = useState(0);

  const types = useMemo(() => ["MOVIE", "SHOW", "BOOK", "ALBUM", "GAME"], []);

  const labels: Record<string, string> = {
    MOVIE: "Movies",
    SHOW: "TV",
    BOOK: "Books",
    ALBUM: "Albums",
    GAME: "Games",
  };

  const counts = types.map((type) => ({
    type,
    label: labels[type],
    count: entries.filter((entry) => entry.media.type === type).length,
  }));

  const maxCount = Math.max(...counts.map((item) => item.count), 1);
  const animatedProgress = easeOutCubic(progress);

  const center = 88;
  const radius = 54;

  useEffect(() => {
    let animationFrame = 0;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const nextProgress = Math.min(elapsed / DURATION_MS, 1);

      setProgress(nextProgress);

      if (nextProgress < 1) {
        animationFrame = requestAnimationFrame(tick);
      }
    }

    animationFrame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(animationFrame);
  }, [entries.length]);

  function pointFor(index: number, value: number) {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / counts.length;
    const scaledRadius = radius * (value / maxCount) * animatedProgress;

    return {
      x: center + Math.cos(angle) * scaledRadius,
      y: center + Math.sin(angle) * scaledRadius,
    };
  }

  function gridPointFor(index: number, value: number) {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / counts.length;
    const scaledRadius = radius * (value / maxCount);

    return {
      x: center + Math.cos(angle) * scaledRadius,
      y: center + Math.sin(angle) * scaledRadius,
    };
  }

  function outerPointFor(index: number, extra = 0) {
    const angle = -Math.PI / 2 + (index * Math.PI * 2) / counts.length;

    return {
      x: center + Math.cos(angle) * (radius + extra),
      y: center + Math.sin(angle) * (radius + extra),
    };
  }

  const polygonPoints = counts
    .map((item, index) => {
      const point = pointFor(index, item.count);
      return `${point.x},${point.y}`;
    })
    .join(" ");

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <aside
      style={{
        border: "1px solid #ddd",
        borderRadius: 14,
        background: "#fff",
        padding: 18,
        width: "100%",
        maxWidth: 430,
        boxSizing: "border-box",
        justifySelf: "end",
        alignSelf: "start",
        display: "grid",
        gridTemplateColumns: "150px 1fr",
        gap: 14,
        alignItems: "center",
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: 20,
          }}
        >
          Media Mix
        </h2>

        <p
          style={{
            margin: "6px 0 14px",
            color: "#666",
            fontSize: 13,
          }}
        >
          Logs by media type
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "7px 12px",
            fontSize: 13,
          }}
        >
          {counts.map((item) => (
            <div key={item.type} style={{ display: "contents" }}>
              <span style={{ color: "#555" }}>{item.label}</span>

              <strong
                style={{
                  color: "#d95d59",
                }}
              >
                {Math.round(item.count * animatedProgress)}
              </strong>
            </div>
          ))}
        </div>
      </div>

      <svg
        viewBox="0 0 176 176"
        role="img"
        aria-label="Radar chart showing logs by media type"
        style={{
          width: "100%",
          maxWidth: 190,
          display: "block",
          justifySelf: "center",
        }}
      >
        {gridLevels.map((level) => {
          const gridPoints = counts
            .map((_, index) => {
              const point = gridPointFor(index, maxCount * level);
              return `${point.x},${point.y}`;
            })
            .join(" ");

          return (
            <polygon
              key={level}
              points={gridPoints}
              fill="none"
              stroke="#dddddd"
              strokeWidth="1"
            />
          );
        })}

        {counts.map((_, index) => {
          const outer = outerPointFor(index);

          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#dddddd"
              strokeWidth="1"
            />
          );
        })}

        <polygon
          points={polygonPoints}
          fill="rgba(255, 127, 122, 0.22)"
          stroke="#ff7f7a"
          strokeWidth="2"
          style={{
            transition: "points 120ms linear",
          }}
        />

        {counts.map((item, index) => {
          const point = pointFor(index, item.count);
          const labelPoint = outerPointFor(index, 15);

          return (
            <g key={item.type}>
              <circle cx={point.x} cy={point.y} r="4" fill="#ff7f7a" />

              <text
                x={labelPoint.x}
                y={labelPoint.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="9"
                fontWeight="700"
                fill="#111"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </aside>
  );
}
