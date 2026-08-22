"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Send, Loader2, CheckCircle2, Mail } from "lucide-react";
import { toast } from "sonner";
import { contactFormSchema, type ContactFormValues } from "@/lib/validations";

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormValues>({
    name: "",
    surname: "",
    email: "",
    phone: "",
    level: "A1",
    message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ContactFormValues, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof ContactFormValues]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with Zod
    const result = contactFormSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ContactFormValues, string>> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ContactFormValues] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { error } = await supabase.from("contact_messages").insert({
        name: formData.name,
        surname: formData.surname,
        email: formData.email,
        phone: formData.phone || null,
        level: formData.level,
        message: formData.message,
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast.success("Mesajınız başarıyla gönderildi!", {
        description: "En kısa sürede size dönüş yapılacaktır.",
      });
    } catch (error) {
      console.error("Supabase error:", error);
      toast.error("Mesaj gönderilemedi", {
        description: "Lütfen daha sonra tekrar deneyiniz.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <section id="iletisim" className="section-padding">
        <div className="container-main max-w-2xl">
          <Card className="border-0 shadow-lg shadow-primary/5">
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Teşekkür Ederiz!</h3>
              <p className="text-muted-foreground">
                Mesajınız başarıyla gönderildi. En kısa sürede size dönüş
                yapılacaktır.
              </p>
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => {
                  setIsSubmitted(false);
                  setFormData({
                    name: "",
                    surname: "",
                    email: "",
                    phone: "",
                    level: "A1",
                    message: "",
                  });
                }}
              >
                Yeni Mesaj Gönder
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section id="iletisim" className="section-padding">
      <div className="container-main max-w-2xl">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3 px-3 py-1">
            <Mail className="w-3.5 h-3.5 mr-1.5" />
            İletişim
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ücretsiz Ön Görüşme Başvurusu
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Bilgilerinizi bırakın, size en uygun ders programını birlikte
            belirleyelim.
          </p>
        </div>

        <Card className="border-0 shadow-lg shadow-primary/5">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Ad *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Adınız"
                    className={errors.name ? "border-destructive" : ""}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="surname">Soyad *</Label>
                  <Input
                    id="surname"
                    name="surname"
                    value={formData.surname}
                    onChange={handleChange}
                    placeholder="Soyadınız"
                    className={errors.surname ? "border-destructive" : ""}
                  />
                  {errors.surname && (
                    <p className="text-xs text-destructive">{errors.surname}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ornek@email.com"
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="05XX XXX XX XX"
                  />
                  {errors.phone && (
                    <p className="text-xs text-destructive">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Mevcut İngilizce Seviyeniz *</Label>
                <Select
                  value={formData.level}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, level: (value as ContactFormValues["level"]) || "A1" }))
                  }
                >
                  <SelectTrigger className={errors.level ? "border-destructive" : ""}>
                    <SelectValue placeholder="Seviye seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A1">A1 - Başlangıç</SelectItem>
                    <SelectItem value="A2">A2 - Temel</SelectItem>
                    <SelectItem value="B1">B1 - Orta Altı</SelectItem>
                    <SelectItem value="B2">B2 - Orta Üstü</SelectItem>
                    <SelectItem value="C1">C1 - İleri</SelectItem>
                  </SelectContent>
                </Select>
                {errors.level && (
                  <p className="text-xs text-destructive">{errors.level}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mesajınız *</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Hedefiniz, mevcut durumunuz veya sormak istediğiniz herhangi bir şey..."
                  rows={4}
                  className={errors.message ? "border-destructive" : ""}
                />
                {errors.message && (
                  <p className="text-xs text-destructive">{errors.message}</p>
                )}
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
                    Başvuruyu Gönder
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
