import Link from "next/link";

export function Navbar() {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 py-4"
      style={{ backdropFilter: "blur(12px)", background: "rgba(235,235,236,0.85)" }}
    >
      <Link href="/" className="flex items-center gap-2">
        <div
          className="flex items-center justify-center rounded-lg"
          style={{
            width: 36,
            height: 36,
            background: "linear-gradient(135deg, #C68E17, #a87212)",
          }}
        >
          <span style={{ fontSize: 20, color: "#fff", fontWeight: 700 }}>خ</span>
        </div>
        <span className="font-title text-lg font-bold" style={{ color: "#231f20" }}>
          خليلي
        </span>
      </Link>

      <Link
        href="/chat"
        className="px-5 py-2 rounded-full font-ui text-sm font-medium transition-all hover:shadow-md active:scale-[0.97]"
        style={{
          background: "var(--color-accent)",
          color: "#fff",
        }}
      >
        ابدأ الآن
      </Link>
    </nav>
  );
}
