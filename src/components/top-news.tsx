"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Eye, ArrowRight } from "lucide-react";

type Article = {
  id: number;
  title: string;
  slug: string;
  dek: string | null;
  featuredImage: string | null;
  readingTime: number | null;
  views: number;
  publishedAt: string;
  author: {
    id: string;
    name: string | null;
    avatar: string | null;
  } | null;
  section: {
    id: number;
    name: string;
    slug: string;
    color: string;
  } | null;
};

export function TopNews() {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [failedImageIds, setFailedImageIds] = React.useState<Set<number>>(new Set());

  React.useEffect(() => {
    const demoArticles: Article[] = [
      {
        id: 101,
        title: "Breaking: Constitutional Bench Expands Free Speech Protections",
        slug: "constitutional-bench-free-speech-protections",
        dek: "A sweeping ruling clarifies the scope of protected expression in digital spaces.",
        featuredImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop",
        readingTime: 7,
        views: 4321,
        publishedAt: "2024-02-01T08:30:00Z",
        author: {
          id: "10",
          name: "Adv. Neha Verma",
          avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face"
        },
        section: {
          id: 1,
          name: "Constitutional",
          slug: "constitutional",
          color: "#005C99"
        }
      },
      {
        id: 102,
        title: "Corporate M&A: Competition Commission Clears Mega Merger",
        slug: "competition-commission-clears-mega-merger",
        dek: "The decision sets fresh precedents for market dominance evaluations.",
        featuredImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
        readingTime: 6,
        views: 3890,
        publishedAt: "2024-01-28T12:10:00Z",
        author: {
          id: "11",
          name: "Shreya Iyer",
          avatar: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face"
        },
        section: {
          id: 2,
          name: "Corporate",
          slug: "corporate",
          color: "#00A99D"
        }
      },
      {
        id: 103,
        title: "Criminal Jurisprudence: Bail Guidelines Refined by Apex Court",
        slug: "bail-guidelines-refined-apex-court",
        dek: "New framework emphasizes proportionality and speedy adjudication.",
        featuredImage: "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=800&h=600&fit=crop",
        readingTime: 8,
        views: 5120,
        publishedAt: "2024-01-25T09:00:00Z",
        author: {
          id: "12",
          name: "Prof. Aarav Desai",
          avatar: "https://images.unsplash.com/photo-1541534401786-2077eed87a56?w=150&h=150&fit=crop&crop=face"
        },
        section: {
          id: 3,
          name: "Criminal",
          slug: "criminal",
          color: "#dc2626"
        }
      },
      {
        id: 104,
        title: "Green Tribunal Issues Landmark Directions on River Pollution",
        slug: "green-tribunal-directions-river-pollution",
        dek: "Compliance timelines and monitoring mechanisms tightened across states.",
        featuredImage: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=600&fit=crop",
        readingTime: 5,
        views: 3011,
        publishedAt: "2024-01-22T16:45:00Z",
        author: {
          id: "13",
          name: "Dr. Kavya Menon",
          avatar: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=150&h=150&fit=crop&crop=face"
        },
        section: {
          id: 4,
          name: "Civil",
          slug: "civil",
          color: "#0F224A"
        }
      },
      {
        id: 105,
        title: "Academia Watch: National Law Universities Mull Common Credit System",
        slug: "nlu-common-credit-system",
        dek: "Proposal aims to ease inter-university mobility and joint programs.",
        featuredImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop",
        readingTime: 4,
        views: 2450,
        publishedAt: "2024-01-18T11:20:00Z",
        author: {
          id: "14",
          name: "Nikhil Bhat",
          avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=150&h=150&fit=crop&crop=face"
        },
        section: {
          id: 5,
          name: "Academic",
          slug: "academic",
          color: "#8CC63F"
        }
      },
      {
        id: 106,
        title: "Data Protection Board Issues First Set of Compliance Advisories",
        slug: "data-protection-board-compliance-advisories",
        dek: "Highlights consent practices and purpose limitation for large platforms.",
        featuredImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop",
        readingTime: 9,
        views: 4675,
        publishedAt: "2024-01-15T13:05:00Z",
        author: {
          id: "15",
          name: "Ishita Rao",
          avatar: "https://images.unsplash.com/photo-1557862921-37829c790f19?w=150&h=150&fit=crop&crop=face"
        },
        section: {
          id: 6,
          name: "Policy",
          slug: "policy",
          color: "#1a75b3"
        }
      }
    ];

    const timer = setTimeout(() => {
      setArticles(demoArticles);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-48 bg-gray-200 rounded mb-2 animate-pulse" />
          <div className="h-4 w-80 bg-gray-200 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-video bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-6 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-black mb-2">Top News</h2>
          <p className="text-black/60">No top news available right now.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Top News</h2>
            <p className="text-black/60">Most read stories across Jurisight</p>
          </div>
          <Link href="/articles">
            <Button className="bg-white text-black hover:bg-gray-100 border border-black/20">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <Link key={article.id} href={`/articles/${article.slug}`}>
              <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative aspect-video overflow-hidden">
                  {article.featuredImage && !failedImageIds.has(article.id) ? (
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      unoptimized
                      priority={index < 2}
                      onError={() => setFailedImageIds(prev => {
                        const next = new Set(prev);
                        next.add(article.id);
                        return next;
                      })}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-jurisight-navy via-jurisight-royal to-jurisight-teal flex items-center justify-center">
                      <div className="text-white text-lg font-semibold">
                        {article.title.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}

                  {article.section && (
                    <div className="absolute top-4 left-4">
                      <span
                        className="px-3 py-1 text-xs font-medium text-white rounded-full"
                        style={{ backgroundColor: article.section.color }}
                      >
                        {article.section.name}
                      </span>
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-black mb-3 line-clamp-2 group-hover:text-jurisight-navy transition-colors">
                    {article.title}
                  </h3>

                  {article.dek && (
                    <p className="text-black/70 text-sm mb-4 line-clamp-3">
                      {article.dek}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-black/50">
                    <div className="flex items-center gap-4">
                      {article.readingTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{article.readingTime} min read</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span>{article.views} views</span>
                      </div>
                    </div>
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

export default TopNews;


