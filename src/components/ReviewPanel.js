export default function ReviewsPanel() {
    return (
        <div>
            <h3>Recent Reviews</h3>

            {[1, 2, 3].map((i) => (
                <div key={i} className="review">
                    <div className="review-box" style={{background: "#64b5f6" }} />

                    <div>
                        <strong>Media Title</strong>
                        <p style={{margin: 0}}>No Reviews yet</p>
                    </div>
                </div>
            ))}
        </div>
    );
}