import Link from "next/link";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

export type AuthErrorPageProps = {
  searchParams: Promise<{
    reason?: string;
  }>;
};

export async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const { reason } = await searchParams;
  const title = "Xác thực không thành công";
  const description =
    reason ||
    "Đã xảy ra lỗi trong quá trình xác thực phiên làm việc. Vui lòng đăng nhập lại.";

  return (
    <main className="page-shell items-center justify-center">
      <Card className="surface-glass w-full max-w-2xl">
        <CardHeader className="space-y-3">
          <Badge variant="outline" className="w-fit">
            Auth Error
          </Badge>
          <CardTitle className="text-3xl">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-4 text-sm">
          <p>{description}</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/login">
              <Button>Quay lại đăng nhập</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Trang chủ</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
