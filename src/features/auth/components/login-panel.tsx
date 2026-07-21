"use client";

import { ShieldCheckIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Spinner } from "@/shared/components/ui/spinner";

import { startLogin } from "../api/auth-client";

type LoginPanelProps = {
  redirectTo: string;
};

export function LoginPanel({ redirectTo }: LoginPanelProps) {
  const router = useRouter();
  const [activeProvider, setActiveProvider] = useState<"keycloak" | "google">(
    "keycloak",
  );
  const [isPending, startTransition] = useTransition();

  function handleLogin(provider: "keycloak" | "google") {
    setActiveProvider(provider);

    startTransition(async () => {
      try {
        await startLogin({
          redirectTo,
          idpHint: provider === "google" ? "google" : undefined,
        });
      } catch (error) {
        console.error(error);
        toast.error("Unable to start the login flow.");
      }
    });
  }

  return (
    <main className="page-shell items-center justify-center">
      <section className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6 rounded-[2rem] border border-white/60 bg-[linear-gradient(155deg,rgba(255,255,255,0.9),rgba(222,242,239,0.9))] p-8 shadow-sm backdrop-blur">
          <Badge variant="outline" className="w-fit">
            Admin portal scaffold
          </Badge>
          <div className="space-y-4">
            <h1 className="max-w-3xl text-4xl leading-tight font-semibold md:text-5xl">
              GlowScan admin is wired around the backend&apos;s BFF auth, not
              browser-side Keycloak tokens.
            </h1>
            <p className="text-muted-foreground max-w-2xl text-base md:text-lg">
              The browser only works with a same-origin session cookie. Next.js
              proxies auth and API traffic under <code>/api/be</code>, while
              NestJS handles Keycloak redirects, token exchange, Redis session
              storage, and refresh logic.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-white/70 bg-white/80 shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">Next.js 16</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                App Router with route groups for auth, admin shell, and the BE
                proxy layer.
              </CardContent>
            </Card>
            <Card className="border-white/70 bg-white/80 shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">shadcn/ui</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                A composable admin shell with sidebar, cards, tables, and shared
                loading states.
              </CardContent>
            </Card>
            <Card className="border-white/70 bg-white/80 shadow-none">
              <CardHeader>
                <CardTitle className="text-lg">TanStack Query</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                Session and future admin data fetching share the same cache and
                error handling path.
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="surface-glass self-center">
          <CardHeader className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-primary/12 text-primary rounded-full p-3">
                <ShieldCheckIcon className="size-5" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm font-medium">
                  Secure login
                </p>
                <CardTitle className="text-2xl">
                  Sign in to the admin shell
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full justify-between"
              size="lg"
              onClick={() => handleLogin("keycloak")}
            >
              Continue with Keycloak
              {isPending && activeProvider === "keycloak" ? <Spinner /> : null}
            </Button>
            <Button
              className="w-full justify-between"
              size="lg"
              variant="outline"
              onClick={() => handleLogin("google")}
            >
              Continue with Google
              {isPending && activeProvider === "google" ? <Spinner /> : null}
            </Button>
            <div className="border-border bg-muted/50 text-muted-foreground rounded-2xl border border-dashed p-4 text-sm">
              Redirect target for this session:
              <div className="text-foreground mt-2 font-mono text-xs">
                {redirectTo}
              </div>
            </div>
            <div className="text-muted-foreground text-sm">
              Need a safe fallback route?{" "}
              <button
                className="text-primary font-medium underline-offset-4 hover:underline"
                onClick={() => router.replace("/login?redirectTo=/dashboard")}
                type="button"
              >
                Reset redirect
              </button>{" "}
              or{" "}
              <Link
                className="text-primary font-medium underline-offset-4 hover:underline"
                href="/auth/error?reason=missing_params"
              >
                view auth error states
              </Link>
              .
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
