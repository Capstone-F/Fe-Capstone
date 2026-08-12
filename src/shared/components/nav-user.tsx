"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { LogOutIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { authApi } from "@/features/auth/api/auth.api";
import { queryKeys } from "@/lib/query/keys";

function getInitials(name: string): string {
  if (!name) return "GS";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
  };
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  function handleLogout() {
    startTransition(async () => {
      try {
        await authApi.logout();
      } catch (error) {
        console.error("Logout error:", error);
      } finally {
        queryClient.setQueryData(queryKeys.session, null);
        queryClient.removeQueries({ queryKey: queryKeys.profile });
        setIsConfirmOpen(false);
        router.replace("/");
      }
    });
  }

  const initials = getInitials(user.name);

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <div className="flex items-center gap-2 rounded-md p-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
            <Avatar className="size-8 shrink-0 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-medium">{user.name}</span>
              <span className="text-foreground/70 truncate text-xs">
                {user.email}
              </span>
            </div>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Đăng xuất"
                    onClick={() => setIsConfirmOpen(true)}
                    className="text-destructive hover:text-destructive shrink-0 group-data-[collapsible=icon]:hidden"
                  />
                }
              >
                <LogOutIcon />
              </TooltipTrigger>
              <TooltipContent>Đăng xuất</TooltipContent>
            </Tooltip>
          </div>
        </SidebarMenuItem>

        {/* Collapsed rail has no room beside the avatar, so logout gets its own row there. */}
        <SidebarMenuItem className="hidden group-data-[collapsible=icon]:block">
          <SidebarMenuButton
            tooltip="Đăng xuất"
            aria-label="Đăng xuất"
            onClick={() => setIsConfirmOpen(true)}
            className="text-destructive hover:text-destructive"
          >
            <LogOutIcon />
            <span>Đăng xuất</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Đăng xuất</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn đăng xuất khỏi tài khoản {user.email}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isPending}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleLogout}
              disabled={isPending}
            >
              {isPending ? "Đang đăng xuất..." : "Đăng xuất"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
