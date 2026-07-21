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
        router.replace("/login");
        router.refresh();
      } catch (error) {
        console.error(error);
        toast.error("Unable to logout cleanly.");
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
