import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function MatchCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-5 w-48 rounded bg-muted" />
        <div className="h-4 w-24 rounded bg-muted" />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-6 w-40 rounded bg-muted" />
        </div>
        <div className="space-y-2">
          <div className="h-4 w-32 rounded bg-muted" />
          <div className="h-6 w-36 rounded bg-muted" />
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-8 w-24 rounded bg-muted" />
          <div className="h-8 w-28 rounded bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
}
