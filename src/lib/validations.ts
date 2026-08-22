import { z } from "zod";

// ==========================================
// İletişim Formu Validasyonu
// ==========================================
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır")
    .max(50, "Ad en fazla 50 karakter olabilir"),
  surname: z
    .string()
    .min(2, "Soyad en az 2 karakter olmalıdır")
    .max(50, "Soyad en fazla 50 karakter olabilir"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, "Geçerli bir telefon numarası girin")
    .optional()
    .or(z.literal("")),
  level: z.enum(["A1", "A2", "B1", "B2", "C1"], {
    message: "Bir seviye seçin",
  }),
  message: z
    .string()
    .min(10, "Mesaj en az 10 karakter olmalıdır")
    .max(1000, "Mesaj en fazla 1000 karakter olabilir"),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

// ==========================================
// Quiz İletişim Bilgileri Validasyonu
// ==========================================
export const quizContactSchema = z.object({
  name: z
    .string()
    .min(2, "Ad en az 2 karakter olmalıdır"),
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]*$/, "Geçerli bir telefon numarası girin")
    .optional()
    .or(z.literal("")),
});

export type QuizContactValues = z.infer<typeof quizContactSchema>;

// ==========================================
// Alıştırma Yükleme Validasyonu
// ==========================================
export const exerciseUploadSchema = z.object({
  title: z
    .string()
    .min(3, "Başlık en az 3 karakter olmalıdır")
    .max(100, "Başlık en fazla 100 karakter olabilir"),
  level: z.enum(["A1-A2", "B1-B2", "C1"], {
    message: "Bir seviye seçin",
  }),
  category: z
    .string()
    .min(2, "Kategori seçin")
    .max(50, "Kategori en fazla 50 karakter olabilir"),
});

export type ExerciseUploadValues = z.infer<typeof exerciseUploadSchema>;

// ==========================================
// Günün Kelimesi Validasyonu
// ==========================================
export const dailyWordSchema = z.object({
  word: z
    .string()
    .min(1, "Kelime gereklidir")
    .max(100, "Kelime en fazla 100 karakter olabilir"),
  pronunciation: z
    .string()
    .max(100, "Okunuş en fazla 100 karakter olabilir")
    .optional()
    .or(z.literal("")),
  meaning: z
    .string()
    .min(1, "Türkçe anlam gereklidir")
    .max(200, "Anlam en fazla 200 karakter olabilir"),
  example_sentence: z
    .string()
    .max(500, "Örnek cümle en fazla 500 karakter olabilir")
    .optional()
    .or(z.literal("")),
  level: z
    .string()
    .optional()
    .or(z.literal("")),
});

export type DailyWordValues = z.infer<typeof dailyWordSchema>;

// ==========================================
// Admin Giriş Validasyonu
// ==========================================
export const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
});

export type LoginValues = z.infer<typeof loginSchema>;

// ==========================================
// Kayıt Validasyonu
// ==========================================
export const registerSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

export type RegisterValues = z.infer<typeof registerSchema>;

// ==========================================
// Şifre Sıfırlama Validasyonu
// ==========================================
export const resetPasswordSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
});

export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

// ==========================================
// Şifre Yenileme Validasyonu
// ==========================================
export const updatePasswordSchema = z.object({
  password: z.string().min(6, "Şifre en az 6 karakter olmalıdır"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

export type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;
