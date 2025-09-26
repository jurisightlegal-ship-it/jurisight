"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function HeroHeader() {
  const [query, setQuery] = React.useState("");
  const router = useRouter();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    // Navigate to articles list with a query param (page can be added later)
    router.push(`/articles?query=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="relative z-10 mx-auto max-w-3xl px-4 text-center">
      <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-jurisight-lime to-jurisight-teal drop-shadow">
        Explore Legal Knowledge with Jurisight
      </h1>
      <p className="mt-4 text-lg text-white/85 drop-shadow">
        Discover Supreme Court judgements, High Court rulings, legal analysis, and comprehensive legal resources. Search articles, analysis, and insights across India's legal landscape.
      </p>

      <form onSubmit={onSubmit} className="mt-8" role="search" aria-label="Search legal articles">
        <div className="relative mx-auto flex max-w-2xl items-center gap-2">
          <div className="pointer-events-none absolute left-3 text-black/60">
            <Search className="h-5 w-5" />
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Supreme Court judgements, High Court rulings, legal articles..."
            className="h-12 w-full bg-white pl-10 text-base text-black placeholder:text-black/60"
            aria-label="Search legal articles"
          />
          <Button type="submit" className="h-12 px-6 bg-jurisight-lime text-white hover:bg-jurisight-lime-dark" aria-label="Search">
            Search
          </Button>
        </div>
      </form>
    </header>
  );
}


