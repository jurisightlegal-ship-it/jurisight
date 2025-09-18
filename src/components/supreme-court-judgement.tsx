"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Landmark, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

type Judgement = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  date: string;
  bench?: string;
  citation?: string;
  featuredImage?: string | null;
};

export function SupremeCourtJudgement() {
  const [items, setItems] = React.useState<Judgement[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const demo: Judgement[] = [
      {
        id: 1,
        title: "Privacy and Digital Surveillance – Expanded Safeguards Clarified",
        slug: "privacy-digital-surveillance-expanded-safeguards",
        summary: "The Court refined proportionality standards for data interception and mandated periodic judicial review.",
        date: "2024-02-05",
        bench: "CJI Rao, Justices Menon, Iyer",
        citation: "(2024) 2 SCC 101",
        featuredImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=800&fit=crop",
      },
      {
        id: 2,
        title: "Bail Jurisprudence: Emphasis on Speedy Trial and Liberty",
        slug: "bail-jurisprudence-speedy-trial-liberty",
        summary: "Guidelines issued to reduce undertrial incarceration with clear outer timelines for charge framing.",
        date: "2024-01-20",
        bench: "Justice Kapoor, Justice Desai",
        citation: "(2024) 1 SCC 455",
        featuredImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&h=800&fit=crop",
      },
      {
        id: 3,
        title: "Freedom of Expression and Online Platforms – Safe Harbour Clarified",
        slug: "freedom-expression-online-platforms-safe-harbour",
        summary: "Clarified the contours of intermediary liability and due diligence in takedown mechanisms.",
        date: "2024-01-10",
        bench: "Justice Bhattacharya, Justice Gupta",
        citation: "(2024) 1 SCC 312",
        featuredImage: "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=1200&h=800&fit=crop",
      },
      {
        id: 4,
        title: "Environmental Compliance – River Basin Restoration Mandates",
        slug: "environmental-compliance-river-basin-restoration",
        summary: "Directed coordinated basin-level planning with quarterly progress reports to NGT.",
        date: "2023-12-18",
        bench: "Justice Raghavan, Justice Qureshi",
        citation: "(2023) 12 SCC 890",
        featuredImage: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=1200&h=800&fit=crop",
      },
      {
        id: 5,
        title: "Reservation in Promotions – Data-Driven Evaluation Reaffirmed",
        slug: "reservation-promotions-data-driven-evaluation",
        summary: "Reiterated requirement of quantifiable data to justify reservation thresholds in promotions.",
        date: "2023-12-01",
        bench: "CJI Rao, Justice Iyer",
        citation: "(2023) 12 SCC 650",
        featuredImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=800&fit=crop",
      },
      {
        id: 6,
        title: "Contractual Arbitrations – Public Policy Grounds Narrowed",
        slug: "contractual-arbitrations-public-policy-narrowed",
        summary: "Limited judicial interference to fundamental policy and basic notions of justice.",
        date: "2023-11-21",
        bench: "Justice Menon, Justice Kapoor",
        citation: "(2023) 11 SCC 502",
        featuredImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&h=800&fit=crop",
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
          <div className="h-8 w-72 bg-gray-200 rounded mb-2 animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-6 bg-gray-100 rounded-lg h-36 animate-pulse" />
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
            <h2 className="text-3xl font-bold text-black mb-2">Supreme Court Judgement</h2>
            <p className="text-black/60">Recent landmark decisions with concise takeaways</p>
          </div>
          <Link href="/sections/constitutional">
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
                    <div className="w-full h-full bg-gradient-to-br from-jurisight-navy via-jurisight-royal to-jurisight-teal flex items-center justify-center">
                      <Landmark className="h-8 w-8 text-white" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-xs font-medium text-white rounded-full bg-black/40 backdrop-blur">
                      Supreme Court
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
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default SupremeCourtJudgement;


