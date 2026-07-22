import { AppShell } from "@/shared/components/layout/app-shell";

export default function UserPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
