import Link from "next/link";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export default function NotFoundPage() {
  return (
    <main className="page-shell items-center justify-center">
      <Card className="surface-glass w-full max-w-xl">
        <CardHeader>
          <p className="text-muted-foreground text-sm font-medium tracking-[0.24em] uppercase">
            Not found
          </p>
          <CardTitle className="text-3xl">
            The route does not exist yet.
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">
            This scaffold only exposes the first admin routes. If you expected a
            module here, add it under the App Router tree in{" "}
            <code>src/app</code>.
          </p>
          <Button render={<Link href="/" />}>Về Trang Chủ</Button>
        </CardContent>
      </Card>
    </main>
  );
}
