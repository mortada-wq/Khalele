import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "دفاتر",
  description: "دفتر خليل — اكتب ملاحظاتك، استخدم الكتابة الصوتية بالعربية، وصدر إلى المحادثة أو القضايا.",
};

export default function DefaterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
