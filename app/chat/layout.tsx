import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "المحادثة",
  description: "تحدث مع خليلي — مساعد ذكاء اصطناعي يفهم كل اللهجات العربية. محادثة نصية وصوتية مجانية.",
};

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return children;
}
