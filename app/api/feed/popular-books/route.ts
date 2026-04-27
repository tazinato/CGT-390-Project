import { NextResponse } from "next/server";

type GoogleBookVolume = {
  id: string;
  volumeInfo?: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    publishedDate?: string;
    description?: string;
    pageCount?: number;
    averageRating?: number;
    ratingsCount?: number;
    imageLinks?: {
      smallThumbnail?: string;
      thumbnail?: string;
    };
  };
};

function secureImage(url?: string | null) {
  if (!url) return null;
  return url.replace("http://", "https://");
}

function getBookTitle(info: GoogleBookVolume["volumeInfo"]) {
  if (!info?.title) return "Untitled Book";

  if (info.subtitle) {
    return `${info.title}: ${info.subtitle}`;
  }

  return info.title;
}

async function searchGoogleBooks(query: string) {
  const url = new URL("https://www.googleapis.com/books/v1/volumes");

  url.searchParams.set("q", query);
  url.searchParams.set("maxResults", "20");
  url.searchParams.set("printType", "books");
  url.searchParams.set("orderBy", "relevance");

  const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

  if (apiKey) {
    url.searchParams.set("key", apiKey);
  }

  const response = await fetch(url.toString(), {
    next: {
      revalidate: 3600,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("Google Books popular search failed:", response.status, body);
    return [];
  }

  const data = await response.json();

  return Array.isArray(data?.items) ? (data.items as GoogleBookVolume[]) : [];
}

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();

    const queries = [
      `subject:fiction ${currentYear}`,
      `subject:fantasy ${currentYear}`,
      `subject:mystery ${currentYear}`,
      `subject:romance ${currentYear}`,
      `subject:biography ${currentYear}`,
      `subject:history ${currentYear}`,
      `subject:science ${currentYear}`,
      `subject:young adult ${currentYear}`,
      `subject:fiction ${currentYear - 1}`,
    ];

    const pages: GoogleBookVolume[][] = [];

    for (const query of queries) {
      const books = await searchGoogleBooks(query);
      pages.push(books);
    }

    const books = pages.flat();
    const seen = new Set<string>();

    const popularBooks = books
      .filter((book) => book.id && book.volumeInfo?.title)
      .filter((book) => {
        if (seen.has(book.id)) return false;

        seen.add(book.id);
        return true;
      })
      .filter((book) => {
        const info = book.volumeInfo;
        const title = `${info?.title || ""} ${info?.subtitle || ""}`.toLowerCase();

        if (title.includes("notebook")) return false;
        if (title.includes("journal")) return false;
        if (title.includes("planner")) return false;
        if (title.includes("calendar")) return false;
        if (title.includes("log book")) return false;
        if (title.includes("composition book")) return false;
        if (title.includes("password book")) return false;

        return true;
      })
      .sort((a, b) => {
        const aInfo = a.volumeInfo;
        const bInfo = b.volumeInfo;

        const aRatings = aInfo?.ratingsCount ?? 0;
        const bRatings = bInfo?.ratingsCount ?? 0;

        const aRating = aInfo?.averageRating ?? 0;
        const bRating = bInfo?.averageRating ?? 0;

        return bRatings * 10 + bRating * 100 - (aRatings * 10 + aRating * 100);
      })
      .slice(0, 40)
      .map((book, index) => {
        const info = book.volumeInfo;
        const authors = info?.authors ?? [];
        const coverUrl =
          secureImage(info?.imageLinks?.thumbnail) ??
          secureImage(info?.imageLinks?.smallThumbnail);

        return {
          id: index + 1,
          eventType: "POPULAR",
          bodyText: info?.description || null,
          ratingValue:
            typeof info?.averageRating === "number"
              ? Math.round(info.averageRating * 2)
              : null,
          createdAt: new Date().toISOString(),
          entry: {
            id: index + 1,
            status: "POPULAR",
            reviewText: info?.description || null,
            user: {
              id: "google-books",
              username: "google-books",
              displayName: "Google Books",
              avatarUrl: null,
            },
            media: {
              id: index + 1,
              provider: "GOOGLE_BOOKS",
              externalId: book.id,
              type: "BOOK",
              title: getBookTitle(info),
              releaseDate: info?.publishedDate || null,
              coverUrl,
              movieDetails: null,
              showDetails: null,
              bookDetails: {
                pageCount: info?.pageCount ?? null,
              },
              albumDetails: null,
              gameDetails: null,
              googleBooksRank: index + 1,
              googleBooksAverageRating: info?.averageRating ?? null,
              googleBooksRatingsCount: info?.ratingsCount ?? null,
              googleBooksAuthors: authors,
            },
          },
        };
      });

    return NextResponse.json(popularBooks);
  } catch (error) {
    console.error("Google Books popular books error:", error);

    return NextResponse.json([]);
  }
}
