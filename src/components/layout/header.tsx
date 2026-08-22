"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  GraduationCap,
  Menu,
  ClipboardCheck,
  Home,
  LogOut,
  LayoutDashboard,
  User,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

const navLinks = [
  { href: "/", label: "Ana Sayfa", icon: Home },
  { href: "/alistirmalar", label: "Alıştırmalar", icon: BookOpen },
  { href: "/seviye-testi", label: "Seviye Testi", icon: ClipboardCheck },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/topluluk", label: "Topluluk", icon: MessageCircle },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      const { data: { session } } = await supabase.auth.getSession();
      const currentUser = session?.user;
      
      if (currentUser) {
        // Fetch role to know if we should show Admin Panel link
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", currentUser.id)
          .maybeSingle();
          
        setUser({
          ...currentUser,
          role: profile?.role || (currentUser.email?.includes("admin") ? "admin" : "student"),
          full_name: profile?.full_name || currentUser.user_metadata?.full_name || null,
        });
      } else {
        setUser(null);
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        const currentUser = session?.user;
        if (currentUser) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role, full_name")
            .eq("id", currentUser.id)
            .maybeSingle();
            
          setUser({
            ...currentUser,
            role: profile?.role || (currentUser.email?.includes("admin") ? "admin" : "student"),
            full_name: profile?.full_name || currentUser.user_metadata?.full_name || null,
          });
        } else {
          setUser(null);
        }
      });

      return () => subscription.unsubscribe();
    };
    
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push("/");
    router.refresh();
  };

  const userInitial = user
    ? (user.full_name || user.email || "U").charAt(0).toUpperCase()
    : "";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container-main flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-primary text-white transition-transform duration-300 group-hover:scale-110">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-tight tracking-tight text-foreground">
              English with İnayet
            </span>
            <span className="text-[10px] font-medium text-muted-foreground leading-none">
              Profesyonel Dil Eğitimi
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              <Button
                variant="ghost"
                className="gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Button>
            </Link>
          ))}
          <div className="ml-3 pl-3 border-l border-border flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex items-center gap-2 pl-2 pr-3 h-9 rounded-md border border-input bg-background text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground cursor-pointer outline-none"
                >
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
                    {userInitial}
                  </div>
                  <span className="max-w-[120px] truncate text-sm">
                    {user.full_name || user.email?.split("@")[0] || "Hesap"}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">
                      {user.full_name || "Kullanıcı"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="gap-2 cursor-pointer"
                    onClick={() => router.push("/profil")}
                  >
                    <User className="w-4 h-4" />
                    Profilim
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer"
                      onClick={() => router.push("/admin")}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    variant="destructive"
                    className="gap-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/giris">
                  <Button variant="outline" size="sm" className="gap-2">
                    Giriş Yap
                  </Button>
                </Link>
                <Link href="/kayit-ol">
                  <Button size="sm" className="gap-2 gradient-primary text-white border-0">
                    Kayıt Ol
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>

        {/* Mobile Nav */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "md:hidden" })}>
            <Menu className="w-5 h-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <div className="flex flex-col gap-6 mt-8">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl gradient-primary text-white">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <span className="text-base font-bold">English with İnayet</span>
              </div>

              {/* User info for mobile */}
              {user && (
                <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-muted/50 border border-border/50">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {user.full_name || "Kullanıcı"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}
              
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}
              
              <div className="pt-4 border-t border-border flex flex-col gap-2">
                {user ? (
                  <>
                    <Link href="/profil" onClick={() => setIsOpen(false)}>
                      <Button 
                        variant="outline" 
                        className="w-full gap-2 justify-start"
                      >
                        <User className="w-4 h-4" />
                        Profilim
                      </Button>
                    </Link>
                    {user.role === "admin" && (
                      <Link href="/admin" onClick={() => setIsOpen(false)}>
                        <Button 
                          variant="outline" 
                          className="w-full gap-2 text-primary hover:text-primary hover:bg-primary/10 border-primary/20 justify-start"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Admin Panel
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="outline" 
                      className="w-full gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 justify-start"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4" />
                      Çıkış Yap
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/giris" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full justify-start gap-2">
                        Giriş Yap
                      </Button>
                    </Link>
                    <Link href="/kayit-ol" onClick={() => setIsOpen(false)}>
                      <Button className="w-full justify-start gap-2 gradient-primary text-white border-0">
                        Kayıt Ol
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
