"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, Volume2, Heart } from "lucide-react";
import { toast } from "sonner";
import type { DailyWord } from "@/types";

// Fallback data when Supabase is not connected
const fallbackWords: DailyWord[] = [
  {
    id: "1",
    word: "Resilience",
    pronunciation: "/rɪˈzɪl.i.əns/",
    meaning: "Dayanıklılık, esneklik; zorlukların üstesinden gelme yeteneği",
    example_sentence:
      "Her resilience in the face of adversity inspired everyone around her.",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    word: "Ubiquitous",
    pronunciation: "/juːˈbɪk.wɪ.təs/",
    meaning: "Her yerde birden bulunan, yaygın",
    example_sentence:
      "Mobile phones have become ubiquitous in modern society.",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    word: "Ephemeral",
    pronunciation: "/ɪˈfem.ər.əl/",
    meaning: "Geçici, kısa ömürlü",
    example_sentence:
      "Fame in the world of social media is often ephemeral.",
    created_at: new Date().toISOString(),
  },
];

export default function DailyWordCard() {
  const [words, setWords] = useState<DailyWord[]>(fallbackWords);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});
  const [savedWords, setSavedWords] = useState<Record<string, boolean>>({});
  const [savingInProgress, setSavingInProgress] = useState<Record<string, boolean>>({});
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        // Check auth
        const {
          data: { session },
        } = await supabase.auth.getSession();
        
        const currentUserId = session?.user?.id || null;
        setUserId(currentUserId);

        // Fetch latest daily words (limit 3)
        const { data } = await supabase
          .from("daily_words")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3);

        if (data && data.length > 0) {
          setWords(data);
        }
        
        // If user is logged in, fetch their saved words to set initial heart state
        if (currentUserId) {
          const wordStrings = (data && data.length > 0 ? data : fallbackWords).map(w => w.word);
          const { data: savedData } = await supabase
            .from("user_saved_words")
            .select("word")
            .eq("user_id", currentUserId)
            .in("word", wordStrings);
            
          if (savedData) {
            const savedMap: Record<string, boolean> = {};
            savedData.forEach(item => {
              savedMap[item.word] = true;
            });
            setSavedWords(savedMap);
          }
        }
      } catch (error) {
        console.error("Error fetching daily words:", error);
      }
    }
    init();
  }, []);

  const handleToggleFlip = (wordId: string) => {
    setFlippedCards((prev) => ({
      ...prev,
      [wordId]: !prev[wordId],
    }));
  };

  const handleToggleSave = async (e: React.MouseEvent, item: DailyWord) => {
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

    if (savingInProgress[item.word]) return;
    
    setSavingInProgress((prev) => ({ ...prev, [item.word]: true }));

    const isSaved = savedWords[item.word];

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      if (isSaved) {
        // Remove from saved
        const { error } = await supabase
          .from("user_saved_words")
          .delete()
          .eq("user_id", userId)
          .eq("word", item.word);
          
        if (error) throw error;
        
        setSavedWords((prev) => ({ ...prev, [item.word]: false }));
        toast.success("Kelime defterinizden çıkarıldı");
      } else {
        // Safe mapping to prevent type/id errors
        const payload = {
          user_id: userId,
          word: item.word,
          pronunciation: item.pronunciation || "",
          meaning: item.meaning || (item as any).translation,
          example_sentence: item.example_sentence || ""
        };
        
        const { error } = await supabase.from("user_saved_words").insert(payload);
        
        if (error) throw error;
        
        setSavedWords((prev) => ({ ...prev, [item.word]: true }));
        toast.success("Kelime defterinize eklendi");
      }
    } catch (error: any) {
      console.error("Failed to toggle save for word:", item.word, error);
      toast.error(`Bir hata oluştu: ${error?.message || "Bilinmeyen hata"}`);
    } finally {
      setSavingInProgress((prev) => ({ ...prev, [item.word]: false }));
    }
  };

  const handleSpeak = (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = "en-US";
      utterance.rate = 0.85;
      window.speechSynthesis.speak(utterance);
    } else {
      toast.error("Tarayıcınız sesli okumayı desteklemiyor");
    }
  };

  return (
    <section className="section-padding bg-muted/50">
      <div className="container-main">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3 px-3 py-1">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            Her Gün Yeni Kelimeler
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight">
            Günün Kelimeleri & Deyimleri
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Her gün yeni kelimeler öğrenerek kelime haznenizi genişletin
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto perspective-1000">
          {words.map((item) => {
            const isFlipped = flippedCards[item.id] || false;
            const isSaved = savedWords[item.word] || false;
            const isSaving = savingInProgress[item.word] || false;

            return (
              <div
                key={item.id}
                className={`relative cursor-pointer transition-transform duration-700 preserve-3d h-[340px] ${
                  isFlipped ? "[transform:rotateY(180deg)]" : ""
                }`}
                onClick={() => handleToggleFlip(item.id)}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front */}
                <Card className="absolute inset-0 border-0 shadow-lg shadow-primary/5 overflow-hidden backface-hidden flex flex-col">
                  <div className="h-2 gradient-primary shrink-0" />
                  <CardContent className="p-6 sm:p-8 text-center relative flex-1 flex flex-col justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute top-4 right-4 z-10 h-9 w-9 rounded-full transition-all duration-300 ${
                        isSaved
                          ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                          : "text-muted-foreground hover:text-red-500 hover:bg-red-50"
                      }`}
                      onClick={(e) => handleToggleSave(e, item)}
                      disabled={isSaving}
                    >
                      <Heart
                        className={`w-5 h-5 transition-all duration-300 ${
                          isSaved ? "fill-current scale-110" : ""
                        }`}
                      />
                    </Button>
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                        Bugünün Kelimesi
                      </p>
                      <h3 className="text-3xl font-bold text-gradient mb-2 break-words">
                        {item.word}
                      </h3>
                      {item.pronunciation && (
                        <div className="inline-flex items-center justify-center gap-1.5 text-muted-foreground w-full">
                          <button
                            onClick={(e) => handleSpeak(e, item.word)}
                            className="hover:text-primary transition-colors shrink-0"
                          >
                            <Volume2 className="w-4 h-4" />
                          </button>
                          <span className="text-sm italic truncate">
                            {item.pronunciation}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-auto pt-4">
                      Kartı çevirmek için tıklayın →
                    </p>
                  </CardContent>
                </Card>

                {/* Back */}
                <Card
                  className="absolute inset-0 border-0 shadow-lg shadow-primary/5 overflow-hidden backface-hidden [transform:rotateY(180deg)] flex flex-col"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="h-2 gradient-warm shrink-0" />
                  <CardContent className="p-6 sm:p-8 text-center relative flex-1 flex flex-col justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`absolute top-4 right-4 z-10 h-9 w-9 rounded-full transition-all duration-300 ${
                        isSaved
                          ? "text-red-500 hover:text-red-600 hover:bg-red-50"
                          : "text-muted-foreground hover:text-red-500 hover:bg-red-50"
                      }`}
                      onClick={(e) => handleToggleSave(e, item)}
                      disabled={isSaving}
                    >
                      <Heart
                        className={`w-5 h-5 transition-all duration-300 ${
                          isSaved ? "fill-current scale-110" : ""
                        }`}
                      />
                    </Button>
                    <div className="mb-3 max-h-[220px] overflow-y-auto mt-4 custom-scrollbar">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                        Türkçe Anlamı
                      </p>
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        {item.meaning}
                      </h3>
                      {item.example_sentence && (
                        <div className="bg-muted/50 rounded-xl p-3 text-left">
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                            Örnek Cümle
                          </p>
                          <p className="text-xs text-foreground italic leading-relaxed">
                            &quot;{item.example_sentence}&quot;
                          </p>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-auto pt-2">
                      ← Geri çevirmek için tıklayın
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
