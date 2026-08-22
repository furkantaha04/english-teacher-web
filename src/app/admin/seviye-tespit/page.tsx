"use client";

import { useEffect, useState } from "react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PlacementQuestion } from "@/types";

export default function PlacementQuestionsAdmin() {
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    question_text: string;
    options: string[];
    correct_option: number;
    level: "A1" | "A2" | "B1" | "B2" | "C1";
  }>({
    question_text: "",
    options: ["", "", "", ""],
    correct_option: 0,
    level: "A1",
  });

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("placement_questions")
        .select("*")
        .order("level", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
      toast.error("Sorular yüklenirken bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const handleOpenDialog = (question?: PlacementQuestion) => {
    if (question) {
      setEditingId(question.id);
      setFormData({
        question_text: question.question_text,
        options: question.options,
        correct_option: question.correct_option,
        level: question.level,
      });
    } else {
      setEditingId(null);
      setFormData({
        question_text: "",
        options: ["", "", "", ""],
        correct_option: 0,
        level: "A1",
      });
    }
    setIsDialogOpen(true);
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.question_text.trim()) {
      toast.error("Soru metni boş olamaz.");
      return;
    }
    if (formData.options.some((opt) => !opt.trim())) {
      toast.error("Tüm seçenekler doldurulmalıdır.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      if (editingId) {
        const { error } = await supabase
          .from("placement_questions")
          .update({
            question_text: formData.question_text,
            options: formData.options,
            correct_option: formData.correct_option,
            level: formData.level,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Soru başarıyla güncellendi.");
      } else {
        const { error } = await supabase.from("placement_questions").insert({
          question_text: formData.question_text,
          options: formData.options,
          correct_option: formData.correct_option,
          level: formData.level,
        });

        if (error) throw error;
        toast.success("Yeni soru başarıyla eklendi.");
      }

      setIsDialogOpen(false);
      fetchQuestions();
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error("Kaydedilirken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase
        .from("placement_questions")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Soru silindi.");
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Silinirken bir hata oluştu.");
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Seviye Tespit Soruları</h1>
          <p className="text-muted-foreground mt-1">
            Sınavdaki soruları buradan yönetebilirsiniz.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus className="w-4 h-4" />
          Yeni Soru Ekle
        </Button>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[100px]">Seviye</TableHead>
              <TableHead>Soru</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground mt-2">Yükleniyor...</p>
                </TableCell>
              </TableRow>
            ) : questions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10">
                  <p className="text-muted-foreground">Kayıtlı soru bulunamadı.</p>
                </TableCell>
              </TableRow>
            ) : (
              questions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>
                    <Badge variant="outline">{q.level}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {q.question_text}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(q)}
                      >
                        <Pencil className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(q.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Soruyu Düzenle" : "Yeni Soru Ekle"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="space-y-2">
              <Label htmlFor="question_text">Soru Metni *</Label>
              <Textarea
                id="question_text"
                placeholder="Örn: She ___ to school every day."
                value={formData.question_text}
                onChange={(e) =>
                  setFormData({ ...formData, question_text: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="level">Seviye *</Label>
                <Select
                  value={formData.level}
                  onValueChange={(val) =>
                    setFormData({ ...formData, level: val as "A1" | "A2" | "B1" | "B2" | "C1" })
                  }
                >
                  <SelectTrigger id="level">
                    <SelectValue placeholder="Seviye Seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A1">A1</SelectItem>
                    <SelectItem value="A2">A2</SelectItem>
                    <SelectItem value="B1">B1</SelectItem>
                    <SelectItem value="B2">B2</SelectItem>
                    <SelectItem value="C1">C1</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="correct_option">Doğru Seçenek *</Label>
                <Select
                  value={formData.correct_option.toString()}
                  onValueChange={(val) =>
                    setFormData({ ...formData, correct_option: parseInt(val || "0") })
                  }
                >
                  <SelectTrigger id="correct_option">
                    <SelectValue placeholder="Doğru Seçeneği Belirle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">A Seçeneği</SelectItem>
                    <SelectItem value="1">B Seçeneği</SelectItem>
                    <SelectItem value="2">C Seçeneği</SelectItem>
                    <SelectItem value="3">D Seçeneği</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <Label>Seçenekler (Şıklar) *</Label>
              {formData.options.map((opt, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <Input
                    placeholder={`${String.fromCharCode(65 + index)} seçeneği`}
                    value={opt}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    required
                  />
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  "Kaydet"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
