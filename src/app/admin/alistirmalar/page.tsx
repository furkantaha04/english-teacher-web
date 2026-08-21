"use client";

import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Upload,
  Loader2,
  Trash2,
  FileText,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { exerciseUploadSchema } from "@/lib/validations";
import type { Exercise } from "@/types";

export default function AdminAlistirmalarPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchExercises();
  }, []);

  async function fetchExercises() {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data } = await supabase
        .from("exercises")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) setExercises(data);
    } catch (error) {
      console.error("Failed to fetch exercises:", error);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = exerciseUploadSchema.safeParse({ title, level, category });
    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    if (!file) {
      toast.error("Lütfen bir dosya seçin");
      return;
    }

    setIsUploading(true);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      // Upload file to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("exercises")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("exercises").getPublicUrl(fileName);

      // Insert into database
      const { error: insertError } = await supabase.from("exercises").insert({
        title,
        level,
        category,
        file_url: publicUrl,
        file_name: file.name,
      });

      if (insertError) throw insertError;

      toast.success("Alıştırma başarıyla yüklendi!");
      setTitle("");
      setLevel("");
      setCategory("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchExercises();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Yükleme sırasında bir hata oluştu. Supabase bağlantısını kontrol edin.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu alıştırmayı silmek istediğinizden emin misiniz?")) return;

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.from("exercises").delete().eq("id", id);
      setExercises((prev) => prev.filter((e) => e.id !== id));
      toast.success("Alıştırma silindi");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Silme sırasında bir hata oluştu.");
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
          PDF ve alıştırma dosyalarını yükleyin ve yönetin
        </p>
      </div>

      {/* Upload Form */}
      <Card className="border-0 shadow-md shadow-black/5 mb-8">
        <CardContent className="p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Yeni Alıştırma Yükle
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ex-title">Başlık</Label>
                <Input
                  id="ex-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Alıştırma başlığı"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ex-level">Seviye</Label>
                <Select value={level} onValueChange={(val) => setLevel(val || "")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seviye seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A1-A2">A1-A2</SelectItem>
                    <SelectItem value="B1-B2">B1-B2</SelectItem>
                    <SelectItem value="C1">C1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ex-category">Kategori</Label>
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
            <div className="space-y-2">
              <Label htmlFor="ex-file">Dosya (PDF)</Label>
              <Input
                id="ex-file"
                type="file"
                accept=".pdf,.doc,.docx"
                ref={fileInputRef}
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
            <Button
              type="submit"
              disabled={isUploading}
              className="gap-2 gradient-primary border-0 text-white hover:opacity-90"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Yükle
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
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exercises.map((exercise) => (
                <TableRow key={exercise.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      {exercise.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{exercise.level}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {exercise.category}
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
                  <TableCell colSpan={5} className="text-center py-12">
                    <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Henüz alıştırma yüklenmemiş
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
