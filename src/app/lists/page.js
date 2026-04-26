export default function Lists() {
  return (
    <div>
      <div style={{ padding: 20 }}>
        <h2>My Lists</h2>

        <div style={{ display: "flex", gap: 10 }}>
          <button>All</button>
          <button>Finished</button>
          <button>Plan to Finish</button>
        </div>

        <table style={{ width: "100%", marginTop: 20 }}>
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Rating</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><div style={{ width: 40, height: 60, background: "#a5d6a7" }} /></td>
              <td>Media Title</td>
              <td>N/A</td>
              <td>Movie</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}