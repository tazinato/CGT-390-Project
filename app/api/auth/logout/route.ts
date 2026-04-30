import { clearAuthSession, getAuthCookieName } from "@/lib/auth";
import { NextResponse } from "next/server";

function buildLoggedOutResponse() {
  const response = NextResponse.json({
    loggedOut: true,
  });

  response.cookies.set(getAuthCookieName(), "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}

export async function POST() {
  try {
    await clearAuthSession();
  } catch (error) {
    console.error("Logout error:", error);
  }

  return buildLoggedOutResponse();
}

export async function GET() {
  return POST();
}