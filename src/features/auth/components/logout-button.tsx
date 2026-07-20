"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/shared/components/ui/button";

import { logout } from "../api/auth-client";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      try {
        await logout();
      } catch (error) {
        console.error(error);
      } finally {
        router.replace("/login");
        router.refresh();
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
    >
      <LogOutIcon className="size-4" />
      Logout
    </Button>
  );
}
