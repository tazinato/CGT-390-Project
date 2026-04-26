import Link from "next/link";

export default function Header() {
    return (
        <div className="header">
            <Link href="/"><h2 >Logo/Website Name</h2></Link>
            <div>
                <Link href="/login">Sign In</Link>{" "}
                <Link href="/signup">Sign Up</Link>
            </div>
        </div>
    );
}