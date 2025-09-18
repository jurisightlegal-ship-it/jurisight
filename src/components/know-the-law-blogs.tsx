"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, BookOpen, CalendarDays, User } from "lucide-react";
import { Button } from "@/components/ui/button";

type KnowTheLawBlog = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  date: string;
  author: string;
  readingTime: number;
  category: string;
  featuredImage?: string | null;
};

export function KnowTheLawBlogs() {
  const [items, setItems] = React.useState<KnowTheLawBlog[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const demo: KnowTheLawBlog[] = [
      {
        id: 1,
        title: "Understanding Your Rights: A Guide to Consumer Protection Laws",
        slug: "understanding-consumer-protection-laws",
        summary: "Learn about your rights as a consumer, how to file complaints, and what legal remedies are available when things go wrong.",
        date: "2024-02-15",
        author: "Adv. Priya Sharma",
        readingTime: 8,
        category: "Consumer Rights",
        featuredImage: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&h=600&fit=crop",
      },
      {
        id: 2,
        title: "Employment Law Basics: Know Your Workplace Rights",
        slug: "employment-law-workplace-rights",
        summary: "Essential knowledge about employment contracts, termination procedures, and workplace harassment laws every employee should know.",
        date: "2024-02-08",
        author: "Rajesh Kumar",
        readingTime: 10,
        category: "Employment",
        featuredImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop",
      },
      {
        id: 3,
        title: "Property Law Simplified: Buying Your First Home",
        slug: "property-law-buying-first-home",
        summary: "Navigate property transactions with confidence. Understanding due diligence, documentation, and legal safeguards.",
        date: "2024-01-28",
        author: "Dr. Meera Gupta",
        readingTime: 12,
        category: "Property",
        featuredImage: "https://images.unsplash.com/photo-1607462109225-6b64ae2dd3cb?w=800&h=600&fit=crop",
      },
      {
        id: 4,
        title: "Family Law Essentials: Marriage, Divorce, and Child Custody",
        slug: "family-law-marriage-divorce-custody",
        summary: "Comprehensive guide to family law matters including marriage rights, divorce procedures, and child custody arrangements.",
        date: "2024-01-15",
        author: "Sneha Reddy",
        readingTime: 15,
        category: "Family Law",
        featuredImage: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800&h=600&fit=crop",
      },
      {
        id: 5,
        title: "Digital Privacy Rights: Protecting Yourself Online",
        slug: "digital-privacy-rights-online-protection",
        summary: "Understanding data protection laws, privacy policies, and your rights in the digital age of social media and e-commerce.",
        date: "2024-01-10",
        author: "Arjun Patel",
        readingTime: 7,
        category: "Digital Rights",
        featuredImage: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=600&fit=crop",
      },
      {
        id: 6,
        title: "Start-up Legal Guide: From Incorporation to Compliance",
        slug: "startup-legal-guide-incorporation-compliance",
        summary: "Essential legal steps for entrepreneurs including business registration, intellectual property, and regulatory compliance.",
        date: "2023-12-20",
        author: "Anil Krishnan",
        readingTime: 11,
        category: "Business Law",
        featuredImage: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop",
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
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-8 w-72 bg-gray-200 rounded mb-2 animate-pulse" />
          <div className="h-4 w-96 bg-gray-200 rounded mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl h-64 bg-white animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Know the Law</h2>
            <p className="text-black/60">Educational content to help you understand your legal rights and obligations</p>
          </div>
          <Link href="/categories/know-the-law">
            <Button className="bg-white text-black hover:bg-gray-100 border border-black/20">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((blog, index) => (
            <Link key={blog.id} href={`/articles/${blog.slug}`}>
              <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
                <div className="relative aspect-video overflow-hidden">
                  {blog.featuredImage ? (
                    <Image
                      src={blog.featuredImage}
                      alt={blog.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                      unoptimized
                      priority={index < 2}
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 flex items-center justify-center">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 text-xs font-medium text-white rounded-full bg-emerald-600/90 backdrop-blur">
                      {blog.category}
                    </span>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-white/90 text-xs">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(blog.date).toLocaleDateString()}
                    </span>
                    <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur">
                      <BookOpen className="h-3.5 w-3.5" />
                      {blog.readingTime} min read
                    </span>
                  </div>
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-black group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {blog.title}
                  </h3>
                  <p className="text-sm text-black/70 mt-2 line-clamp-3">{blog.summary}</p>

                  <div className="mt-4 flex items-center gap-2">
                    <span className="inline-flex items-center text-[11px] font-medium bg-black/5 text-black/70 px-2.5 py-1 rounded-full">
                      <User className="h-3.5 w-3.5 mr-1" />
                      {blog.author}
                    </span>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <Button>
                      Read Article
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

export default KnowTheLawBlogs;
