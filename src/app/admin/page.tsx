"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Inbox,
  BookOpen,
  ClipboardCheck,
  Eye,
  Mail,
  TrendingUp,
  Users,
  HelpCircle,
} from "lucide-react";
import type { ContactMessage } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Stats {
  totalStudents: number;
  totalQuestions: number;
  unreadMessages: number;
  totalMessages: number;
  totalQuizResults: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalStudents: 0,
    totalQuestions: 0,
    unreadMessages: 0,
    totalMessages: 0,
    totalQuizResults: 0,
  });
  const [recentMessages, setRecentMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        const [
          profilesRes,
          questionsRes,
          messagesRes,
          unreadRes,
          quizRes,
          recentMessagesRes,
        ] = await Promise.all([
          supabase.from("profiles").select("id", { count: "exact", head: true }),
          supabase.from("placement_questions").select("id", { count: "exact", head: true }),
          supabase.from("contact_messages").select("id", { count: "exact", head: true }),
          supabase
            .from("contact_messages")
            .select("id", { count: "exact", head: true })
            .eq("is_read", false),
          supabase.from("quiz_results").select("id", { count: "exact", head: true }),
          supabase
            .from("contact_messages")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(5),
        ]);

        setStats({
          totalStudents: profilesRes.count || 0,
          totalQuestions: questionsRes.count || 0,
          totalMessages: messagesRes.count || 0,
          unreadMessages: unreadRes.count || 0,
          totalQuizResults: quizRes.count || 0,
        });

        if (recentMessagesRes.data) {
          setRecentMessages(recentMessagesRes.data);
        }
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
      title: "Kullanıcılar",
      value: stats.totalStudents,
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      title: "Soru Havuzu",
      value: stats.totalQuestions,
      icon: HelpCircle,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
    },
    {
      title: "Okunmamış Mesajlar",
      value: `${stats.unreadMessages} / ${stats.totalMessages}`,
      icon: Mail,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      title: "Çözülen Testler",
      value: stats.totalQuizResults,
      icon: ClipboardCheck,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
  ];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

      {/* Recent Messages & Quick info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <Card className="lg:col-span-2 border-0 shadow-md shadow-black/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Inbox className="w-5 h-5 text-primary" />
              Son Gelen Mesajlar
            </CardTitle>
            <Link href="/admin/mesajlar">
              <Button variant="ghost" size="sm" className="text-sm">
                Tümünü Gör
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Durum</TableHead>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>Tarih</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      Yükleniyor...
                    </TableCell>
                  </TableRow>
                ) : recentMessages.length > 0 ? (
                  recentMessages.map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell>
                        {!msg.is_read ? (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">Yeni</Badge>
                        ) : msg.is_replied ? (
                          <Badge className="bg-green-100 text-green-700 text-xs">Cevaplandı</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Okundu</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {msg.name} {msg.surname}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(msg.created_at)}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-6 text-muted-foreground">
                      Henüz mesaj yok.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="p-6 rounded-2xl bg-muted/50 border border-border/50 h-fit">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
              <Eye className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Hızlı Bilgi</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Sol menüden gelen mesajlarınızı yönetebilir, seviye testi sorularını güncelleyebilir ve yeni alıştırmalar yükleyebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
