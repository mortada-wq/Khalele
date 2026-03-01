import Link from "next/link";

export function Footer() {
  return (
    <footer
      className="px-6 md:px-10 py-10 border-t"
      style={{ borderColor: "rgba(0,0,0,0.06)" }}
    >
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2">
          <div
            className="flex items-center justify-center rounded-lg"
            style={{
              width: 28,
              height: 28,
              background: "linear-gradient(135deg, #C68E17, #a87212)",
            }}
          >
            <span style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>خ</span>
          </div>
          <span className="font-ui text-sm" style={{ color: "#999" }}>
            Kheleel &copy; {new Date().getFullYear()}
          </span>
        </div>

        <nav className="flex items-center gap-6 font-ui text-sm" style={{ color: "#6b6b6b" }}>
          <Link href="/chat" className="hover:underline">
            ابدأ المحادثة
          </Link>
          <a href="mailto:hello@kheleel.com" className="hover:underline">
            تواصل
          </a>
        </nav>

        <p className="font-ui text-xs" style={{ color: "#bbb" }}>
          صنع بحب للعالم العربي
        </p>
      </div>
    </footer>
  );
}
