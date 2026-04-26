import Header from "@/components/Header";
import CategoryBar from "@/components/CategoryBar";
import Link from "next/link";

export default function Signup() {
  return (
    <div>
        <Header />
        <CategoryBar />
      <div style={{ textAlign: "center", padding: 40 }}>
        <h2>Create new Account</h2>
        <p>Already Registered? <Link href="/login">Login</Link></p><br />

        <input placeholder="Username" /><br /><br />
        <input placeholder="Email" /><br /><br />
        <input placeholder="Password" /><br /><br />

        <button style={{ background: "#f28b82", padding: "8px 20px" }}>
          Sign Up
        </button>
      </div>
    </div>
  );
}