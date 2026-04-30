import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const mediaInclude = {
  movieDetails: true,
  showDetails: true,
  bookDetails: true,
  albumDetails: true,
  gameDetails: true,
};

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { error: "Please log in to choose favorites." },
      { status: 401 }
    );
  }

  const entries = await prisma.userMediaEntry.findMany({
    where: {
      userId: currentUser.id,
    },
    include: {
      media: {
        include: mediaInclude,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return NextResponse.json(
    entries.map((entry) => ({
      entryId: entry.id,
      status: entry.status,
      ratingValue: entry.ratingValue,
      updatedAt: entry.updatedAt,
      media: entry.media,
    }))
  );
}
