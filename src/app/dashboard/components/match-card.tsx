"use client";

import { useTranslations } from "next-intl";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { MatchItem, MatchLanguage, OverlapSlot } from "../discovery-types";

const LEVEL_KEYS = ["zero", "beginner", "elementary", "intermediate", "advanced", "native"] as const;

const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

function countryFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

function formatOverlap(minutes: number, t: ReturnType<typeof useTranslations>): string {
  if (minutes >= 60) {
    const hours = Math.round(minutes / 60);
    return t("card.overlapHours", { hours });
  }
  return t("card.overlapTime", { minutes });
}

function formatSlotTime(utcTime: string, weekday: number): string {
  // Parse HH:MM and create a Date for the next occurrence of that weekday
  const [h, m] = utcTime.split(":").map(Number);
  const now = new Date();
  const dayDiff = ((weekday - now.getUTCDay()) + 7) % 7;
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + dayDiff, h, m));
  return d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: false });
}

function LanguageList({
  label,
  languages,
  levelT,
}: {
  label: string;
  languages: MatchLanguage[];
  levelT: ReturnType<typeof useTranslations>;
}) {
  if (languages.length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {languages.map((l) => {
          const levelKey = LEVEL_KEYS[l.level] ?? "zero";
          return (
            <Badge key={l.language_code} variant="secondary">
              {l.language_code} · {levelT(levelKey)}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

function OverlapDisplay({
  slots,
  weekdayT,
  cardT,
}: {
  slots: OverlapSlot[];
  weekdayT: ReturnType<typeof useTranslations>;
  cardT: ReturnType<typeof useTranslations>;
}) {
  if (slots.length === 0) return null;
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">
        🕐 {cardT("card.yourTime")}
      </p>
      <div className="space-y-0.5 text-sm">
        {slots.map((s, i) => {
          const dayKey = WEEKDAY_KEYS[s.weekday];
          const start = formatSlotTime(s.start_utc, s.weekday);
          const end = formatSlotTime(s.end_utc, s.weekday);
          return (
            <p key={i}>
              {weekdayT(dayKey)} {start}–{end}
            </p>
          );
        })}
      </div>
    </div>
  );
}

type Props = {
  match: MatchItem;
};

export default function MatchCard({ match }: Props) {
  const t = useTranslations("dashboard");
  const levelT = useTranslations("profile.languageLevel");
  const weekdayT = useTranslations("profile.weekdays");

  const flag = match.country_code ? countryFlag(match.country_code) : "";
  const countryName = match.country_code
    ? (() => {
        try {
          return new Intl.DisplayNames(undefined, { type: "region" }).of(
            match.country_code,
          );
        } catch {
          return match.country_code;
        }
      })()
    : null;

  const subtitle = [
    flag,
    `@${match.handle}`,
    match.age != null ? String(match.age) : null,
    countryName,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{subtitle}</CardTitle>
        <p className="text-sm text-muted-foreground">
          🕐 {formatOverlap(match.total_overlap_minutes, t)}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <LanguageList
          label={`🎓 ${t("card.theyTeachYou")}`}
          languages={match.mutual_teach}
          levelT={levelT}
        />
        <LanguageList
          label={`📚 ${t("card.youTeachThem")}`}
          languages={match.mutual_learn}
          levelT={levelT}
        />
        {match.bridge_languages.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              🌉 {t("card.bridgeLanguage")}
            </p>
            <div className="flex flex-wrap gap-2">
              {match.bridge_languages.map((b) => (
                <Badge key={b.language_code} variant="outline">
                  {b.language_code}
                </Badge>
              ))}
            </div>
          </div>
        )}
        <OverlapDisplay
          slots={match.availability_overlap}
          weekdayT={weekdayT}
          cardT={t}
        />
        <div className="flex gap-2 pt-2">
          <Button size="sm" variant="outline" disabled>
            {t("card.viewProfile")}
          </Button>
          <Button size="sm" disabled>
            {t("card.sendRequest")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
