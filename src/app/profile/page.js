import MediaRow from "@/components/MediaRow";

export default function Profile() {
  return (
    <div>
    
      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 60, height: 60, borderRadius: "50%", border: "2px solid black" }} />
          <div>
            <h3>@username</h3>
            <p>Bio</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
          <span>0 Followers</span>
          <span>0 Reviews</span>
          <span>0 Movies</span>
          <span>0 TV Shows</span>
          <span>0 Video Games</span>
          <span>0 Songs</span>
          <span>0 Books</span>
        </div>

        <h3>Top 5</h3>
        <MediaRow />

        <h3>Recent Activity</h3>
        <MediaRow />
      </div>
    </div>
  );
}