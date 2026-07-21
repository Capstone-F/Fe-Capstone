import Link from "next/link";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default function UnauthorizedPage() {
  return (
    <main className="page-shell items-center justify-center">
      <Card className="surface-glass w-full max-w-2xl">
        <CardHeader className="space-y-3">
          <Badge variant="outline" className="w-fit">
            RBAC pending
          </Badge>
          <CardTitle className="text-3xl">
            Authentication is wired. Role authorization is not.
          </CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4 text-sm">
          <p>
            The backend currently returns a session user but does not expose a
            role model for admin access. Until BE finalizes that contract, this
            frontend scaffold only guards on authenticated session presence.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button render={<Link href="/dashboard" />}>Go to dashboard</Button>
            <Button variant="outline" render={<Link href="/login" />}>
              Back to login
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
