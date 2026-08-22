import DailyDiscussionSection from "@/components/home/daily-discussion";

export const metadata = {
  title: "Topluluk",
  description: "Günün sorusunu cevaplayarak İngilizce pratik yapın.",
};

export default function ToplulukPage() {
  return (
    <div className="min-h-[60vh]">
      <DailyDiscussionSection />
    </div>
  );
}
