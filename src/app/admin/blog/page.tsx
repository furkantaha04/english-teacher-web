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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { BlogPost } from "@/types";

const categoryOptions = [
  { value: "sinav", label: "Sınav Taktikleri" },
  { value: "gramer", label: "Gramer" },
  { value: "kelime", label: "Kelime" },
  { value: "genel", label: "Genel" },
];

const categoryLabels: Record<string, string> = {
  sinav: "Sınav Taktikleri",
  gramer: "Gramer",
  kelime: "Kelime",
  genel: "Genel",
};

const emptyForm = {
  title: "",
  slug: "",
  category: "genel",
  summary: "",
  content: "",
  published: false,
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchPosts = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error("Failed to fetch blog posts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
      .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
      .replace(/İ/g, "i").replace(/Ğ/g, "g").replace(/Ü/g, "u")
      .replace(/Ş/g, "s").replace(/Ö/g, "o").replace(/Ç/g, "c")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: editingId ? prev.slug : generateSlug(title),
    }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.slug || !form.content) {
      toast.error("Lütfen başlık, slug ve içerik alanlarını doldurun.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      if (editingId) {
        const { error } = await supabase
          .from("blog_posts")
          .update({
            title: form.title,
            slug: form.slug,
            category: form.category,
            summary: form.summary,
            content: form.content,
            published: form.published,
          })
          .eq("id", editingId);

        if (error) throw error;
        toast.success("Yazı güncellendi!");
      } else {
        const { error } = await supabase.from("blog_posts").insert({
          title: form.title,
          slug: form.slug,
          category: form.category,
          summary: form.summary,
          content: form.content,
          published: form.published,
        });

        if (error) throw error;
        toast.success("Yazı eklendi!");
      }

      setForm(emptyForm);
      setEditingId(null);
      setDialogOpen(false);
      fetchPosts();
    } catch (error) {
      console.error("Blog save error:", error);
      toast.error("İşlem başarısız.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingId(post.id);
    setForm({
      title: post.title,
      slug: post.slug,
      category: post.category,
      summary: post.summary,
      content: post.content,
      published: post.published,
    });
    setDialogOpen(true);
  };

  const handleTogglePublish = async (id: string, published: boolean) => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase
        .from("blog_posts")
        .update({ published: !published })
        .eq("id", id);

      if (error) throw error;
      toast.success(published ? "Yazı yayından kaldırıldı." : "Yazı yayınlandı!");
      fetchPosts();
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error("İşlem başarısız.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yazıyı silmek istediğinize emin misiniz?")) return;

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.from("blog_posts").delete().eq("id", id);

      if (error) throw error;
      toast.success("Yazı silindi.");
      fetchPosts();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Silme başarısız.");
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Blog Yönetimi
          </h1>
          <p className="text-muted-foreground mt-1">
            Blog yazılarını ekleyin, düzenleyin ve yönetin.
          </p>
        </div>
        <Button
          className="gap-2 gradient-primary border-0 text-white hover:opacity-90"
          onClick={() => setDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Yeni Yazı
        </Button>
        <Dialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setEditingId(null);
              setForm(emptyForm);
            }
          }}
        >

          <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Yazıyı Düzenle" : "Yeni Blog Yazısı"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Başlık *</Label>
                <Input
                  value={form.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Yazı başlığı"
                />
              </div>
              <div className="space-y-2">
                <Label>Slug *</Label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  placeholder="yazi-url-adresi"
                />
                <p className="text-xs text-muted-foreground">URL adresi: /blog/{form.slug || "..."}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Kategori</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, category: value || prev.category }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Durum</Label>
                  <Select
                    value={form.published ? "published" : "draft"}
                    onValueChange={(value) => setForm((prev) => ({ ...prev, published: value === "published" }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Taslak</SelectItem>
                      <SelectItem value="published">Yayında</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Özet</Label>
                <Textarea
                  value={form.summary}
                  onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder="Kısa yazı özeti..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label>İçerik *</Label>
                <Textarea
                  value={form.content}
                  onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Yazı içeriği..."
                  rows={10}
                />
              </div>
              <Button
                className="w-full gap-2 gradient-primary border-0 text-white hover:opacity-90"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : editingId ? (
                  <Edit className="w-4 h-4" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {editingId ? "Güncelle" : "Ekle"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-md shadow-black/5">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Durum</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : posts.length > 0 ? (
                posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      {post.published ? (
                        <Badge className="bg-green-100 text-green-700 text-xs">Yayında</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Taslak</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-[250px] truncate">{post.title}</TableCell>
                    <TableCell className="text-sm">{categoryLabels[post.category] || post.category}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(post.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleTogglePublish(post.id, post.published)}
                        >
                          {post.published ? (
                            <EyeOff className="w-3.5 h-3.5" />
                          ) : (
                            <Eye className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleEdit(post)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Henüz blog yazısı yok.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
