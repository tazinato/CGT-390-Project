import Header from "@/components/Header";
import CategoryBar from "@/components/CategoryBar";
import MediaRow from "@/components/MediaRow";
import ReviewsPanel from "@/components/ReviewPanel";

export default function Home() {
  return (
      <div>
        <Header />
        <CategoryBar />

        <div className="container">
          <div className="content">
            <div className="split">
              <div className="left">
                <h3>Popular This Week</h3>
                <MediaRow />

                <h3>New Releases</h3>
                <MediaRow />
              </div>

              <div className="right">
                <ReviewsPanel />
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}