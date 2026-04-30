import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

function isValidSlot(slotNumber: number) {
  return Number.isInteger(slotNumber) && slotNumber >= 1 && slotNumber <= 4;
}

const mediaInclude = {
  movieDetails: true,
  showDetails: true,
  bookDetails: true,
  albumDetails: true,
  gameDetails: true,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { error: "userId is required." },
      { status: 400 }
    );
  }

  const favorites = await prisma.userProfileFavorite.findMany({
    where: {
      userId,
    },
    include: {
      media: {
        include: mediaInclude,
      },
    },
    orderBy: {
      slotNumber: "asc",
    },
  });

  return NextResponse.json(favorites);
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { error: "Please log in to edit your favorites." },
      { status: 401 }
    );
  }

  const body = await request.json();

  const userId = currentUser.id;
  const mediaId = Number(body.mediaId);
  const slotNumber = Number(body.slotNumber);

  if (!mediaId || !slotNumber) {
    return NextResponse.json(
      { error: "mediaId and slotNumber are required." },
      { status: 400 }
    );
  }

  if (!isValidSlot(slotNumber)) {
    return NextResponse.json(
      { error: "slotNumber must be between 1 and 4." },
      { status: 400 }
    );
  }

  const entry = await prisma.userMediaEntry.findUnique({
    where: {
      userId_mediaId: {
        userId,
        mediaId,
      },
    },
    select: {
      id: true,
    },
  });

  if (!entry) {
    return NextResponse.json(
      { error: "You can only add media you have already logged." },
      { status: 400 }
    );
  }

  const favorite = await prisma.$transaction(async (tx) => {
    await tx.userProfileFavorite.deleteMany({
      where: {
        userId,
        mediaId,
        NOT: {
          slotNumber,
        },
      },
    });

    return tx.userProfileFavorite.upsert({
      where: {
        userId_slotNumber: {
          userId,
          slotNumber,
        },
      },
      update: {
        mediaId,
      },
      create: {
        userId,
        slotNumber,
        mediaId,
      },
      include: {
        media: {
          include: mediaInclude,
        },
      },
    });
  });

  return NextResponse.json(favorite);
}

export async function DELETE(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { error: "Please log in to edit your favorites." },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const slotNumber = Number(searchParams.get("slotNumber"));

  if (!isValidSlot(slotNumber)) {
    return NextResponse.json(
      { error: "Valid slotNumber is required." },
      { status: 400 }
    );
  }

  await prisma.userProfileFavorite.deleteMany({
    where: {
      userId: currentUser.id,
      slotNumber,
    },
  });

  return NextResponse.json({
    deleted: true,
  });
}
