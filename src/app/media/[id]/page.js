"use client";

import { useState } from "react";
import AddToListModal from "@/components/AddToListModal";

export default function MediaPage() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div style={{ padding: 20, display: "flex", gap: 20 }}>
        <div style={{ width: 120, height: 180, background: "#90caf9" }} />

        <div style={{ flex: 1 }}>
          <h2>Media Title (2026)</h2>
          <p>No description yet.</p>

          <button onClick={() => setOpen(true)}>
            Add to List
          </button>

          <h3>Other info</h3>
          <p>No data yet</p>
        </div>

        <div style={{ width: 300 }}>
          <h3>Reviews</h3>
          <p>No reviews yet</p>
        </div>
      </div>

      <AddToListModal
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}