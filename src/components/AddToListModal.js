"use client";

import { useState } from "react";

export default function AddToListModal({ isOpen, onClose }) {
  const [status, setStatus] = useState("Finished");

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Add to List</h3>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option>Finished</option>
          <option>Watching</option>
          <option>Plan to Watch</option>
        </select>

        <p>Episodes: --/107</p>

        <h4>Leave a review?</h4>
        <textarea placeholder="Leave a review..." />

        <button className="submit">Submit</button>

        <button className="close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}