import { ImageResponse } from "next/og";
import { LOGO_WELL_DATA_URI } from "@/lib/utils/brand";

export const runtime = "edge";
export const alt = "WELLTools — Motion Graphics & Video Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#0B0C0F",
          backgroundImage:
            "radial-gradient(1200px 700px at 10% -10%, rgba(91,140,255,0.28), transparent 60%), radial-gradient(900px 600px at 100% 10%, rgba(143,179,255,0.16), transparent 55%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_WELL_DATA_URI} alt="" width={360} height={110} style={{ objectFit: "contain" }} />
        <div
          style={{
            marginTop: 36,
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#F4F5F7",
            display: "flex",
          }}
        >
          Motion graphics & video tools,
        </div>
        <div
          style={{
            fontSize: 56,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#F4F5F7",
            display: "flex",
          }}
        >
          right in your browser.
        </div>
        <div style={{ marginTop: 28, fontSize: 28, color: "#9AA0AC", display: "flex" }}>
          Free · No login · No server-side processing
        </div>
      </div>
    ),
    { ...size }
  );
}
