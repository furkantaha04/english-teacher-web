"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import type { BlogPost } from "@/types";

const categories: Record<string, string> = {
  sinav: "Sınav Taktikleri",
  gramer: "Gramer",
  kelime: "Kelime",
  genel: "Genel",
};

const categoryColors: Record<string, string> = {
  sinav: "bg-amber-100 text-amber-700",
  gramer: "bg-blue-100 text-blue-700",
  kelime: "bg-green-100 text-green-700",
  genel: "bg-purple-100 text-purple-700",
};

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return;
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("slug", slug)
          .eq("published", true)
          .maybeSingle();

        if (error) throw error;
        setPost(data);
      } catch (error) {
        console.error("Failed to load blog post:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="section-padding">
        <div className="container-main max-w-3xl flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="section-padding">
        <div className="container-main max-w-3xl text-center py-16">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40 text-muted-foreground" />
          <h2 className="text-xl font-semibold mb-2">Yazı Bulunamadı</h2>
          <p className="text-muted-foreground mb-6">
            Aradığınız yazı mevcut değil veya yayından kaldırılmış olabilir.
          </p>
          <Link href="/blog">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Blog&apos;a Dön
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-padding">
      <div className="container-main max-w-3xl">
        {/* Back Button */}
        <Link href="/blog">
          <Button variant="ghost" size="sm" className="gap-2 mb-6 -ml-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Tüm Yazılar
          </Button>
        </Link>

        <article>
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Badge className={`text-xs ${categoryColors[post.category] || "bg-gray-100 text-gray-700"}`}>
                {categories[post.category] || post.category}
              </Badge>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(post.created_at)}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight leading-tight mb-4">
              {post.title}
            </h1>
            {post.summary && (
              <p className="text-lg text-muted-foreground leading-relaxed">
                {post.summary}
              </p>
            )}
          </div>

          {/* Content */}
          <Card className="border-0 shadow-lg shadow-primary/5">
            <CardContent className="p-6 sm:p-10">
              <div className="prose prose-sm sm:prose-base max-w-none text-foreground leading-relaxed whitespace-pre-wrap">
                {post.content}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-border flex items-center justify-between">
            <Link href="/blog">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Diğer Yazılar
              </Button>
            </Link>
            <span className="text-xs text-muted-foreground">
              English with İnayet
            </span>
          </div>
        </article>
      </div>
    </div>
  );
}
