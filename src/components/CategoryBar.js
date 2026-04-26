import Link from "next/link";

export default function CategoryBar() {
    return (
        <div className="category-bar">
            <Link href="/media/movies">MOVIES</Link>
            <Link href="/media/tv">TV SHOWS</Link>
            <Link href="/media/games">VIDEO GAMES</Link>
            <Link href="/media/music">MUSIC</Link>
            <Link href="/media/books">BOOKS</Link>

            <input placeholder="Search" />
        </div>
    );
}