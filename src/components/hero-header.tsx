"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function HeroHeader({ oneliner }: { oneliner?: string }) {
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // Navigate to articles list with a search query param
    router.push(`/articles?search=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="relative z-10 mx-auto w-full md:w-[70%] max-w-6xl px-4 text-center">
      {/* No hero title */}
      <p className="mt-1 text-sm md:text-base font-bold text-white/80 drop-shadow line-clamp-2">
        {oneliner ?? "Find Indian court judgements and expert legal insights."}
      </p>

      <form onSubmit={onSubmit} className="mt-3" role="search" aria-label="Search legal articles">
        <div className="relative mx-auto flex w-full md:w-[70%] max-w-6xl items-center gap-1">
          <div className="pointer-events-none absolute left-2 text-black/60">
            <Search className="h-4 w-4" />
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Supreme Court judgements, High Court rulings, legal articles..."
            className="h-8 w-full bg-white pl-8 text-xs md:text-sm text-black placeholder:text-black/60"
            aria-label="Search legal articles"
          />
          <Button type="submit" className="h-8 px-3 text-sm bg-jurisight-lime text-white hover:bg-jurisight-lime-dark" aria-label="Search">
            Search
          </Button>
        </div>
      </form>
    </header>
  );
}


