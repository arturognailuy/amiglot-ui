"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

export default function EmptyState() {
  const t = useTranslations("dashboard.empty");

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed p-12 text-center">
      <span className="text-4xl">🔍</span>
      <h2 className="text-lg font-semibold">{t("title")}</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        {t("description")}
      </p>
      <Button asChild className="rounded-full">
        <Link href="/profile">{t("editProfile")}</Link>
      </Button>
    </div>
  );
}
