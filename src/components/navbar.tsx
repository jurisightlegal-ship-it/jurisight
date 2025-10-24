"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import logo from "@/assets/dark.png";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Articles", href: "/articles" },
  { label: "Business", href: "/business" },
  { label: "Supreme Court Judgements", href: "/supreme-court-judgements" },
  { label: "High Court Judgements", href: "/high-court-judgements" },
  { label: "News", href: "/news" },
  { label: "Know Your Law", href: "/know-your-law" },
  { label: "About", href: "/about" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-transparent backdrop-blur supports-[backdrop-filter]:bg-white/10">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2" aria-label="Jurisight home">
            <Image 
              src={logo} 
              alt="Jurisight logo" 
              className="h-12 w-auto" 
              loading="lazy"
            />
            <span className="sr-only">Jurisight</span>
          </Link>
          
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "text-white hover:bg-white/10",
                      isActive && "bg-white/15 hover:bg-white/20"
                    )}
                  >
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {status === "loading" ? (
            <div className="h-9 w-24 animate-pulse rounded-md bg-white/20" />
          ) : session ? (
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-white text-jurisight-navy hover:bg-gray-100"
            >
              Dashboard
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/auth/signin")}
              className="bg-white text-jurisight-navy hover:bg-gray-100"
            >
              Sign In
            </Button>
          )}
        </div>

        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden",
          open ? "block" : "hidden"
        )}
      >
        <div className="space-y-1 border-t border-white/10 bg-black/30 px-4 py-3 backdrop-blur">
          {navItems.map((item) => {
            const isActive = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className="block">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start text-white hover:bg-white/10",
                    isActive && "bg-white/15 hover:bg-white/20"
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
          <div className="pt-2 space-y-2">
            {status === "loading" ? (
              <div className="h-9 w-full animate-pulse rounded-md bg-white/20" />
            ) : session ? (
              <Button
                onClick={() => router.push("/dashboard")}
                className="w-full bg-white text-jurisight-navy hover:bg-gray-100"
              >
                Dashboard
              </Button>
            ) : (
              <Button
                onClick={() => router.push("/auth/signin")}
                className="w-full bg-white text-jurisight-navy hover:bg-gray-100"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;


