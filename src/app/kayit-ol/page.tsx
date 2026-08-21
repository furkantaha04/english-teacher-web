"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, UserPlus, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { registerSchema } from "@/lib/validations";
import Link from "next/link";

export default function KayitOlPage() {
  const router = useRouter();

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    const validation = registerSchema.safeParse({ 
      email: registerEmail, 
      password: registerPassword,
      confirmPassword: registerConfirmPassword
    });
    
    if (!validation.success) {
      setRegisterError(validation.error.issues[0].message);
      return;
    }

    setIsRegisterLoading(true);

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
      });

      if (signUpError) {
        setRegisterError(signUpError.message || "Kayıt olurken bir hata oluştu.");
        return;
      }

      toast.success("Kayıt başarılı! Giriş yapabilirsiniz.");
      
      // If auto logged in
      if (data.session) {
        router.push("/");
        router.refresh();
      } else {
        router.push("/giris");
      }
      
    } catch (err) {
      setRegisterError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsRegisterLoading(false);
    }
  };

  return (
    <div className="section-padding min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-4 animate-float">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Kayıt Ol</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Hemen kayıt olup platforma katılın
          </p>
        </div>

        <Card className="border-0 shadow-lg shadow-primary/5 mb-6">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleRegister} className="space-y-5">
              {registerError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {registerError}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="register-email">E-posta</Label>
                <Input
                  id="register-email"
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Şifre</Label>
                <Input
                  id="register-password"
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="register-confirm-password">Şifre Tekrar</Label>
                <Input
                  id="register-confirm-password"
                  type="password"
                  value={registerConfirmPassword}
                  onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                  placeholder="Şifrenizi tekrar girin"
                  required
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isRegisterLoading}
                className="w-full gap-2 gradient-warm border-0 text-white hover:opacity-90"
              >
                {isRegisterLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Kayıt olunuyor...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Kayıt Ol
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Zaten hesabınız var mı?{" "}
            <Link href="/giris" className="font-medium text-primary hover:underline">
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
