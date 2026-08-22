"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  User,
  Mail,
  Calendar,
  Trophy,
  BookOpen,
  Trash2,
  Volume2,
  Target,
  CheckCircle2,
  XCircle,
  BarChart3,
  Loader2,
  BookMarked,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import type { QuizResult, UserSavedWord, Profile } from "@/types";

export default function ProfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [savedWords, setSavedWords] = useState<UserSavedWord[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.user) {
          router.push("/giris");
          return;
        }

        const currentUser = session.user;
        setUserId(currentUser.id);

        // Fetch profile, quiz results, saved words in parallel
        const [profileRes, quizRes, wordsRes] = await Promise.all([
          supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .maybeSingle(),
          supabase
            .from("quiz_results")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("created_at", { ascending: false }),
          supabase
            .from("user_saved_words")
            .select("*")
            .eq("user_id", currentUser.id)
            .order("created_at", { ascending: false }),
        ]);

        if (profileRes.data) {
          setProfile(profileRes.data);
        } else {
          // Create a fallback profile from auth data
          setProfile({
            id: currentUser.id,
            email: currentUser.email || "",
            full_name: currentUser.user_metadata?.full_name || null,
            estimated_level: null,
            role: "student",
            created_at: currentUser.created_at,
          });
        }

        if (quizRes.data) setQuizResults(quizRes.data);
        if (wordsRes.data) setSavedWords(wordsRes.data);
      } catch (error) {
        console.error("Failed to load profile:", error);
        toast.error("Profil yüklenirken hata oluştu");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router]);

  const handleDeleteWord = async (wordId: string) => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase
        .from("user_saved_words")
        .delete()
        .eq("id", wordId);
      if (error) throw error;

      setSavedWords((prev) => prev.filter((w) => w.id !== wordId));
      toast.success("Kelime defterinizden silindi");
    } catch (error) {
      console.error("Failed to delete word:", error);
      toast.error("Kelime silinirken hata oluştu");
    }
  };

  const handleSpeak = (word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Tarayıcınız sesli okumayı desteklemiyor");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Stats calculations
  const totalQuizzes = quizResults.length;
  const totalQuestionsAnswered = quizResults.reduce(
    (sum, r) => sum + r.total_questions,
    0
  );
  const totalCorrect = quizResults.reduce((sum, r) => sum + r.score, 0);
  const totalWrong = totalQuestionsAnswered - totalCorrect;
  const averagePercentage =
    totalQuestionsAnswered > 0
      ? Math.round((totalCorrect / totalQuestionsAnswered) * 100)
      : 0;

  if (loading) {
    return (
      <div className="section-padding">
        <div className="container-main max-w-4xl flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Profiliniz yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="section-padding">
      <div className="container-main max-w-4xl">
        {/* Profile Header */}
        <Card className="border-0 shadow-lg shadow-primary/5 overflow-hidden mb-8">
          <div className="h-2 gradient-primary" />
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center text-white text-2xl font-bold shrink-0">
                {(profile.full_name || profile.email)
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="text-center sm:text-left flex-1">
                <h1 className="text-2xl font-bold tracking-tight">
                  {profile.full_name || "Öğrenci"}
                </h1>
                <div className="flex flex-col sm:flex-row items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {profile.email}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Katılım: {formatDate(profile.created_at)}
                  </span>
                </div>
                {/* Level Badge */}
                <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
                  {profile.estimated_level ? (
                    <Badge className="gradient-primary border-0 text-white px-3 py-1 gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Seviye: {profile.estimated_level}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="px-3 py-1 gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      Seviye belirlenmedi
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="quiz-history" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="quiz-history" className="gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Sınav Geçmişim &</span> İlerleme
            </TabsTrigger>
            <TabsTrigger value="word-book" className="gap-2">
              <BookMarked className="w-4 h-4" />
              Kelime Defterim
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Quiz History */}
          <TabsContent value="quiz-history" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Card className="border-0 shadow-md shadow-black/5">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mx-auto mb-2">
                    <BarChart3 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold">{totalQuizzes}</div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Çözülen Test
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md shadow-black/5">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mx-auto mb-2">
                    <Target className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold">
                    {totalQuestionsAnswered}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Toplam Soru
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md shadow-black/5">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {totalCorrect}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Doğru</p>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-md shadow-black/5">
                <CardContent className="p-4 text-center">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {totalWrong}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Yanlış
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Progress Bar */}
            {totalQuestionsAnswered > 0 && (
              <Card className="border-0 shadow-md shadow-black/5">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Başarı Oranı</span>
                    <span className="text-sm font-bold text-primary">
                      %{averagePercentage}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-primary rounded-full transition-all duration-700"
                      style={{ width: `${averagePercentage}%` }}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quiz Results Table */}
            <Card className="border-0 shadow-md shadow-black/5 overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Sınav Geçmişi
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tarih</TableHead>
                        <TableHead>Puan</TableHead>
                        <TableHead>Başarı</TableHead>
                        <TableHead>Seviye</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {quizResults.length > 0 ? (
                        quizResults.map((result) => {
                          const percentage = Math.round(
                            (result.score / result.total_questions) * 100
                          );
                          return (
                            <TableRow key={result.id}>
                              <TableCell className="text-muted-foreground text-sm">
                                {formatDate(result.created_at)}
                              </TableCell>
                              <TableCell className="font-medium">
                                {result.score} / {result.total_questions}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full ${
                                        percentage >= 70
                                          ? "bg-green-500"
                                          : percentage >= 40
                                          ? "bg-amber-500"
                                          : "bg-red-500"
                                      }`}
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    %{percentage}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="font-semibold"
                                >
                                  {result.estimated_level || "—"}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow>
                          <TableCell
                            colSpan={4}
                            className="text-center py-12"
                          >
                            <Trophy className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground">
                              Henüz sınav çözmediniz
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-3"
                              onClick={() => router.push("/seviye-testi")}
                            >
                              Seviye Testine Git
                            </Button>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Word Book */}
          <TabsContent value="word-book" className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                {savedWords.length} kelime kayıtlı
              </p>
            </div>

            {savedWords.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {savedWords.map((word) => (
                  <Card
                    key={word.id}
                    className="border-0 shadow-md shadow-black/5 hover:shadow-lg transition-shadow group"
                  >
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {word.word}
                          </h3>
                          {word.pronunciation && (
                            <p className="text-xs text-muted-foreground italic">
                              {word.pronunciation}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                            onClick={() => handleSpeak(word.word)}
                          >
                            <Volume2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteWord(word.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-foreground/80 mb-2">
                        {word.meaning}
                      </p>
                      {word.example_sentence && (
                        <div className="bg-muted/50 rounded-lg p-3 mt-2">
                          <p className="text-xs text-muted-foreground italic leading-relaxed">
                            &quot;{word.example_sentence}&quot;
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-md shadow-black/5">
                <CardContent className="p-12 text-center">
                  <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-muted-foreground mb-1">
                    Kelime defteriniz boş
                  </h3>
                  <p className="text-sm text-muted-foreground/60 max-w-sm mx-auto">
                    Ana sayfadaki günün kelimesinde kalp ikonuna tıklayarak
                    kelimeleri kaydedin.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
