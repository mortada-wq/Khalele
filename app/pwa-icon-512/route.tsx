import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          borderRadius: 100,
          background: "linear-gradient(135deg, #C68E17 0%, #a87212 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span style={{ fontSize: 260, color: "#fff", fontWeight: 700 }}>خ</span>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
