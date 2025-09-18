"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

type HCJudgement = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  date: string;
  court: string;
  bench?: string;
  citation?: string;
  featuredImage?: string | null;
};

export function HighCourtJudgement() {
  const [items, setItems] = React.useState<HCJudgement[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const demo: HCJudgement[] = [
      {
        id: 1,
        title: "Delhi HC on Data Retention: Proportionality and Deletion Timelines",
        slug: "delhi-hc-data-retention-deletion-timelines",
        summary: "Court underscores minimal retention and strict deletion protocols for platforms handling sensitive data.",
        date: "2024-02-12",
        court: "Delhi High Court",
        bench: "CJ Sharma, J. Ahuja",
        citation: "2024/DHC/1201",
        featuredImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop",
      },
      {
        id: 2,
        title: "Bombay HC: Free Speech and Satire – Boundaries Revisited",
        slug: "bombay-hc-free-speech-satire",
        summary: "Clarifies the scope of satire in political discourse and the threshold for defamation actions.",
        date: "2024-01-30",
        court: "Bombay High Court",
        bench: "J. Patel, J. Fernandes",
        citation: "2024/BOM/843",
        featuredImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
      },
      {
        id: 3,
        title: "Madras HC: Environmental Clearances – Local Participation Mandated",
        slug: "madras-hc-environmental-clearances",
        summary: "Mandates structured public consultations and reasoned orders for high-impact projects.",
        date: "2024-01-18",
        court: "Madras High Court",
        bench: "J. Krishnan, J. Noor",
        citation: "2024/MAD/512",
        featuredImage: "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=800&h=600&fit=crop"
      },
      {
        id: 4,
        title: "Karnataka HC: Platform Liability – Notice-and-Action Reinforced",
        slug: "karnataka-hc-platform-liability",
        summary: "Provides a refined workflow for illegal content notices and counter-notice adjudication.",
        date: "2023-12-27",
        court: "Karnataka High Court",
        bench: "J. Rao",
        citation: "2023/KAR/1290",
        featuredImage: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=600&fit=crop"
      },
      {
        id: 5,
        title: "Calcutta HC: Labour Platforms – Worker Status Factors Clarified",
        slug: "calcutta-hc-worker-status",
        summary: "Sets out indicia for determining control and dependency in gig economy contracts.",
        date: "2023-12-10",
        court: "Calcutta High Court",
        bench: "CJ Banerjee, J. Sen",
        citation: "2023/CAL/970",
        featuredImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop"
      },
      {
        id: 6,
        title: "Gujarat HC: Procurement – Blacklisting Requires Reasons and Hearing",
        slug: "gujarat-hc-procurement-blacklisting",
        summary: "Affirms due process in blacklisting with mandatory pre-decisional hearing and reasoned orders.",
        date: "2023-11-22",
        court: "Gujarat High Court",
        bench: "J. Trivedi",
        citation: "2023/GUJ/802",
        featuredImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop"
      },
    ];

    const timer = setTimeout(() => {
      setItems(demo);
      setLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-80 bg-gray-200 rounded mb-2 animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl h-40 bg-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">High Court Judgement</h2>
            <p className="text-black/60">Handpicked decisions from High Courts across India</p>
          </div>
          <Link href="/sections/civil">
            <Button className="bg-white text-black hover:bg-gray-100 border border-black/20">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((j, index) => (
            <Link key={j.id} href={`/articles/${j.slug}`}>
              <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="relative aspect-video overflow-hidden">
                  {j.featuredImage ? (
                    <Image
                      src={j.featuredImage}
                      alt={j.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      unoptimized
                      priority={index < 2}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-jurisight-navy via-jurisight-royal to-jurisight-teal" />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  <div className="absolute top-4 left-4 flex items-center gap-2">
                    <span className="px-3 py-1 text-xs font-medium text-white rounded-full bg-black/40 backdrop-blur inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" /> {j.court}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-white/90 text-xs">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(j.date).toLocaleDateString()}
                    </span>
                    {j.citation && (
                      <span className="inline-flex items-center bg-white/10 px-2.5 py-1 rounded-full backdrop-blur truncate max-w-[40%]" title={j.citation}>
                        {j.citation}
                      </span>
                    )}
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-black group-hover:text-jurisight-navy transition-colors line-clamp-2">
                    {j.title}
                  </h3>
                  <p className="text-sm text-black/70 mt-2 line-clamp-3">{j.summary}</p>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {j.bench && (
                      <span className="inline-flex items-center text-[11px] font-medium bg-black/5 text-black/70 px-2.5 py-1 rounded-full" title={j.bench}>
                        Bench: <span className="ml-1 truncate max-w-[220px]">{j.bench}</span>
                      </span>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button>
                      Read judgment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HighCourtJudgement;


