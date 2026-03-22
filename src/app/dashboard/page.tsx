import { cookies, headers } from "next/headers";

import { LOCALE_COOKIE } from "@/i18n/locale";

import DashboardContent from "./dashboard-content";
import type { DiscoverResponse } from "./discovery-types";

type ApiErrorShape = {
  error?: {
    code?: string;
    message?: string;
  };
  detail?: string;
  message?: string;
  title?: string;
};

type InitialDiscoverResult = {
  fetched: boolean;
  data?: DiscoverResponse | null;
  error?: string | null;
  errorStatus?: number | null;
};

const API_BASE = "/api/v1";

async function getInitialMatches(): Promise<InitialDiscoverResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("amiglot_access_token")?.value;
  const userId = cookieStore.get("amiglot_user_id")?.value;

  if (!token || !userId) {
    return { fetched: false };
  }

  const headerList = await headers();
  const locale = cookieStore.get(LOCALE_COOKIE)?.value;
  const acceptLanguage = locale ?? headerList.get("accept-language") ?? "en";
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") ?? "http";
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (host ? `${proto}://${host}` : "http://localhost:3000");

  const response = await fetch(`${baseUrl}${API_BASE}/matches/discover?limit=20`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Accept-Language": acceptLanguage,
      Authorization: `Bearer ${token}`,
      "X-User-Id": userId,
    },
    cache: "no-store",
  });

  const data = (await response.json().catch(() => ({}))) as
    | ApiErrorShape
    | DiscoverResponse;

  if (!response.ok) {
    const message =
      (data as ApiErrorShape)?.error?.message ??
      (data as ApiErrorShape)?.detail ??
      (data as ApiErrorShape)?.message ??
      `Request failed (${response.status})`;
    return { fetched: true, error: message, errorStatus: response.status };
  }

  return { fetched: true, data: data as DiscoverResponse };
}

export default async function DashboardPage() {
  const { data, error, errorStatus, fetched } = await getInitialMatches();
  return (
    <DashboardContent
      initialData={data}
      initialError={error}
      initialErrorStatus={errorStatus}
      initialFetched={fetched}
    />
  );
}
