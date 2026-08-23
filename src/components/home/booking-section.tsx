"use client";

import { useState, useEffect } from "react";
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
  CalendarDays,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  BookOpen,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const lessonTypes = [
  { value: "ydt", label: "YDT Hazırlık" },
  { value: "yds", label: "YDS Hazırlık" },
  { value: "genel", label: "Genel İngilizce" },
  { value: "speaking", label: "Speaking & Conversation" },
  { value: "akademik", label: "Akademik İngilizce" },
];

const timeSlots = [
  "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00",
];

export default function BookingSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    lesson_type: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser({ id: session.user.id });
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoadingAuth(false);
      }
    }
    checkAuth();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.date || !formData.time || !formData.lesson_type) {
      toast.error("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      if (!user) {
        toast.error("Randevu almak için giriş yapmalısınız.");
        return;
      }

      // Check 1 week rule
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const { data: recentBookings, error: checkError } = await supabase
        .from("lesson_bookings")
        .select("id")
        .eq("user_id", user.id)
        .in("status", ["pending", "approved"])
        .gte("created_at", oneWeekAgo.toISOString());

      if (checkError) throw checkError;

      if (recentBookings && recentBookings.length > 0) {
        toast.error("Haftada yalnızca bir randevu talebinde bulunabilirsiniz.");
        setIsSubmitting(false);
        return;
      }

      const { error } = await supabase.from("lesson_bookings").insert({
        user_id: user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        date: formData.date,
        time: formData.time,
        lesson_type: formData.lesson_type,
        status: "pending",
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Randevu talebiniz alındı!", {
        description: "En kısa sürede size dönüş yapılacaktır.",
      });
    } catch (error) {
      console.error("Booking error:", error);
      toast.error("Randevu oluşturulamadı", {
        description: "Lütfen daha sonra tekrar deneyiniz.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section className="section-padding">
        <div className="container-main max-w-2xl">
          <Card className="border-0 shadow-lg shadow-primary/5">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Randevu Talebiniz Alındı!</h3>
              <p className="text-muted-foreground">
                Talebiniz onaylandıktan sonra size e-posta ile bilgilendirme yapılacaktır.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({ name: "", email: "", phone: "", date: "", time: "", lesson_type: "" });
                }}
              >
                Yeni Randevu Talebi
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  // Get tomorrow's date as minimum selectable date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-main max-w-2xl">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3 px-3 py-1">
            <CalendarDays className="w-3.5 h-3.5 mr-1.5" />
            Randevu Al
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Özel Ders Randevusu
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Size en uygun tarih ve saati seçin, biz hemen dönüş yapalım.
          </p>
        </div>

        {loadingAuth ? (
          <Card className="border-0 shadow-lg shadow-primary/5">
            <CardContent className="p-12 text-center flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : !user ? (
          <Card className="border-0 shadow-lg shadow-primary/5 border-dashed">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Giriş Yapmanız Gerekiyor</h3>
              <p className="text-muted-foreground mb-6">
                Özel ders randevusu oluşturmak için lütfen giriş yapın.
              </p>
              <Link href="/giris">
                <Button size="lg" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Giriş Yap
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-0 shadow-lg shadow-primary/5">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="booking-name">Ad Soyad *</Label>
                  <Input
                    id="booking-name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Adınız Soyadınız"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="booking-email">E-posta *</Label>
                  <Input
                    id="booking-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ornek@email.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking-phone">Telefon</Label>
                <Input
                  id="booking-phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="05XX XXX XX XX"
                />
              </div>

              <div className="space-y-2">
                <Label>Ders Tipi *</Label>
                <Select
                  value={formData.lesson_type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, lesson_type: value || prev.lesson_type }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Ders tipi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {lessonTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <BookOpen className="w-3.5 h-3.5 mr-1.5 inline" />
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="booking-date">Tercih Edilen Tarih *</Label>
                  <div className="relative">
                    <Input
                      id="booking-date"
                      name="date"
                      type="date"
                      min={minDate}
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tercih Edilen Saat *</Label>
                  <Select
                    value={formData.time}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, time: value || prev.time }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Saat seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          <Clock className="w-3.5 h-3.5 mr-1.5 inline" />
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full gap-2 gradient-primary border-0 text-white hover:opacity-90 transition-opacity"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Randevu Talebi Gönder
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        )}
      </div>
    </section>
  );
}
