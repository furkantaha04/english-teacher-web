"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Quote, ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    name: "Ayşe K.",
    level: "B2 → C1",
    comment:
      "6 ayda B2'den C1 seviyesine geçtim. Ders planları tamamen bana özeldi ve öğretmenimin motivasyonu inanılmazdı. YDS'den 90 puan aldım!",
    rating: 5,
  },
  {
    name: "Mehmet Y.",
    level: "A2 → B1",
    comment:
      "İngilizce konuşmaktan korkardım. Speaking derslerinden sonra artık iş toplantılarımı İngilizce yapabiliyorum. Çok teşekkür ederim!",
    rating: 5,
  },
  {
    name: "Elif S.",
    level: "B1 → B2",
    comment:
      "YDT sınavına hazırlanırken aldığım birebir dersler sayesinde hedeflediğim puanı kolayca aştım. Alıştırmalar ve kaynaklar çok faydalıydı.",
    rating: 5,
  },
  {
    name: "Can D.",
    level: "A1 → A2",
    comment:
      "Sıfırdan başladım ve 4 ayda günlük İngilizce konuşabilecek seviyeye geldim. Derslerin interaktif ve eğlenceli olması motivasyonumu hiç düşürmedi.",
    rating: 5,
  },
  {
    name: "Zeynep T.",
    level: "B2 → C1",
    comment:
      "Akademik İngilizce için başvurduğum en iyi karar oldu. Yurtdışı yüksek lisans başvurumda IELTS puanım 7.5 geldi!",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === testimonials.length - 1 ? 0 : prev + 1
    );
  };

  // Show 3 testimonials on desktop, 1 on mobile
  const getVisibleTestimonials = () => {
    const visible = [];
    for (let i = 0; i < 3; i++) {
      visible.push(testimonials[(currentIndex + i) % testimonials.length]);
    }
    return visible;
  };

  return (
    <section className="section-padding bg-muted/30">
      <div className="container-main">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-3 px-3 py-1">
            Öğrenci Yorumları
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Öğrencilerimiz Ne Diyor?
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Başarı hikayeleri ve öğrenci deneyimleri
          </p>
        </div>

        <div className="relative">
          {/* Testimonial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getVisibleTestimonials().map((testimonial, index) => (
              <Card
                key={`${testimonial.name}-${index}`}
                className="border-0 shadow-md shadow-black/5 hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-6">
                  <Quote className="w-8 h-8 text-primary/20 mb-4" />
                  <p className="text-sm text-foreground leading-relaxed mb-4">
                    &quot;{testimonial.comment}&quot;
                  </p>
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-sm">
                        {testimonial.name}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {testimonial.level}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPrev}
              className="rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="flex gap-1.5">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? "bg-primary w-6"
                      : "bg-primary/20 hover:bg-primary/40"
                  }`}
                />
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNext}
              className="rounded-full"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
