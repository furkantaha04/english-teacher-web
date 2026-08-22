import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import LayoutShell from "@/components/layout/layout-shell";

export const metadata: Metadata = {
  title: {
    default: "English with İnayet | İngilizce Öğrenmenin Kolay Yolu",
    template: "%s | English with İnayet",
  },
  description:
    "Uzman öğretmen rehberliğinde kişiselleştirilmiş İngilizce eğitimi. YDT, YDS hazırlık, genel İngilizce ve konuşma dersleri.",
  keywords: [
    "İngilizce dersi",
    "İngilizce öğretmeni",
    "YDT hazırlık",
    "YDS hazırlık",
    "online İngilizce",
    "speaking",
    "İngilizce kursu",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">
        <LayoutShell>{children}</LayoutShell>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
