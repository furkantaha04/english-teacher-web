"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, UserPlus, Loader2, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
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

  const [criteria, setCriteria] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    setCriteria({
      length: registerPassword.length >= 8,
      uppercase: /[A-Z]/.test(registerPassword),
      number: /[0-9]/.test(registerPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(registerPassword)
    });
  }, [registerPassword]);

  const strength = Object.values(criteria).filter(Boolean).length;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    if (strength < 4) {
      setRegisterError("Lütfen tüm şifre kurallarını eksiksiz sağlayın.");
      return;
    }

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
                  placeholder="En az 8 karakter"
                  required
                />
                
                {registerPassword.length > 0 && (
                  <div className="space-y-3 mt-3 pt-2">
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                          strength < 3 ? "bg-red-500 w-1/3" : 
                          strength === 3 ? "bg-amber-500 w-2/3" : 
                          "bg-green-500 w-full"
                        }`}
                      />
                    </div>
                    
                    <p className={`text-xs font-medium ${
                      strength < 3 ? "text-red-500" : 
                      strength === 3 ? "text-amber-500" : 
                      "text-green-500"
                    }`}>
                      {strength < 3 ? "Şifre zayıf" : strength === 3 ? "Şifre orta seviyede" : "Şifre güçlü ve geçerli"}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      <div className="flex items-center gap-1.5">
                        {criteria.length ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <XCircle className="w-3.5 h-3.5 text-muted-foreground/50" />}
                        <span className={`text-xs ${criteria.length ? "text-foreground" : "text-muted-foreground"}`}>En az 8 karakter</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {criteria.uppercase ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <XCircle className="w-3.5 h-3.5 text-muted-foreground/50" />}
                        <span className={`text-xs ${criteria.uppercase ? "text-foreground" : "text-muted-foreground"}`}>En az 1 büyük harf</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {criteria.number ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <XCircle className="w-3.5 h-3.5 text-muted-foreground/50" />}
                        <span className={`text-xs ${criteria.number ? "text-foreground" : "text-muted-foreground"}`}>En az 1 rakam</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {criteria.special ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <XCircle className="w-3.5 h-3.5 text-muted-foreground/50" />}
                        <span className={`text-xs ${criteria.special ? "text-foreground" : "text-muted-foreground"}`}>En az 1 özel işaret</span>
                      </div>
                    </div>
                  </div>
                )}
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
                disabled={isRegisterLoading || (registerPassword.length > 0 && strength < 4)}
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
