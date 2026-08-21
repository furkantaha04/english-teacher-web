"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden gradient-hero">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/20 blur-3xl" />
      </div>

      <div className="relative container-main section-padding">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 py-8 lg:py-16">
          {/* Text Content */}
          <div className="flex-1 text-center lg:text-left space-y-6 animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              Profesyonel İngilizce Eğitimi
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
              İngilizceyi{" "}
              <span className="text-gradient">Doğru Öğrenin,</span>
              <br />
              Güvenle Konuşun
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Deneyimli öğretmen rehberliğinde kişiselleştirilmiş ders planları,
              interaktif alıştırmalar ve gerçek yaşam pratikleriyle İngilizce
              öğrenme yolculuğunuza başlayın.
            </p>

            {/* Credentials */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-3">
              <Badge
                variant="secondary"
                className="px-3 py-1.5 text-sm gap-1.5"
              >
                <Award className="w-3.5 h-3.5" />
                CELTA Sertifikalı
              </Badge>
              <Badge
                variant="secondary"
                className="px-3 py-1.5 text-sm gap-1.5"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                İngiliz Dili ve Edebiyatı
              </Badge>
              <Badge
                variant="secondary"
                className="px-3 py-1.5 text-sm gap-1.5"
              >
                <Star className="w-3.5 h-3.5" />
                10+ Yıl Deneyim
              </Badge>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Link href="#iletisim">
                <Button size="lg" className="gap-2 px-6 text-base gradient-primary border-0 text-white hover:opacity-90 transition-opacity">
                  Ücretsiz Ön Görüşme
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/seviye-testi">
                <Button
                  variant="outline"
                  size="lg"
                  className="gap-2 px-6 text-base"
                >
                  <BookOpen className="w-4 h-4" />
                  Seviyeni Test Et
                </Button>
              </Link>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="flex-1 flex justify-center animate-slide-up delay-200">
            <div className="relative">
              {/* Main card */}
              <div className="w-80 h-96 lg:w-96 lg:h-[440px] rounded-3xl gradient-primary shadow-2xl shadow-primary/20 flex items-end justify-center overflow-hidden">
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8 text-center">
                  <GraduationCap className="w-20 h-20 mb-6 opacity-90" />
                  <h2 className="text-2xl font-bold mb-2">English Academy</h2>
                  <p className="text-white/80 text-sm">
                    Hedeflerinize ulaşmanız için yanınızdayız
                  </p>
                </div>
              </div>

              {/* Floating cards */}
              <div className="absolute -top-4 -right-4 lg:-right-8 bg-white rounded-2xl shadow-lg shadow-black/5 p-4 animate-float">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gradient-warm flex items-center justify-center">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">500+</p>
                    <p className="text-xs text-muted-foreground">
                      Mutlu Öğrenci
                    </p>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 lg:-left-8 bg-white rounded-2xl shadow-lg shadow-black/5 p-4 animate-float delay-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">%95</p>
                    <p className="text-xs text-muted-foreground">
                      Başarı Oranı
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
