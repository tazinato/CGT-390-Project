import { NextResponse } from "next/server";

type RawgGame = {
  id: number;
  slug?: string;
  name?: string;
  released?: string | null;
  background_image?: string | null;
  rating?: number | null;
  ratings_count?: number | null;
  added?: number | null;
  metacritic?: number | null;
  playtime?: number | null;
  platforms?: Array<{
    platform?: {
      id?: number;
      name?: string;
      slug?: string;
    };
  }>;
  genres?: Array<{
    id?: number;
    name?: string;
    slug?: string;
  }>;
};

function secureImage(url?: string | null) {
  if (!url) return null;
  return url.replace("http://", "https://");
}

async function rawgFetch(path: string) {
  const apiKey = process.env.RAWG_API_KEY;

  if (!apiKey) {
    throw new Error("RAWG_API_KEY is missing.");
  }

  const url = new URL(`https://api.rawg.io/api/${path}`);

  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
    next: {
      revalidate: 3600,
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`RAWG popular games request failed: ${response.status} ${body}`);
  }

  return response.json();
}

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();

    const pages = await Promise.all([
      rawgFetch(
        `games?dates=${currentYear - 1}-01-01,${currentYear}-12-31&ordering=-added&page_size=40&page=1`
      ),
      rawgFetch(
        `games?dates=${currentYear - 2}-01-01,${currentYear}-12-31&ordering=-rating&page_size=40&page=1`
      ),
    ]);

    const games: RawgGame[] = pages.flatMap((page) =>
      Array.isArray(page?.results) ? page.results : []
    );

    const seen = new Set<number>();

    const popularGames = games
      .filter((game) => game.id && game.name)
      .filter((game) => {
        if (seen.has(game.id)) return false;

        seen.add(game.id);
        return true;
      })
      .sort((a, b) => {
        const aScore =
          (a.added ?? 0) +
          (a.ratings_count ?? 0) * 4 +
          (a.metacritic ?? 0) * 20 +
          (a.rating ?? 0) * 100;

        const bScore =
          (b.added ?? 0) +
          (b.ratings_count ?? 0) * 4 +
          (b.metacritic ?? 0) * 20 +
          (b.rating ?? 0) * 100;

        return bScore - aScore;
      })
      .slice(0, 40)
      .map((game, index) => {
        const platforms =
          game.platforms
            ?.map((item) => item.platform?.name)
            .filter((name): name is string => Boolean(name))
            .slice(0, 4) ?? [];

        const genres =
          game.genres
            ?.map((genre) => genre.name)
            .filter((name): name is string => Boolean(name))
            .slice(0, 4) ?? [];

        return {
          id: index + 1,
          eventType: "POPULAR",
          bodyText:
            genres.length > 0
              ? `Popular game. Genres: ${genres.join(", ")}.`
              : "Popular game on RAWG.",
          ratingValue:
            typeof game.rating === "number" ? Math.round(game.rating * 2) : null,
          createdAt: new Date().toISOString(),
          entry: {
            id: index + 1,
            status: "POPULAR",
            reviewText: null,
            user: {
              id: "rawg",
              username: "rawg",
              displayName: "RAWG",
              avatarUrl: null,
            },
            media: {
              id: game.id,
              provider: "RAWG",
              externalId: String(game.id),
              type: "GAME",
              title: game.name || "Untitled Game",
              releaseDate: game.released || null,
              coverUrl: secureImage(game.background_image),
              movieDetails: null,
              showDetails: null,
              bookDetails: null,
              albumDetails: null,
              gameDetails: {
                timeToBeatHours: game.playtime ?? null,
                multiplayer: null,
              },
              rawgRank: index + 1,
              rawgRating: game.rating ?? null,
              rawgRatingsCount: game.ratings_count ?? null,
              rawgAdded: game.added ?? null,
              rawgMetacritic: game.metacritic ?? null,
              rawgPlatforms: platforms,
              rawgGenres: genres,
            },
          },
        };
      });

    return NextResponse.json(popularGames);
  } catch (error) {
    console.error("RAWG popular games error:", error);

    return NextResponse.json([]);
  }
}
