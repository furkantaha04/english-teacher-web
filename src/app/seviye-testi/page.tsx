"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ClipboardCheck,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Trophy,
  Loader2,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import type { PlacementQuestion } from "@/types";

function estimateLevel(score: number, total: number): string {
  if (total === 0) return "A1";
  const percentage = (score / total) * 100;
  if (percentage >= 90) return "C2";
  if (percentage >= 75) return "C1";
  if (percentage >= 60) return "B2";
  if (percentage >= 45) return "B1";
  if (percentage >= 30) return "A2";
  return "A1";
}

type Step = "info" | "quiz" | "result";

export default function SeviyeTestiPage() {
  const [step, setStep] = useState<Step>("info");
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });
  
  // Questions State
  const [quizQuestions, setQuizQuestions] = useState<PlacementQuestion[]>([]);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Quiz State
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data, error } = await supabase
          .from("placement_questions")
          .select("*");

        if (error) throw error;

        // Check auth for user_id
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUserId(session.user.id);
        }
        
        const allQuestions = data || [];
        
        // Helper to shuffle arrays
        const shuffleArray = <T,>(array: T[]): T[] => {
          const newArr = [...array];
          for (let i = newArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
          }
          return newArr;
        };

        // Select up to 5 questions per level randomly
        const levels = ["A1", "A2", "B1", "B2", "C1", "C2"];
        let selectedQuestions: PlacementQuestion[] = [];
        
        for (const level of levels) {
          const questionsOfLevel = allQuestions.filter(q => q.level === level);
          const shuffledLevel = shuffleArray(questionsOfLevel);
          selectedQuestions = [...selectedQuestions, ...shuffledLevel.slice(0, 5)];
        }
        
        // Shuffle the final merged array so questions are mixed in difficulty
        selectedQuestions = shuffleArray(selectedQuestions);

        setQuizQuestions(selectedQuestions);
      } catch (error) {
        console.error("Failed to load questions:", error);
        toast.error("Sorular yüklenemedi. Lütfen sayfayı yenileyin.");
      } finally {
        setIsLoadingQuestions(false);
      }
    }
    fetchQuestions();
  }, []);

  const handleStartQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInfo.name || !contactInfo.email) {
      toast.error("Lütfen ad ve e-posta alanlarını doldurun.");
      return;
    }
    if (quizQuestions.length === 0) {
      toast.error("Sınav için soru bulunamadı. Lütfen daha sonra tekrar deneyin.");
      return;
    }
    setStep("quiz");
  };

  const handleSelectAnswer = (index: number) => {
    if (showAnswer) return;
    setSelectedAnswer(index);
    setShowAnswer(true);

    const isCorrect = index === quizQuestions[currentQuestion].correct_option;
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setAnswers((prev) => [...prev, index]);
  };

  const handleNextQuestion = async () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    } else {
      // Quiz finished - submit results
      setIsSubmitting(true);
      const finalScore = score;
      const level = estimateLevel(finalScore, quizQuestions.length);

      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        await supabase.from("quiz_results").insert({
          user_id: userId || null,
          name: contactInfo.name,
          email: contactInfo.email,
          phone: contactInfo.phone || null,
          score: finalScore,
          total_questions: quizQuestions.length,
          estimated_level: level,
        });
      } catch (error) {
        console.error("Failed to save quiz result:", error);
      }

      setIsSubmitting(false);
      setStep("result");
    }
  };

  const estimatedLevel = estimateLevel(score, quizQuestions.length);

  // Step 1: Contact Info
  if (step === "info") {
    return (
      <div className="section-padding">
        <div className="container-main max-w-lg">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3 px-3 py-1">
              <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" />
              Ücretsiz
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Seviye Tespit Testi
            </h1>
            <p className="text-muted-foreground mt-3">
              Kısa testimizle İngilizce seviyenizi öğrenin
            </p>
          </div>

          <Card className="border-0 shadow-lg shadow-primary/5">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleStartQuiz} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="quiz-name">Adınız *</Label>
                  <Input
                    id="quiz-name"
                    value={contactInfo.name}
                    onChange={(e) =>
                      setContactInfo((prev) => ({
                        ...prev,
                        name: e.target.value,
                      }))
                    }
                    placeholder="Adınız Soyadınız"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiz-email">E-posta *</Label>
                  <Input
                    id="quiz-email"
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) =>
                      setContactInfo((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="ornek@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quiz-phone">Telefon (Opsiyonel)</Label>
                  <Input
                    id="quiz-phone"
                    type="tel"
                    value={contactInfo.phone}
                    onChange={(e) =>
                      setContactInfo((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    placeholder="05XX XXX XX XX"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={isLoadingQuestions}
                  className="w-full gap-2 gradient-primary border-0 text-white hover:opacity-90"
                >
                  {isLoadingQuestions ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sorular Yükleniyor...
                    </>
                  ) : (
                    <>
                      Teste Başla
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 2: Quiz Questions
  if (step === "quiz") {
    const question = quizQuestions[currentQuestion];
    return (
      <div className="section-padding">
        <div className="container-main max-w-2xl">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">
                Soru {currentQuestion + 1} / {quizQuestions.length}
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full gradient-primary rounded-full transition-all duration-500"
                style={{
                  width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%`,
                }}
              />
            </div>
          </div>

          <Card className="border-0 shadow-lg shadow-primary/5">
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold mb-6">{question.question_text}</h2>

              <div className="space-y-3">
                {question.options.map((option, index) => {
                  let buttonClass =
                    "w-full text-left justify-start h-auto py-3 px-4 text-sm ";
                  if (showAnswer) {
                    if (index === question.correct_option) {
                      buttonClass +=
                        "border-green-500 bg-green-50 text-green-700 hover:bg-green-50";
                    } else if (
                      index === selectedAnswer &&
                      index !== question.correct_option
                    ) {
                      buttonClass +=
                        "border-red-500 bg-red-50 text-red-700 hover:bg-red-50";
                    }
                  } else if (selectedAnswer === index) {
                    buttonClass += "border-primary bg-primary/5";
                  }

                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className={buttonClass}
                      onClick={() => handleSelectAnswer(index)}
                      disabled={showAnswer}
                    >
                      <span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-semibold mr-3 shrink-0">
                        {String.fromCharCode(65 + index)}
                      </span>
                      {option}
                      {showAnswer && index === question.correct_option && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 ml-auto" />
                      )}
                      {showAnswer &&
                        index === selectedAnswer &&
                        index !== question.correct_option && (
                          <XCircle className="w-5 h-5 text-red-500 ml-auto" />
                        )}
                    </Button>
                  );
                })}
              </div>

              {showAnswer && (
                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleNextQuestion}
                    disabled={isSubmitting}
                    className="gap-2 gradient-primary border-0 text-white hover:opacity-90"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : currentQuestion < quizQuestions.length - 1 ? (
                      <>
                        Sonraki Soru
                        <ArrowRight className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Sonuçları Gör
                        <BarChart3 className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Step 3: Results
  const levelNames: Record<string, string> = {
    A1: "A1 Beginner",
    A2: "A2 Elementary",
    B1: "B1 Intermediate",
    B2: "B2 Upper Intermediate",
    C1: "C1 Advanced",
    C2: "C2 Proficient",
  };

  const handleDownloadCertificate = async () => {
    const el = document.getElementById("certificate-card");
    if (!el) return;
    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(el, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
      });
      const link = document.createElement("a");
      link.download = `English_with_Inayet_Sertifika_${contactInfo.name.replace(/\s+/g, "_")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Certificate download error:", error);
      toast.error("Sertifika indirilemedi.");
    }
  };

  const handleShareCertificate = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "English with İnayet - Seviye Testi Sertifikam",
          text: `${contactInfo.name} olarak English with İnayet Seviye Testini tamamladım! Seviyem: ${levelNames[estimatedLevel] || estimatedLevel}`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      const text = `${contactInfo.name} olarak English with İnayet Seviye Testini tamamladım! Seviyem: ${levelNames[estimatedLevel] || estimatedLevel}`;
      await navigator.clipboard.writeText(text);
      toast.success("Paylaşım metni kopyalandı!");
    }
  };

  const completedDate = new Date().toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="section-padding">
      <div className="container-main max-w-lg">
        <Card className="border-0 shadow-lg shadow-primary/5 text-center overflow-hidden">
          <div className="h-2 gradient-primary" />
          <CardContent className="p-8 sm:p-12">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-white" />
            </div>

            <h2 className="text-2xl font-bold mb-2">Test Tamamlandı!</h2>
            <p className="text-muted-foreground mb-6">
              {contactInfo.name}, işte sonuçlarınız:
            </p>

            <div className="bg-muted/50 rounded-2xl p-6 mb-6">
              <div className="text-4xl font-extrabold text-gradient mb-1">
                {score} / {quizQuestions.length}
              </div>
              <p className="text-sm text-muted-foreground">Doğru Cevap</p>
            </div>

            <div className="mb-8">
              <p className="text-sm text-muted-foreground mb-2">
                Tahmini Seviyeniz
              </p>
              <Badge className="text-lg px-4 py-2 gradient-primary border-0 text-white">
                {estimatedLevel}
              </Badge>
            </div>

            {/* Certificate Card */}
            <div
              id="certificate-card"
              className="relative rounded-2xl overflow-hidden mb-6 text-white"
              style={{
                background: "linear-gradient(135deg, oklch(0.55 0.2 260), oklch(0.40 0.22 280))",
                padding: "2rem",
              }}
            >
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 50%)",
                }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-semibold tracking-wide uppercase opacity-90">
                    Başarı Sertifikası
                  </span>
                </div>
                <div className="border-t border-white/20 pt-4 mb-4">
                  <p className="text-xs opacity-70 mb-1">Bu sertifika</p>
                  <p className="text-xl font-bold mb-1">{contactInfo.name}</p>
                  <p className="text-xs opacity-70">
                    adlı öğrencinin seviye tespit sınavını başarıyla tamamladığını belgeler.
                  </p>
                </div>
                <div className="bg-white/15 rounded-xl p-3 mb-4">
                  <p className="text-xs opacity-70 mb-1">Tespit Edilen Seviye</p>
                  <p className="text-lg font-bold">{levelNames[estimatedLevel] || estimatedLevel}</p>
                </div>
                <div className="flex items-center justify-between text-xs opacity-60">
                  <span>{completedDate}</span>
                  <span>English with İnayet</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  size="lg"
                  className="w-full gap-2 gradient-primary border-0 text-white hover:opacity-90"
                  onClick={handleDownloadCertificate}
                >
                  <ArrowRight className="w-4 h-4" />
                  İndir
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full gap-2"
                  onClick={handleShareCertificate}
                >
                  <BarChart3 className="w-4 h-4" />
                  Paylaş
                </Button>
              </div>
              <a
                href="#iletisim"
                className={buttonVariants({ size: "lg", className: "w-full gap-2 gradient-primary border-0 text-white hover:opacity-90" })}
              >
                Ücretsiz Ön Görüşme Al
                <ArrowRight className="w-4 h-4" />
              </a>
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={() => {
                  setStep("info");
                  setCurrentQuestion(0);
                  setAnswers([]);
                  setSelectedAnswer(null);
                  setShowAnswer(false);
                  setScore(0);
                }}
              >
                Testi Tekrarla
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

