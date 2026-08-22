"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BookOpen,
  Loader2,
  Trash2,
  FileText,
  Plus,
  ExternalLink,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { exerciseUploadSchema } from "@/lib/validations";
import type { Exercise } from "@/types";

export default function AdminAlistirmalarPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [solutionUrl, setSolutionUrl] = useState("");
  const [solutionExplanation, setSolutionExplanation] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  async function fetchExercises() {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setExercises(data);
    } catch (error: any) {
      console.error("Failed to fetch exercises:", error);
      toast.error(`Alıştırmalar yüklenemedi: ${error?.message || "Bilinmeyen hata"}`);
    }
  }

  const resetForm = () => {
    setTitle("");
    setLevel("");
    setCategory("");
    setDescription("");
    setFileUrl("");
    setSolutionUrl("");
    setSolutionExplanation("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = exerciseUploadSchema.safeParse({
      title,
      level,
      category,
      description,
      file_url: fileUrl,
      solution_url: solutionUrl || undefined,
      solution_explanation: solutionExplanation,
    });

    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    setIsSubmitting(true);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.from("exercises").insert({
        title,
        level,
        category,
        description: description || null,
        file_url: fileUrl,
        file_name: null,
        solution_url: solutionUrl || null,
        solution_explanation: solutionExplanation || null,
      });

      if (error) throw error;

      toast.success("Alıştırma başarıyla eklendi!");
      resetForm();
      fetchExercises();
    } catch (error: any) {
      console.error("Insert error:", error);
      toast.error(`Ekleme sırasında hata: ${error?.message || "Bilinmeyen hata"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu alıştırmayı silmek istediğinizden emin misiniz?")) return;

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.from("exercises").delete().eq("id", id);
      if (error) throw error;
      setExercises((prev) => prev.filter((e) => e.id !== id));
      toast.success("Alıştırma silindi");
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(`Silme hatası: ${error?.message || "Bilinmeyen hata"}`);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6" />
          Alıştırma Yönetimi
        </h1>
        <p className="text-muted-foreground mt-1">
          Alıştırma ve cevap anahtarı bağlantılarını yönetin
        </p>
      </div>

      {/* Add Exercise Form */}
      <Card className="border-0 shadow-md shadow-black/5 mb-8">
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni Alıştırma Ekle
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Title */}
            <div className="space-y-2">
              <Label htmlFor="ex-title">Başlık *</Label>
              <Input
                id="ex-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Present Simple & Present Continuous"
              />
            </div>

            {/* Row 2: Level + Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Seviye *</Label>
                <Select value={level} onValueChange={(val) => setLevel(val || "")}>
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
                <Label>Kategori *</Label>
                <Select value={category} onValueChange={(val) => setCategory(val || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Grammar">Grammar</SelectItem>
                    <SelectItem value="Vocabulary">Vocabulary</SelectItem>
                    <SelectItem value="Reading">Reading</SelectItem>
                    <SelectItem value="Writing">Writing</SelectItem>
                    <SelectItem value="Listening">Listening</SelectItem>
                    <SelectItem value="Speaking">Speaking</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 3: Description */}
            <div className="space-y-2">
              <Label htmlFor="ex-desc">Açıklama</Label>
              <Textarea
                id="ex-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Alıştırma hakkında kısa açıklama..."
                rows={2}
              />
            </div>

            {/* Row 4: File URL + Solution URL */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ex-file-url">
                  Alıştırma PDF / Drive Linki *
                </Label>
                <Input
                  id="ex-file-url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ex-solution-url">
                  Cevap Anahtarı PDF / Drive Linki
                </Label>
                <Input
                  id="ex-solution-url"
                  value={solutionUrl}
                  onChange={(e) => setSolutionUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/..."
                />
              </div>
            </div>

            {/* Row 5: Solution Explanation */}
            <div className="space-y-2">
              <Label htmlFor="ex-solution-exp">
                Çözüm Notu / Açıklaması (Opsiyonel)
              </Label>
              <Textarea
                id="ex-solution-exp"
                value={solutionExplanation}
                onChange={(e) => setSolutionExplanation(e.target.value)}
                placeholder="Cevaplar hakkında detaylı açıklama, ipuçları veya notlar..."
                rows={3}
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
                  <Plus className="w-4 h-4" />
                  Alıştırma Ekle
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Exercise List */}
      <Card className="border-0 shadow-md shadow-black/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold">Mevcut Alıştırmalar</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Başlık</TableHead>
                <TableHead>Seviye</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Linkler</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercises.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell className="font-medium max-w-[200px]">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{exercise.title}</span>
                    </div>
                    {exercise.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[180px]">
                        {exercise.description}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{exercise.level}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {exercise.category}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {exercise.file_url && (
                        <a
                          href={exercise.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80 transition-colors"
                          title="Alıştırma"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                      {exercise.solution_url && (
                        <a
                          href={exercise.solution_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-500 hover:text-amber-600 transition-colors"
                          title="Cevap Anahtarı"
                        >
                          <KeyRound className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(exercise.created_at).toLocaleDateString("tr-TR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(exercise.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {exercises.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Henüz alıştırma eklenmemiş
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
