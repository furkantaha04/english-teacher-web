"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, LogIn, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginSchema } from "@/lib/validations";
import Link from "next/link";

export default function GirisPage() {
  const router = useRouter();
  
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    const validation = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
    if (!validation.success) {
      setLoginError(validation.error.issues[0].message);
      return;
    }

    setIsLoginLoading(true);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (authError) {
        setLoginError("E-posta veya şifre hatalı.");
        return;
      }

      // Check user role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .maybeSingle();

      const userRole = profile?.role ? String(profile.role).toLowerCase() : null;

      toast.success("Giriş başarılı!");
      
      // Redirect based on role
      if (userRole === "admin" || (!userRole && loginEmail.includes("admin"))) {
        router.push("/admin");
      } else {
        router.push("/");
      }
      
      router.refresh();
    } catch (err) {
      setLoginError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoginLoading(false);
    }
  };

  return (
    <div className="section-padding min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 animate-float">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Giriş Yap</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Platforma erişmek için bilgilerinizi girin
          </p>
        </div>

        <Card className="border-0 shadow-lg shadow-primary/5 mb-6">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {loginError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {loginError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="login-email">E-posta</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="login-password">Şifre</Label>
                  <Link 
                    href="/sifre-sifirla" 
                    className="text-xs text-primary hover:underline"
                  >
                    Şifremi Unuttum
                  </Link>
                </div>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isLoginLoading}
                className="w-full gap-2 gradient-primary border-0 text-white hover:opacity-90"
              >
                {isLoginLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Giriş Yap
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Hesabınız yok mu?{" "}
            <Link href="/kayit-ol" className="font-medium text-primary hover:underline">
              Kayıt Ol
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
