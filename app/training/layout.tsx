import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "التدريب الصوتي",
  description: "ساهم في تحسين خليلي بتسجيل صوتك. ساعدنا في بناء ذكاء اصطناعي عربي أفضل للجميع.",
};

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
