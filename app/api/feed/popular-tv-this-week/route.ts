import { NextResponse } from "next/server";

type TmdbShow = {
  id: number;
  name?: string;
  title?: string;
  overview?: string;
  first_air_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
};

function tmdbImage(path: string | null | undefined) {
  if (!path) return null;
  return `https://image.tmdb.org/t/p/w500${path}`;
}

async function tmdbFetch(path: string) {
  const accessToken = process.env.TMDB_ACCESS_TOKEN;
  const apiKey = process.env.TMDB_API_KEY;

  const url = new URL(`https://api.themoviedb.org/3/${path}`);

  const headers: Record<string, string> = {
    accept: "application/json",
  };

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  } else if (apiKey) {
    url.searchParams.set("api_key", apiKey);
  } else {
    throw new Error("TMDB_ACCESS_TOKEN or TMDB_API_KEY is missing.");
  }

  const response = await fetch(url.toString(), {
    headers,
    next: {
      revalidate: 3600,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`TMDB TV popular request failed: ${response.status} ${body}`);
  }

  return response.json();
}

export async function GET() {
  try {
    const pages = await Promise.all([
      tmdbFetch("trending/tv/week?language=en-US&page=1"),
      tmdbFetch("trending/tv/week?language=en-US&page=2"),
    ]);

    const shows: TmdbShow[] = pages.flatMap((page) =>
      Array.isArray(page?.results) ? page.results : []
    );

    const seen = new Set<number>();

    const popularShows = shows
      .filter((show) => show.id && (show.name || show.title))
      .filter((show) => {
        if (seen.has(show.id)) return false;

        seen.add(show.id);
        return true;
      })
      .slice(0, 40)
      .map((show, index) => {
        const rating =
          typeof show.vote_average === "number"
            ? Math.round(show.vote_average)
            : null;

        return {
          id: show.id,
          eventType: "POPULAR",
          bodyText: show.overview || "Popular on TMDB this week.",
          ratingValue: rating,
          createdAt: new Date().toISOString(),
          entry: {
            id: show.id,
            status: "POPULAR",
            reviewText: show.overview || null,
            user: {
              id: "tmdb",
              username: "tmdb",
              displayName: "TMDB",
              avatarUrl: null,
            },
            media: {
              id: show.id,
              provider: "TMDB",
              externalId: String(show.id),
              type: "SHOW",
              title: show.name || show.title || "Untitled",
              releaseDate: show.first_air_date || null,
              coverUrl: tmdbImage(show.poster_path),
              backdropUrl: tmdbImage(show.backdrop_path),
              movieDetails: null,
              showDetails: {
                seasonsCount: null,
                episodesCount: null,
                showStatus: null,
              },
              bookDetails: null,
              albumDetails: null,
              gameDetails: null,
              tmdbRank: index + 1,
              tmdbVoteAverage: show.vote_average ?? null,
              tmdbVoteCount: show.vote_count ?? null,
              tmdbPopularity: show.popularity ?? null,
            },
          },
        };
      });

    return NextResponse.json(popularShows);
  } catch (error) {
    console.error("TMDB popular TV this week error:", error);

    return NextResponse.json([]);
  }
}
