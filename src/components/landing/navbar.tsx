"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Sparkles, Menu, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Soi Da AI", href: "#ai-scan" },
    { label: "Cách Hoạt Động", href: "#how-it-works" },
    { label: "Sản Phẩm", href: "#products" },
    { label: "Mạng Lưới Chuyên Gia", href: "#experts" },
    { label: "Đối Tác", href: "#clinics" },
  ];

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        isScrolled
          ? "border-b border-white/40 bg-white/70 shadow-sm backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md transition-transform duration-300 group-hover:scale-105">
            <Sparkles className="h-5 w-5 animate-pulse" />
          </div>
          <span className="font-heading text-foreground group-hover:text-primary text-xl font-bold tracking-tight transition-colors">
            Glow<span className="text-primary">Scan</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors duration-200"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden items-center gap-4 md:flex">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-sm font-medium">
              Đăng nhập
            </Button>
          </Link>
          <a href="/login?redirectTo=/scan">
            <Button
              size="sm"
              className="group rounded-xl px-5 text-sm font-semibold"
            >
              Khảo sát ngay
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </a>
        </div>

        {/* Mobile Navigation (Hamburger) */}
        <div className="flex md:hidden">
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="text-foreground">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Mở menu</span>
                </Button>
              }
            />
            <SheetContent
              side="right"
              className="w-[300px] bg-white/95 backdrop-blur-md sm:w-[350px]"
            >
              <div className="flex flex-col gap-6 pt-10">
                <Link href="/" className="mb-6 flex items-center gap-2">
                  <div className="bg-primary flex h-9 w-9 items-center justify-center rounded-xl text-white">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="font-heading text-foreground text-xl font-bold">
                    Glow<span className="text-primary">Scan</span>
                  </span>
                </Link>
                <div className="flex flex-col gap-4">
                  {navLinks.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground border-border/50 border-b py-2 text-base font-medium"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
                <div className="mt-6 flex flex-col gap-3">
                  <Link href="/login" className="w-full">
                    <Button variant="outline" className="w-full rounded-xl">
                      Đăng nhập
                    </Button>
                  </Link>
                  <a href="/login?redirectTo=/scan" className="w-full">
                    <Button className="w-full rounded-xl">Khảo sát ngay</Button>
                  </a>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
