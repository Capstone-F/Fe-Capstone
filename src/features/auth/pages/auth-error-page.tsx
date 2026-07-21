import Link from "next/link";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { getAuthErrorContent } from "@/features/auth/constants/auth-error";

export type AuthErrorPageProps = {
  searchParams: Promise<{
    reason?: string;
  }>;
};

export async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const { reason } = await searchParams;
  const content = getAuthErrorContent(reason);

  return (
    <main className="page-shell items-center justify-center">
      <Card className="surface-glass w-full max-w-2xl">
        <CardHeader className="space-y-3">
          <Badge variant="outline" className="w-fit">
            Auth callback
          </Badge>
          <CardTitle className="text-3xl">{content.title}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4 text-sm">
          <p>{content.description}</p>
          <div className="flex flex-wrap gap-3">
            <Button render={<Link href="/login" />}>Back to login</Button>
            <Button variant="outline" render={<Link href="/dashboard" />}>
              Try dashboard again
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
