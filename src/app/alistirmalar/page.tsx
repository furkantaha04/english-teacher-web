"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  BookOpen,
  Download,
  FileText,
  Search,
  FolderOpen,
  Lock,
  LogIn,
  KeyRound,
  Lightbulb,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import type { Exercise } from "@/types";

const levelColors: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-700",
  A2: "bg-teal-100 text-teal-700",
  B1: "bg-blue-100 text-blue-700",
  B2: "bg-indigo-100 text-indigo-700",
  C1: "bg-purple-100 text-purple-700",
  C2: "bg-fuchsia-100 text-fuchsia-700",
};

const categoryIcons: Record<string, typeof BookOpen> = {
  Grammar: BookOpen,
  Vocabulary: FileText,
  Reading: BookOpen,
  Writing: FileText,
  Listening: BookOpen,
  Speaking: FileText,
};

export default function AlistirmalarPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        // Check auth
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setIsLoggedIn(!!session?.user);

        // Fetch exercises from DB only
        const { data, error } = await supabase
          .from("exercises")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        if (data) setExercises(data);
      } catch (error) {
        console.error("Failed to fetch exercises:", error);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesLevel =
      selectedLevel === "all" || exercise.level === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  // Collect unique levels from DB data for dynamic tabs
  const uniqueLevels = [...new Set(exercises.map((e) => e.level))].sort();

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
          <Select value={selectedLevel} onValueChange={(val) => setSelectedLevel(val || "all")}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Seviye" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Seviyeler</SelectItem>
              {uniqueLevels.map((lv) => (
                <SelectItem key={lv} value={lv}>
                  {lv}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Alıştırmalar yükleniyor...</p>
          </div>
        ) : filteredExercises.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredExercises.map((exercise) => {
              const IconComponent =
                categoryIcons[exercise.category] || FileText;
              return (
                <Card
                  key={exercise.id}
                  className="group border-0 shadow-md shadow-black/5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-0.5 flex flex-col"
                >
                  <CardContent className="p-5 flex flex-col flex-1">
                    {/* Top row: icon + level badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <Badge
                        className={`text-xs ${levelColors[exercise.level] || "bg-gray-100 text-gray-700"}`}
                      >
                        {exercise.level}
                      </Badge>
                    </div>

                    {/* Title & category */}
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2">
                      {exercise.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-1">
                      {exercise.category}
                    </p>

                    {/* Description */}
                    {exercise.description && (
                      <p className="text-xs text-muted-foreground/70 mb-3 line-clamp-2">
                        {exercise.description}
                      </p>
                    )}

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Download Exercise Button - open to all */}
                    {exercise.file_url && (
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
                        Alıştırmayı İndir (PDF)
                      </a>
                    )}

                    {/* Solution Section - Locked for guests */}
                    {(exercise.solution_url || exercise.solution_explanation) && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        {isLoggedIn === null ? null : isLoggedIn ? (
                          <div className="space-y-2">
                            {exercise.solution_url && (
                              <a
                                href={exercise.solution_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={buttonVariants({
                                  variant: "outline",
                                  size: "sm",
                                  className:
                                    "w-full gap-2 text-amber-600 border-amber-200 hover:bg-amber-50 hover:text-amber-700",
                                })}
                              >
                                <KeyRound className="w-4 h-4" />
                                Cevap Anahtarını İndir (PDF)
                              </a>
                            )}
                            {exercise.solution_explanation && (
                              <div className="bg-amber-50/50 rounded-lg p-3 mt-2">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                                  <span className="text-xs font-medium text-amber-700">
                                    Çözüm Notu
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                  {exercise.solution_explanation}
                                </p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="relative">
                            <div className="flex flex-col gap-2 blur-[3px] select-none pointer-events-none opacity-40">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground h-8 border rounded-md px-3">
                                <KeyRound className="w-3.5 h-3.5" />
                                <span>Cevap Anahtarını İndir (PDF)</span>
                              </div>
                              {exercise.solution_explanation && (
                                <div className="bg-muted/50 rounded-lg p-3">
                                  <p className="text-xs text-muted-foreground">
                                    Çözüm açıklaması...
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center bg-background/30 rounded-lg">
                              <Link href="/giris">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10"
                                >
                                  <Lock className="w-3.5 h-3.5" />
                                  Cevap anahtarı için giriş yapın
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : exercises.length === 0 ? (
          /* No exercises in DB at all */
          <div className="text-center py-20">
            <FolderOpen className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-1">
              Henüz alıştırma eklenmedi
            </h3>
            <p className="text-sm text-muted-foreground/60 max-w-sm mx-auto">
              Öğretmeniniz yakında alıştırma materyalleri ekleyecek. Lütfen daha
              sonra tekrar kontrol edin.
            </p>
          </div>
        ) : (
          /* Exercises exist but search/filter returns empty */
          <div className="text-center py-16">
            <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-1">
              Sonuç bulunamadı
            </h3>
            <p className="text-sm text-muted-foreground/60">
              Arama kriterlerinize uygun alıştırma bulunamadı.
            </p>
          </div>
        )}

        {/* Full-width lock banner for guests */}
        {isLoggedIn === false && exercises.length > 0 && (
          <Card className="mt-8 border-0 shadow-lg shadow-primary/5 overflow-hidden">
            <div className="h-1.5 gradient-primary" />
            <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h3 className="text-lg font-semibold mb-1">
                  Cevap Anahtarlarının Kilidini Açın
                </h3>
                <p className="text-sm text-muted-foreground">
                  Cevap anahtarları, çözüm açıklamaları ve detaylı analizlere
                  erişmek için ücretsiz hesap oluşturun.
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
