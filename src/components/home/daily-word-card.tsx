"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Volume2, Heart } from "lucide-react";
import { toast } from "sonner";
import type { DailyWord } from "@/types";

// Fallback data when Supabase is not connected
const fallbackWord: DailyWord = {
  id: "1",
  word: "Resilience",
  pronunciation: "/rɪˈzɪl.i.əns/",
  meaning: "Dayanıklılık, esneklik; zorlukların üstesinden gelme yeteneği",
  example_sentence:
    "Her resilience in the face of adversity inspired everyone around her.",
  created_at: new Date().toISOString(),
};

export default function DailyWordCard() {
  const [word, setWord] = useState<DailyWord>(fallbackWord);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [savingInProgress, setSavingInProgress] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      // Check auth
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
      }

      // Fetch latest daily word
      const { data } = await supabase
        .from("daily_words")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setWord(data);
      }
    }
    init();
  }, []);

  // Check if the current word is already saved
  useEffect(() => {
    async function checkSaved() {
      if (!userId || !word) return;
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase
        .from("user_saved_words")
        .select("id")
        .eq("user_id", userId)
        .eq("word", word.word)
        .maybeSingle();
      setIsSaved(!!data);
    }
    checkSaved();
  }, [userId, word]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip

    if (!userId) {
      toast.info("Kelimeleri kaydetmek için giriş yapmalısınız", {
        action: {
          label: "Giriş Yap",
          onClick: () => (window.location.href = "/giris"),
        },
      });
      return;
    }

    if (savingInProgress) return;
    setSavingInProgress(true);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from("user_saved_words")
          .delete()
          .eq("user_id", userId)
          .eq("word", word.word);
        if (error) throw error;
        setIsSaved(false);
        toast.success("Kelime defterinizden çıkarıldı");
      } else {
        // Add to saved
        const { error } = await supabase.from("user_saved_words").insert({
          user_id: userId,
          word: word.word,
          pronunciation: word.pronunciation,
          meaning: word.meaning,
          example_sentence: word.example_sentence,
        });
        if (error) throw error;
        setIsSaved(true);
        toast.success("Kelime defterinize eklendi");
      }
    } catch (error) {
      console.error("Failed to toggle save:", error);
      toast.error("Bir hata oluştu");
    } finally {
      setSavingInProgress(false);
    }
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    }
  };

  const SaveButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className={`absolute top-4 right-4 z-10 h-9 w-9 rounded-full transition-all duration-300 ${
        isSaved
          ? "text-red-500 hover:text-red-600 hover:bg-red-50"
          : "text-muted-foreground hover:text-red-500 hover:bg-red-50"
      }`}
      onClick={handleToggleSave}
      disabled={savingInProgress}
    >
      <Heart
        className={`w-5 h-5 transition-all duration-300 ${isSaved ? "fill-current scale-110" : ""}`}
      />
    </Button>
  );

  return (
    <section className="section-padding bg-muted/50">
      <div className="container-main">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3 px-3 py-1">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Her Gün Yeni Bir Kelime
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">
            Günün Kelimesi & Deyimi
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Her gün yeni bir kelime öğrenerek kelime haznenizi genişletin
          </p>
        </div>

        <div className="max-w-lg mx-auto perspective-1000">
          <div
            className={`relative cursor-pointer transition-transform duration-700 preserve-3d ${
              isFlipped ? "[transform:rotateY(180deg)]" : ""
            }`}
            onClick={() => setIsFlipped(!isFlipped)}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front */}
            <Card className="border-0 shadow-lg shadow-primary/5 overflow-hidden backface-hidden">
              <div className="h-2 gradient-primary" />
              <CardContent className="p-8 text-center relative">
                <SaveButton />
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Bugünün Kelimesi
                  </p>
                  <h3 className="text-4xl font-bold text-gradient mb-2">
                    {word.word}
                  </h3>
                  {word.pronunciation && (
                    <div className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <button
                        onClick={handleSpeak}
                        className="hover:text-primary transition-colors"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                      <span className="text-sm italic">
                        {word.pronunciation}
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Kartı çevirmek için tıklayın →
                </p>
              </CardContent>
            </Card>

            {/* Back */}
            <Card
              className="absolute inset-0 border-0 shadow-lg shadow-primary/5 overflow-hidden backface-hidden [transform:rotateY(180deg)]"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="h-2 gradient-warm" />
              <CardContent className="p-8 text-center relative">
                <SaveButton />
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Türkçe Anlamı
                  </p>
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    {word.meaning}
                  </h3>
                </div>
                {word.example_sentence && (
                  <div className="bg-muted/50 rounded-xl p-4 text-left">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5">
                      Örnek Cümle
                    </p>
                    <p className="text-sm text-foreground italic leading-relaxed">
                      &quot;{word.example_sentence}&quot;
                    </p>
                  </div>
                )}
                <p className="text-sm text-muted-foreground mt-4">
                  ← Geri çevirmek için tıklayın
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
