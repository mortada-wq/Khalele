import type { Metadata } from "next";
import { GreetingModal } from "@/components/GreetingModal";

export const metadata: Metadata = {
  title: "المحادثة",
  description: "تحدث مع خليل — مساعد ذكاء اصطناعي يفهم كل اللهجات العربية. محادثة نصية وصوتية مجانية.",
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <GreetingModal />
    </>
  );
}
