"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
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
import { Loader2, Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { PlacementQuestion } from "@/types";

export default function PlacementQuestionsAdmin() {
  const [questions, setQuestions] = useState<PlacementQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<"Tümü" | "A1" | "A2" | "B1" | "B2" | "C1" | "C2">("Tümü");

  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    question_text: string;
    options: string[];
    correct_option: number;
    level: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
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

  // Derived state for stats and filtering
  const totalQuestions = questions.length;
  const levelCounts = {
    A1: questions.filter(q => q.level === "A1").length,
    A2: questions.filter(q => q.level === "A2").length,
    B1: questions.filter(q => q.level === "B1").length,
    B2: questions.filter(q => q.level === "B2").length,
    C1: questions.filter(q => q.level === "C1").length,
    C2: questions.filter(q => q.level === "C2").length,
  };

  const filteredQuestions = questions.filter(q => {
    const matchesLevel = levelFilter === "Tümü" || q.level === levelFilter;
    const matchesSearch = q.question_text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Seviye Tespit Soruları</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Sınavdaki soruları buradan yönetebilir ve filtreleyebilirsiniz.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Yeni Soru Ekle
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="flex overflow-x-auto pb-4 mb-2 gap-3 snap-x">
        <Card className="bg-primary/10 border-primary/20 shrink-0 min-w-[110px] snap-start">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalQuestions}</div>
            <div className="text-xs text-muted-foreground mt-1 font-medium">Toplam Soru</div>
          </CardContent>
        </Card>
        {Object.entries(levelCounts).map(([level, count]) => (
          <Card key={level} className="shrink-0 min-w-[90px] snap-start">
            <CardContent className="p-4 text-center">
              <div className="text-xl font-bold">{count}</div>
              <div className="text-xs text-muted-foreground mt-1 font-medium">{level} Seviyesi</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-start md:items-center justify-between">
        <div className="flex w-full md:w-auto items-center gap-2 overflow-x-auto pb-2 md:pb-0 snap-x">
          <Button 
            variant={levelFilter === "Tümü" ? "default" : "outline"}
            size="sm"
            onClick={() => setLevelFilter("Tümü")}
            className="shrink-0 snap-start"
          >
            Tümü
          </Button>
          {(["A1", "A2", "B1", "B2", "C1", "C2"] as const).map((level) => (
            <Button 
              key={level}
              variant={levelFilter === level ? "default" : "outline"}
              size="sm"
              onClick={() => setLevelFilter(level)}
              className="shrink-0 snap-start"
            >
              {level}
            </Button>
          ))}
        </div>
        
        <div className="relative w-full md:w-72 shrink-0">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Soru metninde ara..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <div className="text-sm text-muted-foreground mb-4">
        {levelFilter !== "Tümü" && <span className="font-semibold text-foreground mr-1">{levelFilter} seviyesinde</span>}
        {filteredQuestions.length} soru bulundu.
      </div>

      {/* Table */}
      <div className="border border-border rounded-xl bg-card overflow-x-auto">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[80px]">Seviye</TableHead>
              <TableHead>Soru</TableHead>
              <TableHead className="text-right w-[120px]">İşlemler</TableHead>
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
            ) : filteredQuestions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-10">
                  <p className="text-muted-foreground">Kayıtlı soru bulunamadı.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredQuestions.map((q) => (
                <TableRow key={q.id}>
                  <TableCell>
                    <Badge variant="outline">{q.level}</Badge>
                  </TableCell>
                  <TableCell className="max-w-md sm:max-w-lg truncate">
                    {q.question_text}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1 sm:gap-2">
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

      {/* Dialog for Edit / Create */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
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
                    setFormData({ ...formData, level: val as "A1" | "A2" | "B1" | "B2" | "C1" | "C2" })
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
                    <SelectItem value="C2">C2</SelectItem>
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
                className="w-full sm:w-auto"
              >
                İptal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto mt-2 sm:mt-0">
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
