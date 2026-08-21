"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Volume2 } from "lucide-react";
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
              <CardContent className="p-8 text-center">
                <div className="mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
                    Bugünün Kelimesi
                  </p>
                  <h3 className="text-4xl font-bold text-gradient mb-2">
                    {word.word}
                  </h3>
                  {word.pronunciation && (
                    <div className="inline-flex items-center gap-1.5 text-muted-foreground">
                      <Volume2 className="w-4 h-4" />
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
              <CardContent className="p-8 text-center">
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
