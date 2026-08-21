"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Inbox,
  BookOpen,
  ClipboardCheck,
  Eye,
  Mail,
  TrendingUp,
} from "lucide-react";

interface Stats {
  totalMessages: number;
  unreadMessages: number;
  totalExercises: number;
  totalQuizResults: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    unreadMessages: 0,
    totalExercises: 0,
    totalQuizResults: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const [messagesRes, unreadRes, exercisesRes, quizRes] =
          await Promise.all([
            supabase
              .from("contact_messages")
              .select("id", { count: "exact", head: true }),
            supabase
              .from("contact_messages")
              .select("id", { count: "exact", head: true })
              .eq("is_read", false),
            supabase
              .from("exercises")
              .select("id", { count: "exact", head: true }),
            supabase
              .from("quiz_results")
              .select("id", { count: "exact", head: true }),
          ]);

        setStats({
          totalMessages: messagesRes.count || 0,
          unreadMessages: unreadRes.count || 0,
          totalExercises: exercisesRes.count || 0,
          totalQuizResults: quizRes.count || 0,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Toplam Mesaj",
      value: stats.totalMessages,
      icon: Inbox,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Okunmamış",
      value: stats.unreadMessages,
      icon: Mail,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      title: "Alıştırma",
      value: stats.totalExercises,
      icon: BookOpen,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      title: "Test Sonucu",
      value: stats.totalQuizResults,
      icon: ClipboardCheck,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Hoş geldiniz! İşte genel bir bakış.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <Card
            key={card.title}
            className="border-0 shadow-md shadow-black/5 hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl ${card.bgColor} flex items-center justify-center`}
                >
                  <card.icon className={`w-5 h-5 ${card.textColor}`} />
                </div>
                <TrendingUp className="w-4 h-4 text-muted-foreground/40" />
              </div>
              <div className="text-3xl font-bold">
                {loading ? "—" : card.value}
              </div>
              <p className="text-sm text-muted-foreground mt-1">{card.title}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick info */}
      <div className="mt-8 p-6 rounded-2xl bg-muted/50 border border-border/50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
            <Eye className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Hızlı Bilgi</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sol menüden gelen mesajlarınızı yönetebilir, yeni alıştırmalar
              yükleyebilir ve günün kelimesini güncelleyebilirsiniz. Okunmamış
              mesajlarınız varsa &quot;Mesajlar&quot; sayfasından kontrol edebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
