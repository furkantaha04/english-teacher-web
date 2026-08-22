"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  MessageCircle,
  Plus,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import type { DailyDiscussion, DiscussionReply } from "@/types";

export default function AdminToplulukPage() {
  const [discussions, setDiscussions] = useState<DailyDiscussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [repliesOpen, setRepliesOpen] = useState(false);
  const [selectedReplies, setSelectedReplies] = useState<DiscussionReply[]>([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [newDiscussion, setNewDiscussion] = useState({ title: "", question: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDiscussions = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("daily_discussions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDiscussions(data || []);
    } catch (error) {
      console.error("Failed to fetch discussions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const handleAdd = async () => {
    if (!newDiscussion.title || !newDiscussion.question) {
      toast.error("Lütfen tüm alanları doldurun.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.from("daily_discussions").insert({
        title: newDiscussion.title,
        question: newDiscussion.question,
        is_active: false,
      });

      if (error) throw error;
      toast.success("Tartışma sorusu eklendi!");
      setNewDiscussion({ title: "", question: "" });
      setAddOpen(false);
      fetchDiscussions();
    } catch (error) {
      console.error("Add error:", error);
      toast.error("Ekleme başarısız.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, currentActive: boolean) => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      // If activating, deactivate all others first
      if (!currentActive) {
        await supabase
          .from("daily_discussions")
          .update({ is_active: false })
          .neq("id", id);
      }

      const { error } = await supabase
        .from("daily_discussions")
        .update({ is_active: !currentActive })
        .eq("id", id);

      if (error) throw error;
      toast.success(currentActive ? "Soru pasif edildi." : "Soru aktif edildi!");
      fetchDiscussions();
    } catch (error) {
      console.error("Toggle error:", error);
      toast.error("İşlem başarısız.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu tartışmayı silmek istediğinize emin misiniz?")) return;

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.from("daily_discussions").delete().eq("id", id);

      if (error) throw error;
      toast.success("Tartışma silindi.");
      fetchDiscussions();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Silme başarısız.");
    }
  };

  const handleViewReplies = async (discussionId: string, title: string) => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("discussion_replies")
        .select("*")
        .eq("discussion_id", discussionId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setSelectedReplies(data || []);
      setSelectedTitle(title);
      setRepliesOpen(true);
    } catch (error) {
      console.error("Failed to fetch replies:", error);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            Topluluk Yönetimi
          </h1>
          <p className="text-muted-foreground mt-1">
            Günün sorusunu ve öğrenci cevaplarını yönetin.
          </p>
        </div>
        <Button
          className="gap-2 gradient-primary border-0 text-white hover:opacity-90"
          onClick={() => setAddOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Yeni Soru
        </Button>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Yeni Tartışma Sorusu</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Başlık</Label>
                <Input
                  value={newDiscussion.title}
                  onChange={(e) => setNewDiscussion((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="Örn: Today's Topic: Travel"
                />
              </div>
              <div className="space-y-2">
                <Label>Soru</Label>
                <Textarea
                  value={newDiscussion.question}
                  onChange={(e) => setNewDiscussion((prev) => ({ ...prev, question: e.target.value }))}
                  placeholder="Örn: What is your favorite travel destination and why?"
                  rows={4}
                />
              </div>
              <Button
                className="w-full gap-2 gradient-primary border-0 text-white hover:opacity-90"
                disabled={isSubmitting}
                onClick={handleAdd}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Ekle
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
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : discussions.length > 0 ? (
                discussions.map((disc) => (
                  <TableRow key={disc.id}>
                    <TableCell>
                      {disc.is_active ? (
                        <Badge className="bg-green-100 text-green-700 text-xs">Aktif</Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Pasif</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-[300px] truncate">{disc.title}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(disc.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleViewReplies(disc.id, disc.title)}
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Cevaplar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleToggleActive(disc.id, disc.is_active)}
                        >
                          {disc.is_active ? (
                            <ToggleRight className="w-3.5 h-3.5 text-green-600" />
                          ) : (
                            <ToggleLeft className="w-3.5 h-3.5" />
                          )}
                          {disc.is_active ? "Pasif Et" : "Aktif Et"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(disc.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Henüz tartışma sorusu yok.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Replies Dialog */}
      <Dialog open={repliesOpen} onOpenChange={setRepliesOpen}>
        <DialogContent className="sm:max-w-lg max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              {selectedTitle}
            </DialogTitle>
          </DialogHeader>
          {selectedReplies.length > 0 ? (
            <div className="space-y-3">
              {selectedReplies.map((reply) => (
                <div
                  key={reply.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                    {reply.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{reply.user_name}</span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(reply.created_at)}
                      </span>
                    </div>
                    <p className="text-sm">{reply.reply_text}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">
              Henüz cevap yok.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
