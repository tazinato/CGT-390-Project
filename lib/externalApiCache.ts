import { prisma } from "@/lib/prisma";

type CacheOptions<T> = {
  key: string;
  ttlMs: number;
  fetchFresh: () => Promise<T>;
};

export async function getOrSetExternalApiCache<T>({
  key,
  ttlMs,
  fetchFresh,
}: CacheOptions<T>): Promise<T> {
  const now = new Date();

  const cached = await prisma.externalApiCache.findUnique({
    where: {
      key,
    },
  });

  if (cached && cached.expiresAt > now) {
    console.log(`[ExternalApiCache] HIT ${key}`);
    return cached.value as T;
  }

  try {
    console.log(`[ExternalApiCache] MISS ${key}; fetching fresh data`);

    const freshValue = await fetchFresh();

    await prisma.externalApiCache.upsert({
      where: {
        key,
      },
      update: {
        value: freshValue as any,
        expiresAt: new Date(Date.now() + ttlMs),
      },
      create: {
        key,
        value: freshValue as any,
        expiresAt: new Date(Date.now() + ttlMs),
      },
    });

    console.log(`[ExternalApiCache] SAVED ${key}`);

    return freshValue;
  } catch (error) {
    if (cached) {
      console.warn(
        `[ExternalApiCache] STALE ${key}; refresh failed, serving stale cache`,
        error
      );

      return cached.value as T;
    }

    throw error;
  }
}
