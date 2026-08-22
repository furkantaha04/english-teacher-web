"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Download,
  FileText,
  Search,
  FolderOpen,
  Lock,
  LogIn,
  Lightbulb,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import type { Exercise } from "@/types";

// Fallback exercises for demo
const fallbackExercises: Exercise[] = [
  {
    id: "1",
    title: "Present Simple & Present Continuous",
    level: "A1-A2",
    category: "Grammar",
    file_url: "#",
    file_name: "present-simple-continuous.pdf",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Past Tense Exercises",
    level: "A1-A2",
    category: "Grammar",
    file_url: "#",
    file_name: "past-tense.pdf",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Vocabulary: Daily Life",
    level: "A1-A2",
    category: "Vocabulary",
    file_url: "#",
    file_name: "daily-life-vocab.pdf",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "Conditionals (Type 1, 2, 3)",
    level: "B1-B2",
    category: "Grammar",
    file_url: "#",
    file_name: "conditionals.pdf",
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Reading Comprehension: Technology",
    level: "B1-B2",
    category: "Reading",
    file_url: "#",
    file_name: "reading-technology.pdf",
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    title: "Academic Writing Techniques",
    level: "C1",
    category: "Writing",
    file_url: "#",
    file_name: "academic-writing.pdf",
    created_at: new Date().toISOString(),
  },
  {
    id: "7",
    title: "Advanced Idioms & Phrasal Verbs",
    level: "C1",
    category: "Vocabulary",
    file_url: "#",
    file_name: "advanced-idioms.pdf",
    created_at: new Date().toISOString(),
  },
  {
    id: "8",
    title: "Listening Practice: Conversations",
    level: "B1-B2",
    category: "Listening",
    file_url: "#",
    file_name: "listening-conversations.pdf",
    created_at: new Date().toISOString(),
  },
];

const levelColors: Record<string, string> = {
  "A1-A2": "bg-emerald-100 text-emerald-700",
  "B1-B2": "bg-blue-100 text-blue-700",
  C1: "bg-purple-100 text-purple-700",
};

const categoryIcons: Record<string, typeof BookOpen> = {
  Grammar: BookOpen,
  Vocabulary: FileText,
  Reading: BookOpen,
  Writing: FileText,
  Listening: BookOpen,
};

export default function AlistirmalarPage() {
  const [exercises, setExercises] = useState<Exercise[]>(fallbackExercises);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    async function init() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      // Check auth
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session?.user);

      // Fetch exercises
      try {
        const { data, error } = await supabase
          .from("exercises")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setExercises(data);
        }
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
      }
    }
    init();
  }, []);

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesLevel =
      selectedTab === "all" || exercise.level === selectedTab;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="section-padding">
      <div className="container-main">
        {/* Header */}
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3 px-3 py-1">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Alıştırmalar & Kaynaklar
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Çalışma Materyalleri
          </h1>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Seviyenize uygun alıştırmaları indirin ve İngilizcenizi geliştirin
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Alıştırma ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Level Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="mb-8"
        >
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="A1-A2">A1-A2</TabsTrigger>
            <TabsTrigger value="B1-B2">B1-B2</TabsTrigger>
            <TabsTrigger value="C1">C1</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Exercise Grid */}
        {filteredExercises.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredExercises.map((exercise) => {
              const IconComponent =
                categoryIcons[exercise.category] || FileText;
              return (
                <Card
                  key={exercise.id}
                  className="group border-0 shadow-md shadow-black/5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <Badge
                        className={`text-xs ${levelColors[exercise.level] || ""}`}
                      >
                        {exercise.level}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                      {exercise.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      {exercise.category}
                    </p>
                    <a
                      href={exercise.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={buttonVariants({
                        variant: "outline",
                        size: "sm",
                        className:
                          "w-full gap-2 text-primary border-primary/20 hover:bg-primary/5 hover:text-primary",
                      })}
                    >
                      <Download className="w-4 h-4" />
                      İndir
                    </a>

                    {/* Solution / Hints Section - Locked for guests */}
                    <div className="mt-3 pt-3 border-t border-border/50">
                      {isLoggedIn === null ? null : isLoggedIn ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          <span>Çözüm açıklamaları erişiminiz aktif</span>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground/40 blur-[2px] select-none pointer-events-none">
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>
                              Çözüm ipuçları ve detaylı açıklamalar...
                            </span>
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Link href="/giris">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
                              >
                                <Lock className="w-3 h-3" />
                                Giriş yapın
                              </Button>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <FolderOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-1">
              Alıştırma bulunamadı
            </h3>
            <p className="text-sm text-muted-foreground/60">
              Arama kriterlerinize uygun alıştırma bulunamadı.
            </p>
          </div>
        )}

        {/* Full-width lock banner for guests */}
        {isLoggedIn === false && (
          <Card className="mt-8 border-0 shadow-lg shadow-primary/5 overflow-hidden">
            <div className="h-1.5 gradient-primary" />
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-lg font-semibold mb-1">
                  Tüm İçeriklerin Kilidini Açın
                </h3>
                <p className="text-sm text-muted-foreground">
                  Çözüm açıklamaları, ipuçları ve detaylı analizlere erişmek
                  için ücretsiz hesap oluşturun.
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <Link href="/giris">
                  <Button variant="outline" className="gap-2">
                    <LogIn className="w-4 h-4" />
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/kayit-ol">
                  <Button className="gap-2 gradient-primary border-0 text-white">
                    Kayıt Ol
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
