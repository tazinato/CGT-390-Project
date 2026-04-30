import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EntryStatus, LogEventType } from "@prisma/client";
import { NextResponse } from "next/server";

function getEventType({
  previousEntryExists,
  status,
  ratingValue,
  reviewText,
}: {
  previousEntryExists: boolean;
  status: EntryStatus;
  ratingValue: number | null;
  reviewText: string | null;
}) {
  if (!previousEntryExists) {
    return LogEventType.ADDED;
  }

  if (reviewText && reviewText.trim().length > 0) {
    return LogEventType.REVIEWED;
  }

  if (ratingValue !== null) {
    return LogEventType.RATED;
  }

  if (status === EntryStatus.COMPLETED) {
    return LogEventType.COMPLETED;
  }

  if (status === EntryStatus.IN_PROGRESS) {
    return LogEventType.STARTED;
  }

  return LogEventType.UPDATED;
}

function isEntryStatus(value: unknown): value is EntryStatus {
  return (
    value === EntryStatus.WISHLIST ||
    value === EntryStatus.IN_PROGRESS ||
    value === EntryStatus.COMPLETED ||
    value === EntryStatus.PAUSED ||
    value === EntryStatus.DROPPED
  );
}

function parseRating(value: unknown) {
  if (value === null || value === "" || value === undefined) {
    return null;
  }

  return Number(value);
}

function parseReview(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function validateRating(ratingValue: number | null) {
  return (
    ratingValue === null ||
    (Number.isInteger(ratingValue) && ratingValue >= 1 && ratingValue <= 10)
  );
}

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Please log in to add, rate, or review this." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const userId = currentUser.id;
    const mediaId = Number(body.mediaId);
    const status = body.status as EntryStatus;
    const ratingValue = parseRating(body.ratingValue);
    const reviewText = parseReview(body.reviewText);

    if (!Number.isInteger(mediaId) || mediaId <= 0) {
      return NextResponse.json(
        { error: "mediaId is required." },
        { status: 400 }
      );
    }

    if (!isEntryStatus(status)) {
      return NextResponse.json(
        { error: "Valid status is required." },
        { status: 400 }
      );
    }

    if (!validateRating(ratingValue)) {
      return NextResponse.json(
        { error: "Rating must be a whole number from 1 to 10." },
        { status: 400 }
      );
    }

    const media = await prisma.mediaItem.findUnique({
      where: { id: mediaId },
      select: { id: true },
    });

    if (!media) {
      return NextResponse.json(
        { error: "Media item not found." },
        { status: 404 }
      );
    }

    const existingEntry = await prisma.userMediaEntry.findUnique({
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

    const eventType = getEventType({
      previousEntryExists: Boolean(existingEntry),
      status,
      ratingValue,
      reviewText,
    });

    const result = await prisma.$transaction(async (tx) => {
      const entry = await tx.userMediaEntry.upsert({
        where: {
          userId_mediaId: {
            userId,
            mediaId,
          },
        },
        update: {
          status,
          ratingValue,
          reviewText,
          lastActivityAt: new Date(),
        },
        create: {
          userId,
          mediaId,
          status,
          ratingValue,
          reviewText,
          lastActivityAt: new Date(),
        },
        include: {
          media: true,
          user: true,
        },
      });

      const logEvent = await tx.userMediaLogEvent.create({
        data: {
          entryId: entry.id,
          mediaId,
          userId,
          eventType,
          bodyText: reviewText,
          ratingValue,
          details: {
            status,
          },
        },
      });

      return {
        entry,
        logEvent,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Entry route error:", error);

    return NextResponse.json(
      {
        error: "Internal entry error.",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Please log in to edit entries." },
        { status: 401 }
      );
    }

    const body = await request.json();

    const entryId = Number(body.entryId);
    const status = body.status as EntryStatus;
    const ratingValue = parseRating(body.ratingValue);
    const reviewText = parseReview(body.reviewText);

    if (!Number.isInteger(entryId) || entryId <= 0) {
      return NextResponse.json(
        { error: "entryId is required." },
        { status: 400 }
      );
    }

    if (!isEntryStatus(status)) {
      return NextResponse.json(
        { error: "Valid status is required." },
        { status: 400 }
      );
    }

    if (!validateRating(ratingValue)) {
      return NextResponse.json(
        { error: "Rating must be a whole number from 1 to 10." },
        { status: 400 }
      );
    }

    const existingEntry = await prisma.userMediaEntry.findFirst({
      where: {
        id: entryId,
        userId: currentUser.id,
      },
      select: {
        id: true,
        mediaId: true,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Entry not found." },
        { status: 404 }
      );
    }

    const eventType = getEventType({
      previousEntryExists: true,
      status,
      ratingValue,
      reviewText,
    });

    const result = await prisma.$transaction(async (tx) => {
      const entry = await tx.userMediaEntry.update({
        where: {
          id: existingEntry.id,
        },
        data: {
          status,
          ratingValue,
          reviewText,
          lastActivityAt: new Date(),
        },
        include: {
          media: true,
          user: true,
        },
      });

      const logEvent = await tx.userMediaLogEvent.create({
        data: {
          entryId: entry.id,
          mediaId: entry.mediaId,
          userId: currentUser.id,
          eventType,
          bodyText: reviewText,
          ratingValue,
          details: {
            status,
            editedFromProfile: true,
          },
        },
      });

      return {
        entry,
        logEvent,
      };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Entry edit route error:", error);

    return NextResponse.json(
      {
        error: "Internal entry edit error.",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Please log in to delete entries." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const entryId = Number(searchParams.get("entryId"));

    if (!Number.isInteger(entryId) || entryId <= 0) {
      return NextResponse.json(
        { error: "Valid entryId is required." },
        { status: 400 }
      );
    }

    const existingEntry = await prisma.userMediaEntry.findFirst({
      where: {
        id: entryId,
        userId: currentUser.id,
      },
      select: {
        id: true,
        mediaId: true,
      },
    });

    if (!existingEntry) {
      return NextResponse.json(
        { error: "Entry not found." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.userMediaLogEvent.deleteMany({
        where: {
          entryId: existingEntry.id,
          userId: currentUser.id,
        },
      });

      await tx.userProfileFavorite.deleteMany({
        where: {
          userId: currentUser.id,
          mediaId: existingEntry.mediaId,
        },
      });

      await tx.userMediaEntry.delete({
        where: {
          id: existingEntry.id,
        },
      });
    });

    return NextResponse.json({
      deleted: true,
    });
  } catch (error) {
    console.error("Entry delete route error:", error);

    return NextResponse.json(
      {
        error: "Internal entry delete error.",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
