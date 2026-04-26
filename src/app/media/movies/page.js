import Header from "@/components/Header";
import CategoryBar from "@/components/CategoryBar";
import MediaRow from "@/components/MediaRow";

export default function Movies() {
  return (
    <div>
      <Header />
      <CategoryBar />

    <div>
          <div className="content search-page">
      <div style={{ padding: 20 }}>
        <h2>Movies</h2>

        <input placeholder="Search..." />

        <div style={{ marginTop: 10 }}>
          Filter By:
          <select><option>Genre</option></select>
          <select><option>Year</option></select>
          <select><option>Popular</option></select>
          <select><option>Rating</option></select>
        </div>

        <h3>Recently Added</h3>
        <MediaRow />

        <h3>Popular</h3>
        <MediaRow />
      </div>
    </div>
    </div>
    </div>
  );
}