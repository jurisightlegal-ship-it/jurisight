"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Clock, Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function FeaturedBlog() {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    // Demo articles for showcase
    const demoArticles: Article[] = [
      {
        id: 1,
        title: "Supreme Court's Landmark Ruling on Digital Privacy Rights",
        slug: "supreme-court-digital-privacy-rights",
        dek: "A comprehensive analysis of the recent Supreme Court judgment that establishes new precedents for digital privacy in the modern era.",
        featuredImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop",
        readingTime: 8,
        views: 1247,
        publishedAt: "2024-01-15T10:30:00Z",
        author: {
          id: "1",
          name: "Dr. Priya Sharma",
          avatar: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=150&h=150&fit=crop&crop=face"
        },
        section: {
          id: 1,
          name: "Constitutional",
          slug: "constitutional",
          color: "#005C99"
        }
      },
      {
        id: 2,
        title: "Corporate Governance Reforms: New Compliance Requirements",
        slug: "corporate-governance-reforms-compliance",
        dek: "Understanding the latest amendments to corporate governance norms and their implications for Indian businesses.",
        featuredImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
        readingTime: 6,
        views: 892,
        publishedAt: "2024-01-12T14:45:00Z",
        author: {
          id: "2",
          name: "Advocate Rajesh Kumar",
          avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
        },
        section: {
          id: 2,
          name: "Corporate",
          slug: "corporate",
          color: "#00A99D"
        }
      },
      {
        id: 3,
        title: "Criminal Law Amendments: A Paradigm Shift in Justice",
        slug: "criminal-law-amendments-paradigm-shift",
        dek: "Examining the recent criminal law reforms and their impact on the Indian judicial system and law enforcement.",
        featuredImage: "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=800&h=600&fit=crop",
        readingTime: 10,
        views: 2156,
        publishedAt: "2024-01-10T09:15:00Z",
        author: {
          id: "3",
          name: "Prof. Meera Gupta",
          avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
        },
        section: {
          id: 3,
          name: "Criminal",
          slug: "criminal",
          color: "#dc2626"
        }
      },
      {
        id: 4,
        title: "Environmental Law and Climate Change Litigation",
        slug: "environmental-law-climate-change-litigation",
        dek: "A deep dive into emerging trends in environmental litigation and the role of courts in addressing climate change.",
        featuredImage: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=600&fit=crop",
        readingTime: 7,
        views: 634,
        publishedAt: "2024-01-08T16:20:00Z",
        author: {
          id: "4",
          name: "Dr. Arjun Patel",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
        },
        section: {
          id: 4,
          name: "Civil",
          slug: "civil",
          color: "#0F224A"
        }
      },
      {
        id: 5,
        title: "Legal Education Reform: Bridging Theory and Practice",
        slug: "legal-education-reform-theory-practice",
        dek: "Analyzing current challenges in legal education and proposing reforms to better prepare law students for practice.",
        featuredImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop",
        readingTime: 5,
        views: 789,
        publishedAt: "2024-01-05T11:00:00Z",
        author: {
          id: "5",
          name: "Prof. Anil Krishnan",
          avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face"
        },
        section: {
          id: 5,
          name: "Academic",
          slug: "academic",
          color: "#8CC63F"
        }
      },
      {
        id: 6,
        title: "Data Protection Policy: GDPR vs Indian Framework",
        slug: "data-protection-policy-gdpr-indian-framework",
        dek: "Comparative analysis of data protection regulations and the evolving policy landscape in India.",
        featuredImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop",
        readingTime: 9,
        views: 1423,
        publishedAt: "2024-01-03T13:30:00Z",
        author: {
          id: "6",
          name: "Advocate Sneha Reddy",
          avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face"
        },
        section: {
          id: 6,
          name: "Policy",
          slug: "policy",
          color: "#1a75b3"
        }
      }
    ];

    // Simulate API loading time
    setTimeout(() => {
      setArticles(demoArticles);
      setLoading(false);
    }, 800);
  }, []);

  const visibleArticles = articles.slice(currentIndex, currentIndex + 3);
  const canGoNext = currentIndex + 3 < articles.length;
  const canGoPrev = currentIndex > 0;

  const handleNext = () => {
    if (canGoNext) {
      setCurrentIndex(prev => prev + 3);
    }
  };

  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentIndex(prev => Math.max(0, prev - 3));
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
            <div className="h-4 w-96 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="space-y-4">
                  <div className="aspect-video bg-gray-200 rounded-lg"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-black mb-4">Featured Articles</h2>
          <p className="text-black/60">No articles available at the moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Featured Articles</h2>
            <p className="text-black/60">Discover the latest insights and analysis</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrev}
                disabled={!canGoPrev}
                className="border-black/20 hover:bg-black/5"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                disabled={!canGoNext}
                className="border-black/20 hover:bg-black/5"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Link href="/articles">
              <Button className="bg-white text-black hover:bg-gray-100 border border-black/20">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {visibleArticles.map((article) => (
            <Link key={article.id} href={`/articles/${article.slug}`}>
              <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative aspect-video overflow-hidden">
                  {article.featuredImage ? (
                    <Image
                      src={article.featuredImage}
                      alt={article.title}
                      fill
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
                    
                    {article.author?.name && (
                      <div className="flex items-center gap-2">
                        {article.author.avatar ? (
                          <Image
                            src={article.author.avatar}
                            alt={article.author.name}
                            width={20}
                            height={20}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-5 h-5 bg-jurisight-navy rounded-full flex items-center justify-center text-white text-xs">
                            {article.author.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <span className="font-medium">{article.author.name}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {articles.length > 3 && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.ceil(articles.length / 3) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i * 3)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    Math.floor(currentIndex / 3) === i
                      ? "bg-jurisight-navy w-8"
                      : "bg-black/20 hover:bg-black/40"
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default FeaturedBlog;
