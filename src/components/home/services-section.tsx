import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  GraduationCap,
  BookOpen,
  MessageCircle,
  Globe,
  CheckCircle2,
} from "lucide-react";

const services = [
  {
    title: "YDT Hazırlık",
    description:
      "Yükseköğretim Kurumları Sınavı (YDT) için kapsamlı İngilizce hazırlık programı.",
    icon: GraduationCap,
    color: "from-blue-500 to-blue-600",
    features: [
      "Sınav stratejileri",
      "Gramer & kelime çalışmaları",
      "Deneme sınavları",
      "Birebir takip",
    ],
  },
  {
    title: "YDS Hazırlık",
    description:
      "Yabancı Dil Bilgisi Seviye Tespit Sınavı için özelleştirilmiş hazırlık.",
    icon: BookOpen,
    color: "from-purple-500 to-purple-600",
    features: [
      "Akademik İngilizce",
      "Reading & Vocabulary",
      "Grammar deep-dive",
      "Haftalık mini sınavlar",
    ],
  },
  {
    title: "Genel İngilizce",
    description:
      "A1'den C1'e kadar her seviyeye uygun genel İngilizce eğitim programı.",
    icon: Globe,
    color: "from-emerald-500 to-emerald-600",
    features: [
      "4 temel beceri",
      "Seviyeye uygun müfredat",
      "Günlük yaşam İngilizcesi",
      "İlerleme takibi",
    ],
  },
  {
    title: "Speaking & Conversation",
    description:
      "Konuşma pratiği ve akıcılık geliştirme odaklı interaktif dersler.",
    icon: MessageCircle,
    color: "from-amber-500 to-amber-600",
    features: [
      "Konuşma pratiği",
      "Telaffuz düzeltme",
      "Güncel konular",
      "Role-play aktiviteleri",
    ],
  },
];

export default function ServicesSection() {
  return (
    <section className="section-padding">
      <div className="container-main">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-3 px-3 py-1">
            Hizmetlerimiz
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ders Paketleri & Hizmetler
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            İhtiyacınıza ve hedefinize göre özelleştirilmiş İngilizce eğitim
            programları
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <Card
              key={service.title}
              className="group border-0 shadow-md shadow-black/5 hover:shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-1 overflow-hidden"
            >
              <div className={`h-1.5 bg-gradient-to-r ${service.color}`} />
              <CardHeader className="pb-3">
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110`}
                >
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-lg">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
