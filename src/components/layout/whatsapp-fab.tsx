"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppFab() {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "905XXXXXXXXX";
  const message = encodeURIComponent(
    "Merhaba, İngilizce dersleri hakkında bilgi almak istiyorum. Uygun ders saatleri ve fiyatlar hakkında bilgi alabilir miyim?"
  );
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp ile iletişime geçin"
      className="fixed bottom-6 right-6 z-50 group"
    >
      {/* Pulse ring */}
      <span className="absolute inset-0 rounded-full bg-green-500/30 animate-ping" />
      <span className="absolute inset-0 rounded-full bg-green-500/20 animate-pulse-soft" />
      
      {/* Button */}
      <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-green-500/40">
        <MessageCircle className="w-6 h-6" />
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-3 px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-medium whitespace-nowrap opacity-0 translate-y-2 pointer-events-none transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
        WhatsApp ile yazın
        <span className="absolute top-full right-5 border-4 border-transparent border-t-foreground" />
      </div>
    </a>
  );
}
