"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookMarked,
  Plus,
  Loader2,
  Trash2,
  Sparkles,
  Volume2,
} from "lucide-react";
import { toast } from "sonner";
import { dailyWordSchema } from "@/lib/validations";
import type { DailyWord } from "@/types";

export default function AdminGununKelimesiPage() {
  const [words, setWords] = useState<DailyWord[]>([]);
  const [word, setWord] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [meaning, setMeaning] = useState("");
  const [exampleSentence, setExampleSentence] = useState("");
  const [level, setLevel] = useState("A1");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWords();
  }, []);

  async function fetchWords() {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase
        .from("daily_words")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setWords(data);
    } catch (error) {
      console.error("Failed to fetch words:", error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = dailyWordSchema.safeParse({
      word,
      pronunciation,
      meaning,
      example_sentence: exampleSentence,
      level,
    });

    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.from("daily_words").insert({
        word,
        pronunciation: pronunciation || null,
        meaning,
        example_sentence: exampleSentence || null,
        level: level || "A1",
      });

      if (error) throw error;

      toast.success("Günün kelimesi eklendi!");
      setWord("");
      setPronunciation("");
      setMeaning("");
      setExampleSentence("");
      setLevel("A1");
      fetchWords();
    } catch (error) {
      console.error("Insert error:", error);
      toast.error("Ekleme sırasında bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kelimeyi silmek istediğinizden emin misiniz?")) return;

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.from("daily_words").delete().eq("id", id);
      setWords((prev) => prev.filter((w) => w.id !== id));
      toast.success("Kelime silindi");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Silme sırasında bir hata oluştu.");
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookMarked className="w-6 h-6" />
          Günün Kelimesi
        </h1>
        <p className="text-muted-foreground mt-1">
          Ana sayfada gösterilecek günün kelimesini yönetin
        </p>
      </div>

      {/* Add Word Form */}
      <Card className="border-0 shadow-md shadow-black/5 mb-8">
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni Kelime Ekle
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dw-word">İngilizce Kelime *</Label>
                <Input
                  id="dw-word"
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  placeholder="Resilience"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dw-pronunciation">Okunuş</Label>
                <Input
                  id="dw-pronunciation"
                  value={pronunciation}
                  onChange={(e) => setPronunciation(e.target.value)}
                  placeholder="/rɪˈzɪl.i.əns/"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dw-meaning">Türkçe Anlamı *</Label>
              <Input
                id="dw-meaning"
                value={meaning}
                onChange={(e) => setMeaning(e.target.value)}
                placeholder="Dayanıklılık, esneklik"
              />
            </div>
            <div className="space-y-2">
              <Label>Seviye</Label>
              <Select value={level} onValueChange={(val) => setLevel(val || "A1")}>
                <SelectTrigger>
                  <SelectValue placeholder="Seviye seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">A1 - Başlangıç</SelectItem>
                  <SelectItem value="A2">A2 - Temel</SelectItem>
                  <SelectItem value="B1">B1 - Orta</SelectItem>
                  <SelectItem value="B2">B2 - Orta Üstü</SelectItem>
                  <SelectItem value="C1">C1 - İleri</SelectItem>
                  <SelectItem value="C2">C2 - Yetkin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dw-example">Örnek Cümle</Label>
              <Textarea
                id="dw-example"
                value={exampleSentence}
                onChange={(e) => setExampleSentence(e.target.value)}
                placeholder="Her resilience in the face of adversity inspired everyone."
                rows={2}
              />
            </div>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 gradient-primary border-0 text-white hover:opacity-90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Ekleniyor...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Kelime Ekle
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Words List */}
      <Card className="border-0 shadow-md shadow-black/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold">Kelime Geçmişi</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kelime</TableHead>
                <TableHead>Okunuş</TableHead>
                <TableHead>Anlam</TableHead>
                <TableHead>Seviye</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {words.map((w) => (
                <TableRow key={w.id}>
                  <TableCell className="font-semibold">{w.word}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {w.pronunciation && (
                      <span className="flex items-center gap-1">
                        <Volume2 className="w-3 h-3" />
                        {w.pronunciation}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{w.meaning}</TableCell>
                  <TableCell>
                    {w.level ? (
                      <Badge variant="outline">{w.level}</Badge>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(w.created_at).toLocaleDateString("tr-TR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(w.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {words.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <BookMarked className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Henüz kelime eklenmemiş
                    </p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
