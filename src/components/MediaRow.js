import Link from "next/link";

export default function MediaRow({ items = [] }) {
  if (!items.length) return <p>No media yet</p>;

  return (
    <div className="media-row">
      {items.map((item) => (
        <Link
          key={item.id}
          href={`/media/${item.id}`}
          className="media-link"
        >
          <div className="media-card">
            <p className="title">{item.title}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}