import Header from "@/components/Header";
import CategoryBar from "@/components/CategoryBar";
import Link from "next/link";

export default function Login() {
  return (
    <div>
        <Header />
        <CategoryBar />
      <div style={{ textAlign: "center", padding: 40 }}>
        <h2>Login</h2>
        <p>Don't have an account? <Link href="/signup">Sign up</Link></p><br />

        <input placeholder="Email" /><br /><br />
        <input placeholder="Password" /><br /><br />

        <button style={{ background: "#f28b82", padding: "8px 20px" }}>
          Sign In
        </button>
      </div>
    </div>
  );
}