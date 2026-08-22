"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
} from "@/components/ui/dialog";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Trash2,
  Mail,
  Phone,
  User,
  BookOpen,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import type { LessonBooking } from "@/types";

const lessonTypeLabels: Record<string, string> = {
  ydt: "YDT Hazırlık",
  yds: "YDS Hazırlık",
  genel: "Genel İngilizce",
  speaking: "Speaking & Conversation",
  akademik: "Akademik İngilizce",
};

export default function AdminRandevularPage() {
  const [bookings, setBookings] = useState<LessonBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<LessonBooking | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchBookings = async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data, error } = await supabase
        .from("lesson_bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Randevular yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase
        .from("lesson_bookings")
        .update({ status: "approved" })
        .eq("id", id);

      if (error) throw error;
      toast.success("Randevu onaylandı!");
      fetchBookings();
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Onaylama başarısız.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu randevuyu silmek istediğinize emin misiniz?")) return;

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase
        .from("lesson_bookings")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Randevu silindi.");
      setDialogOpen(false);
      fetchBookings();
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

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-primary" />
          Randevu Yönetimi
        </h1>
        <p className="text-muted-foreground mt-1">
          Gelen randevu taleplerini görüntüleyin ve yönetin.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-md shadow-black/5">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Toplam</p>
            <p className="text-2xl font-bold">{loading ? "—" : bookings.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md shadow-black/5">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Bekleyen</p>
            <p className="text-2xl font-bold text-amber-600">{loading ? "—" : pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md shadow-black/5">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Onaylanan</p>
            <p className="text-2xl font-bold text-green-600">{loading ? "—" : bookings.length - pendingCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-0 shadow-md shadow-black/5">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Durum</TableHead>
                <TableHead>Ad Soyad</TableHead>
                <TableHead>Ders Tipi</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Saat</TableHead>
                <TableHead className="text-right">İşlem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
                    Yükleniyor...
                  </TableCell>
                </TableRow>
              ) : bookings.length > 0 ? (
                bookings.map((booking) => (
                  <TableRow
                    key={booking.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setDialogOpen(true);
                    }}
                  >
                    <TableCell>
                      {booking.status === "pending" ? (
                        <Badge className="bg-amber-100 text-amber-700 text-xs">Bekliyor</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 text-xs">Onaylandı</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{booking.name}</TableCell>
                    <TableCell>{lessonTypeLabels[booking.lesson_type] || booking.lesson_type}</TableCell>
                    <TableCell>{formatDate(booking.date)}</TableCell>
                    <TableCell>{booking.time}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        {booking.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleApprove(booking.id)}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Onayla
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleDelete(booking.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Henüz randevu talebi yok.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Randevu Detayı
            </DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Durum</span>
                {selectedBooking.status === "pending" ? (
                  <Badge className="bg-amber-100 text-amber-700">Bekliyor</Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-700">Onaylandı</Badge>
                )}
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">{selectedBooking.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedBooking.email}</span>
                </div>
                {selectedBooking.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedBooking.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span>{lessonTypeLabels[selectedBooking.lesson_type] || selectedBooking.lesson_type}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <span>{formatDate(selectedBooking.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedBooking.time}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Oluşturulma: {formatDateTime(selectedBooking.created_at)}
              </p>
              <div className="flex gap-2 pt-2">
                {selectedBooking.status === "pending" && (
                  <Button
                    className="flex-1 gap-2 gradient-primary border-0 text-white hover:opacity-90"
                    onClick={() => {
                      handleApprove(selectedBooking.id);
                      setDialogOpen(false);
                    }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Onayla
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(selectedBooking.id)}
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
