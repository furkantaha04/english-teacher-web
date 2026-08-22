import HeroSection from "@/components/home/hero-section";
import DailyWordCard from "@/components/home/daily-word-card";
import BookingSection from "@/components/home/booking-section";
import DailyDiscussionSection from "@/components/home/daily-discussion";
import ServicesSection from "@/components/home/services-section";
import TestimonialsSection from "@/components/home/testimonials-section";
import ContactForm from "@/components/home/contact-form";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <DailyWordCard />
      <DailyDiscussionSection />
      <ServicesSection />
      <BookingSection />
      <TestimonialsSection />
      <ContactForm />
    </>
  );
}
