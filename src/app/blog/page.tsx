"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calendar,
  ArrowRight,
  Loader2,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import type { BlogPost } from "@/types";

const categories = [
  { value: "all", label: "Tümü" },
  { value: "sinav", label: "Sınav Taktikleri" },
  { value: "gramer", label: "Gramer" },
  { value: "kelime", label: "Kelime" },
  { value: "genel", label: "Genel" },
];

const categoryColors: Record<string, string> = {
  sinav: "bg-amber-100 text-amber-700",
  gramer: "bg-blue-100 text-blue-700",
  kelime: "bg-green-100 text-green-700",
  genel: "bg-purple-100 text-purple-700",
};

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchPosts() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error("Failed to load blog posts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === "all" || post.category === activeCategory;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="section-padding">
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-3 px-3 py-1">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Blog
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            İngilizce Tüyoları & Sınav Taktikleri
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            İngilizce öğrenim yolculuğunuzda size yol gösterecek yazılar
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Yazı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2 flex-wrap justify-center">
            {categories.map((cat) => (
              <Button
                key={cat.value}
                variant={activeCategory === cat.value ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(cat.value)}
                className={activeCategory === cat.value ? "gradient-primary border-0 text-white" : ""}
              >
                {cat.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="border-0 shadow-md shadow-black/5 hover:shadow-lg transition-all duration-300 h-full group cursor-pointer">
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className={`text-xs ${categoryColors[post.category] || "bg-gray-100 text-gray-700"}`}>
                        {categories.find((c) => c.value === post.category)?.label || post.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(post.created_at)}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                      {post.summary}
                    </p>
                    <div className="mt-4 flex items-center text-sm text-primary font-medium gap-1 group-hover:gap-2 transition-all">
                      Devamını Oku
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>Henüz yazı bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
