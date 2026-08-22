"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
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
  Inbox,
  Mail,
  MailOpen,
  Phone,
  MessageCircle,
  CheckCircle2,
  Eye,
  Calendar,
  User,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { ContactMessage } from "@/types";

// Fallback messages removed.

export default function AdminMesajlarPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    async function fetchMessages() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data, error } = await supabase
          .from("contact_messages")
          .select("*")
          .order("created_at", { ascending: false });

        if (data && data.length > 0) {
          setMessages(data);
        }
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      }
    }
    fetchMessages();
  }, []);

  const handleOpenMessage = async (message: ContactMessage) => {
    setSelectedMessage(message);
    setDialogOpen(true);

    if (!message.is_read) {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        await supabase
          .from("contact_messages")
          .update({ is_read: true })
          .eq("id", message.id);

        setMessages((prev) =>
          prev.map((m) => (m.id === message.id ? { ...m, is_read: true } : m))
        );
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
  };

  const handleToggleReplied = async (messageId: string, currentState: boolean) => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase
        .from("contact_messages")
        .update({ is_replied: !currentState })
        .eq("id", messageId);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, is_replied: !currentState } : m
        )
      );

      if (selectedMessage?.id === messageId) {
        setSelectedMessage((prev) =>
          prev ? { ...prev, is_replied: !currentState } : null
        );
      }

      toast.success(!currentState ? "Cevaplandı olarak işaretlendi" : "İşaret kaldırıldı");
    } catch (error) {
      console.error("Failed to toggle replied:", error);
      toast.error("Bir hata oluştu");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm("Bu mesajı silmek istediğinize emin misiniz?")) return;
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.from("contact_messages").delete().eq("id", messageId);
      if (error) throw error;

      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setDialogOpen(false);
        setSelectedMessage(null);
      }
      toast.success("Mesaj başarıyla silindi");
    } catch (error) {
      console.error("Failed to delete message:", error);
      toast.error("Mesaj silinirken bir hata oluştu");
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Inbox className="w-6 h-6" />
          Gelen Mesajlar
        </h1>
        <p className="text-muted-foreground mt-1">
          İletişim formundan gelen tüm mesajlar
        </p>
      </div>

      <Card className="border-0 shadow-md shadow-black/5 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Durum</TableHead>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>E-posta</TableHead>
                <TableHead>Seviye</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {messages.map((message) => (
                <TableRow
                  key={message.id}
                  className={`cursor-pointer hover:bg-muted/50 ${
                    !message.is_read ? "bg-primary/5 font-medium" : ""
                  }`}
                  onClick={() => handleOpenMessage(message)}
                >
                  <TableCell>
                    <div className="flex gap-1.5">
                      {!message.is_read && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          Okunmadı
                        </Badge>
                      )}
                      {message.is_replied && (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          Cevaplandı
                        </Badge>
                      )}
                      {message.is_read && !message.is_replied && (
                        <Badge variant="outline" className="text-xs">
                          Okundu
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {message.name} {message.surname}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {message.email}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{message.level}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatDate(message.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      Detay
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {messages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Inbox className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Henüz mesaj yok</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Message Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Mesaj Detayı
            </DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Ad Soyad</p>
                    <p className="font-medium text-sm">
                      {selectedMessage.name} {selectedMessage.surname}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Tarih</p>
                    <p className="font-medium text-sm">
                      {formatDate(selectedMessage.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{selectedMessage.email}</span>
              </div>

              {selectedMessage.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{selectedMessage.phone}</span>
                </div>
              )}

              <div>
                <Badge variant="outline" className="mb-2">
                  Seviye: {selectedMessage.level}
                </Badge>
              </div>

              <div className="bg-muted/50 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">Mesaj</p>
                <p className="text-sm leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                {selectedMessage.phone && (
                  <a
                    href={`https://wa.me/90${selectedMessage.phone.replace(/\D/g, "").replace(/^0/, "")}?text=${encodeURIComponent(
                      `Merhaba ${selectedMessage.name}, İngilizce dersleri hakkındaki mesajınızı aldım.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonVariants({ variant: "outline", size: "sm", className: "gap-2 flex-1" })}
                  >
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    WhatsApp
                  </a>
                )}
                <a 
                  href={`mailto:${selectedMessage.email}`}
                  className={buttonVariants({ variant: "outline", size: "sm", className: "gap-2 flex-1" })}
                >
                  <Mail className="w-4 h-4" />
                  E-posta Gönder
                </a>
                <Button
                  variant={selectedMessage.is_replied ? "secondary" : "default"}
                  size="sm"
                  className={`gap-2 flex-1 ${
                    !selectedMessage.is_replied
                      ? "gradient-primary border-0 text-white"
                      : ""
                  }`}
                  onClick={() =>
                    handleToggleReplied(
                      selectedMessage.id,
                      selectedMessage.is_replied
                    )
                  }
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {selectedMessage.is_replied
                    ? "Cevaplandı ✓"
                    : "Cevaplandı İşaretle"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="gap-2 flex-1"
                  onClick={() => handleDeleteMessage(selectedMessage.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Sil
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
