import Link from "next/link";
import {
  GraduationCap,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  ClipboardCheck,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background/80">
      <div className="container-main section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-primary text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold text-background leading-tight">
                  English Academy
                </span>
                <span className="text-[10px] font-medium text-background/50 leading-none">
                  Profesyonel Dil Eğitimi
                </span>
              </div>
            </Link>
            <p className="text-sm text-background/60 leading-relaxed mt-3">
              Profesyonel İngilizce eğitimi ile hedeflerinize ulaşın. 
              Kişiselleştirilmiş ders planları ve uzman rehberliği ile 
              İngilizce öğrenmek artık çok kolay.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-background mb-4 uppercase tracking-wider">
              Hızlı Linkler
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/"
                  className="text-sm text-background/60 hover:text-background transition-colors inline-flex items-center gap-2"
                >
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link
                  href="/alistirmalar"
                  className="text-sm text-background/60 hover:text-background transition-colors inline-flex items-center gap-2"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Alıştırmalar
                </Link>
              </li>
              <li>
                <Link
                  href="/seviye-testi"
                  className="text-sm text-background/60 hover:text-background transition-colors inline-flex items-center gap-2"
                >
                  <ClipboardCheck className="w-3.5 h-3.5" />
                  Ücretsiz Seviye Testi
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-semibold text-background mb-4 uppercase tracking-wider">
              Hizmetler
            </h3>
            <ul className="space-y-2.5">
              {["YDT Hazırlık", "YDS Hazırlık", "Genel İngilizce", "Speaking & Conversation"].map(
                (service) => (
                  <li key={service}>
                    <span className="text-sm text-background/60">{service}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-background mb-4 uppercase tracking-wider">
              İletişim
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 mt-0.5 text-primary" />
                <span className="text-sm text-background/60">
                  info@englishacademy.com
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 mt-0.5 text-primary" />
                <span className="text-sm text-background/60">
                  +90 (5XX) XXX XX XX
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                <span className="text-sm text-background/60">
                  Online & Yüz Yüze Eğitim
                </span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-background/10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-background/40">
          <p>© {new Date().getFullYear()} English Academy. Tüm hakları saklıdır.</p>
          <p>Profesyonel İngilizce Eğitimi</p>
        </div>
      </div>
    </footer>
  );
}
