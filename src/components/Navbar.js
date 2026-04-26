import Link from "next/link";

export default function Navbar() {
    return (
        <div className="navbar">
            <h2>Logo/Website Name</h2>

            <div>
                <Link href="/login">Sign In</Link>{" "}
                <Link href="/signup">Sign Up</Link>
            </div>
        </div>
    );
}