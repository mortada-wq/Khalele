import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          borderRadius: 40,
          background: "linear-gradient(135deg, #C68E17 0%, #a87212 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 100, color: "#fff", fontWeight: 700 }}>خ</span>
      </div>
    ),
    { width: 192, height: 192 }
  );
}
