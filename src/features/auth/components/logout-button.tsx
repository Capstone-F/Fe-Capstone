"use client";

import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/shared/components/ui/button";
import { queryKeys } from "@/lib/query/keys";

import { authApi } from "../api/auth.api";

export function LogoutButton() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      try {
        await authApi.logout();
      } catch (error) {
        console.error(error);
      } finally {
        queryClient.setQueryData(queryKeys.session, null);
        queryClient.removeQueries({ queryKey: queryKeys.profile });
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
