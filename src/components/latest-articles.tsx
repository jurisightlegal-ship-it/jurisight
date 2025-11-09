import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Clock, ArrowRight, User } from "lucide-react";
import { getImageDisplayUrl } from "@/lib/storage-utils";
import { headers } from "next/headers";

interface ArticleAuthor {
  id: string;
  name: string | null;
  avatar: string | null;
}

interface ArticleSection {
  id: number;
  name: string;
  slug: string;
  color: string;
}

interface ArticleItem {
  id: number;
  title: string;
  slug: string;
  dek: string | null;
  featuredImage: string | null;
  readingTime: number | null;
  views: number;
  publishedAt: string | null;
  updatedAt?: string | null;
  author: ArticleAuthor | null;
  section: ArticleSection | null;
}

function formatDate(dateString: string | null | undefined) {
  if (!dateString) return "";
  try {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export async function LatestArticles() {
  // Build absolute URL for server-side fetch
  const hdrs = headers();
  const host = hdrs.get("host") || "localhost:3000";
  const proto = hdrs.get("x-forwarded-proto") || "http";
  const baseUrl = `${proto}://${host}`;

  // Fetch latest published articles (6)
  const res = await fetch(
    `${baseUrl}/api/articles?limit=6&sortBy=published_at&sortOrder=desc`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    return null;
  }

  const data = (await res.json()) as { articles: ArticleItem[] };
  const articles = (data?.articles || []).slice(0, 6);

  if (articles.length === 0) {
    return null;
  }

  // Prepare signed URLs for images and avatars when needed
  const featuredUrls = await Promise.all(
    articles.map((a) => getImageDisplayUrl(a.featuredImage))
  );
  const avatarUrls = await Promise.all(
    articles.map((a) => getImageDisplayUrl(a.author?.avatar || null))
  );

  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">Latest Articles</h2>
            <p className="text-black/60">Fresh reads from across our sections</p>
          </div>
          <Link href="/articles">
            <Button className="bg-white text-black hover:bg-gray-100 border border-black/20">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => {
            const cover = featuredUrls[index] || null;
            const avatar = avatarUrls[index] || null;
            const published = formatDate(article.publishedAt || article.updatedAt || null);

            return (
              <Link key={article.id} href={`/articles/${article.slug}`}>
                <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white">
                  <div className="relative aspect-video overflow-hidden">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={article.title}
                        fill
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                        unoptimized
                        priority={index < 2}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center">
                        <User className="h-8 w-8 text-white" />
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                    <div className="absolute top-4 left-4">
                      <span className="px-3 py-1 text-xs font-medium text-white rounded-full bg-black/40 backdrop-blur">
                        {article.section?.name || "Latest"}
                      </span>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 text-white/90 text-xs">
                      <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {published}
                      </span>
                      {article.readingTime ? (
                        <span className="inline-flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur">
                          <Clock className="h-3.5 w-3.5" />
                          {article.readingTime} min read
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold text-black group-hover:text-indigo-700 transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    {article.dek ? (
                      <p className="text-sm text-black/70 mt-2 line-clamp-3">{article.dek}</p>
                    ) : null}

                    <div className="mt-4 flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {avatar ? (
                          <Image
                            src={avatar}
                            alt={article.author?.name || "Author"}
                            width={24}
                            height={24}
                            unoptimized
                            className="object-cover"
                          />
                        ) : (
                          <User className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                      <span className="text-xs text-black/70">{article.author?.name || "Unknown Author"}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default LatestArticles;
