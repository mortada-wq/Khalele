import { ImageResponse } from "next/og";

export const alt = "Kheleel - Arabic AI";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "linear-gradient(135deg, #0e0e0e 0%, #1a1a1a 50%, #0e0e0e 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Gold accent glow */}
        <div
          style={{
            position: "absolute",
            top: -100,
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(198,142,23,0.15) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Arabic letter mark */}
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: 24,
            background: "linear-gradient(135deg, #C68E17 0%, #a87212 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <span style={{ fontSize: 50, color: "#fff", fontWeight: 700 }}>K</span>
        </div>

        {/* Brand name (ASCII only to avoid Arabic shaping issues in @vercel/og) */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#C68E17",
              letterSpacing: "-1px",
            }}
          >
            KHELEEL
          </span>
        </div>

        {/* Tagline */}
        <span
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.7)",
            marginTop: 32,
          }}
        >
          Arabic AI for every dialect
        </span>

        {/* Dialect chips */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 24,
          }}
        >
          {["Iraqi", "Egyptian", "Gulf", "Levantine", "Maghrebi"].map((d) => (
            <span
              key={d}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                background: "rgba(198,142,23,0.12)",
                border: "1px solid rgba(198,142,23,0.25)",
                color: "#C68E17",
                fontSize: 16,
              }}
            >
              {d}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
