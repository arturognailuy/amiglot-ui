"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { getAccessToken, getUserId } from "@/lib/session";
import { getJson } from "@/lib/api";
import type { DiscoverResponse, MatchItem } from "./discovery-types";
import MatchCard from "./components/match-card";
import MatchCardSkeleton from "./components/match-card-skeleton";
import EmptyState from "./components/empty-state";

type Props = {
  initialData?: DiscoverResponse | null;
  initialError?: string | null;
  initialErrorStatus?: number | null;
  initialFetched?: boolean;
};

export default function DashboardContent({
  initialData,
  initialError,
  initialErrorStatus,
  initialFetched,
}: Props) {
  const t = useTranslations("dashboard");
  const [items, setItems] = useState<MatchItem[]>(initialData?.items ?? []);
  const [nextCursor, setNextCursor] = useState<string | null>(
    initialData?.next_cursor ?? null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [errorStatus, setErrorStatus] = useState<number | null>(
    initialErrorStatus ?? null,
  );

  const token = useSyncExternalStore(
    (cb) => {
      if (typeof window === "undefined") return () => undefined;
      window.addEventListener("storage", cb);
      return () => window.removeEventListener("storage", cb);
    },
    () => getAccessToken(),
    () => null,
  );

  const userId = useSyncExternalStore(
    (cb) => {
      if (typeof window === "undefined") return () => undefined;
      window.addEventListener("storage", cb);
      return () => window.removeEventListener("storage", cb);
    },
    () => getUserId(),
    () => null,
  );

  const isMounted = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );

  // Client-side fetch if SSR didn't have cookies
  useEffect(() => {
    if (initialFetched || !token || !userId) return;

    let active = true;
    setLoading(true);
    getJson<DiscoverResponse>("/matches/discover?limit=20")
      .then((data) => {
        if (!active) return;
        setItems(data.items);
        setNextCursor(data.next_cursor);
        setError(null);
        setErrorStatus(null);
      })
      .catch((err) => {
        if (!active) return;
        setError(err.message ?? t("errors.networkError"));
        setErrorStatus(err.status ?? null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [initialFetched, token, userId, t]);

  const loadMore = useCallback(async () => {
    if (!nextCursor || loading) return;
    setLoading(true);
    try {
      const data = await getJson<DiscoverResponse>(
        `/matches/discover?limit=20&cursor=${encodeURIComponent(nextCursor)}`,
      );
      setItems((prev) => [...prev, ...data.items]);
      setNextCursor(data.next_cursor);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t("errors.networkError");
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [nextCursor, loading, t]);

  if (!isMounted) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Not signed in
  if (!token || !userId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">{t("title")}</h1>
        <p className="mb-4 text-muted-foreground">{t("errors.profileIncomplete")}</p>
        <Button asChild className="rounded-full">
          <Link href="/login">{t("signIn")}</Link>
        </Button>
      </div>
    );
  }

  // Profile incomplete (403)
  if (errorStatus === 403) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">{t("title")}</h1>
        <p className="mb-4 text-muted-foreground">{t("errors.profileIncomplete")}</p>
        <Button asChild className="rounded-full">
          <Link href="/profile">{t("empty.editProfile")}</Link>
        </Button>
      </div>
    );
  }

  // No target languages (422)
  if (errorStatus === 422) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">{t("title")}</h1>
        <p className="mb-4 text-muted-foreground">{t("errors.noTargetLanguages")}</p>
        <Button asChild className="rounded-full">
          <Link href="/profile">{t("empty.editProfile")}</Link>
        </Button>
      </div>
    );
  }

  // Generic error
  if (error && errorStatus !== 403 && errorStatus !== 422) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">{t("title")}</h1>
        <p className="mb-4 text-destructive">{t("errors.networkError")}</p>
        <Button
          onClick={() => window.location.reload()}
          className="rounded-full"
        >
          {t("retry")}
        </Button>
      </div>
    );
  }

  // Loading state (no initial data)
  if (!initialFetched && !initialData && loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>
        <p className="mb-4 text-sm text-muted-foreground">{t("loading")}</p>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <MatchCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">{t("title")}</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <MatchCard key={item.user_id} match={item} />
        ))}
      </div>
      {nextCursor && (
        <div className="mt-6 text-center">
          <Button
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            className="rounded-full"
          >
            {loading ? t("loading") : t("loadMore")}
          </Button>
        </div>
      )}
      {!nextCursor && items.length > 0 && (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          {t("noMoreResults")}
        </p>
      )}
    </div>
  );
}
