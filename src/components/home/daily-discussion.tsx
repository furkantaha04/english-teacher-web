"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageCircle,
  Send,
  Loader2,
  LogIn,
  User,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import type { DailyDiscussion, DiscussionReply } from "@/types";
import Link from "next/link";

const BAD_WORDS = [
  "amk", "aq", "siktir", "orospu", "piç", "yarrak",
  "fuck", "shit", "bitch", "asshole", "cunt", "pussy",
  "amına", "amina", "amcik", "amcık", "ibne", "kaltak"
];

const containsBadWords = (text: string) => {
  const lowerText = text.toLowerCase();
  return BAD_WORDS.some(word => lowerText.includes(word));
};

export default function DailyDiscussionSection() {
  const [discussion, setDiscussion] = useState<DailyDiscussion | null>(null);
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();

        // Check auth
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", session.user.id)
            .maybeSingle();
          setUser({
            id: session.user.id,
            name: profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Kullanıcı",
          });
        }

        // Fetch active discussion
        const { data: disc, error: discError } = await supabase
          .from("daily_discussions")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (discError) throw discError;

        if (disc) {
          setDiscussion(disc);
          // Fetch replies
          const { data: repliesData } = await supabase
            .from("discussion_replies")
            .select("*")
            .eq("discussion_id", disc.id)
            .order("created_at", { ascending: true });

          setReplies(repliesData || []);
        }
      } catch (error) {
        console.error("Failed to load discussion:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleSubmitReply = async () => {
    if (!replyText.trim()) {
      toast.error("Lütfen bir cevap yazın.");
      return;
    }
    if (containsBadWords(replyText)) {
      toast.error("Yorumunuz topluluk kurallarına uygun olmayan ifadeler içeriyor. Lütfen saygılı bir dil kullanın.");
      return;
    }
    if (!user || !discussion) return;

    setIsSubmitting(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data, error } = await supabase
        .from("discussion_replies")
        .insert({
          discussion_id: discussion.id,
          user_id: user.id,
          user_name: user.name,
          reply_text: replyText.trim(),
        })
        .select()
        .single();

      if (error) throw error;

      setReplies((prev) => [...prev, data]);
      setReplyText("");
      toast.success("Cevabınız paylaşıldı! 🎉");
    } catch (error) {
      console.error("Reply error:", error);
      toast.error("Cevap gönderilemedi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="section-padding">
        <div className="container-main max-w-3xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (!discussion) return null;

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}dk önce`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}sa önce`;
    const days = Math.floor(hours / 24);
    return `${days}g önce`;
  };

  return (
    <section className="section-padding">
      <div className="container-main max-w-3xl">
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-3 px-3 py-1">
            <MessageCircle className="w-3.5 h-3.5 mr-1.5" />
            Daily Practice
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Günün Sorusu
          </h2>
          <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
            Her gün yeni bir soru ile İngilizceni pratik et
          </p>
        </div>

        {/* Question Card */}
        <Card className="border-0 shadow-lg shadow-primary/5 mb-6 overflow-hidden">
          <div className="h-1.5 gradient-primary" />
          <CardContent className="p-6 sm:p-8">
            <h3 className="text-lg font-semibold mb-2">{discussion.title}</h3>
            <p className="text-foreground leading-relaxed text-base bg-muted/50 rounded-xl p-4">
              {discussion.question}
            </p>
          </CardContent>
        </Card>

        {/* Reply Input */}
        {user ? (
          replies.some(r => r.user_id === user.id) ? (
            <Card className="border-0 shadow-md shadow-black/5 mb-6 border-dashed bg-green-50/50">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-green-800 mb-1">
                  Harika İş Çıkardınız!
                </h3>
                <p className="text-sm text-green-700/80">
                  Bu günün sorusuna zaten yanıt verdiniz. Katılımınız için teşekkürler.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-md shadow-black/5 mb-6">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold shrink-0 mt-1">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your answer in English..."
                      rows={3}
                      className="resize-none"
                    />
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        disabled={isSubmitting || !replyText.trim()}
                        onClick={handleSubmitReply}
                        className="gap-2 gradient-primary border-0 text-white hover:opacity-90"
                      >
                        {isSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Gönder
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        ) : (
          <Card className="border-0 shadow-md shadow-black/5 mb-6 border-dashed">
            <CardContent className="p-5 text-center">
              <p className="text-muted-foreground text-sm mb-3">
                Cevap yazmak için giriş yapın
              </p>
              <Link href="/giris">
                <Button variant="outline" size="sm" className="gap-2">
                  <LogIn className="w-4 h-4" />
                  Giriş Yap
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Replies */}
        {replies.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">
              {replies.length} Cevap
            </p>
            {replies.map((reply) => (
              <Card key={reply.id} className="border-0 shadow-sm shadow-black/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                      {reply.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">{reply.user_name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {timeAgo(reply.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed">
                        {reply.reply_text}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
