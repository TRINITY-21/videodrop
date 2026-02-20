import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "VideoDrop — Free Browser-Based Video Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#232326",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Gradient orb */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            width: "600px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(59,130,246,0.15) 0%, rgba(6,182,212,0.08) 40%, transparent 70%)",
          }}
        />

        {/* Logo droplet */}
        <svg
          width="80"
          height="80"
          viewBox="0 0 32 32"
          fill="none"
          style={{ marginBottom: "24px" }}
        >
          <defs>
            <linearGradient
              id="og-grad"
              x1="0"
              y1="0"
              x2="32"
              y2="32"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#0891b2" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
          </defs>
          <path
            d="M16 1.5C12.5 7 4 14.5 4 21C4 27.075 9.373 31 16 31C22.627 31 28 27.075 28 21C28 14.5 19.5 7 16 1.5Z"
            fill="url(#og-grad)"
          />
          <path
            d="M13.5 16L13.5 26L22.5 21L13.5 16Z"
            fill="white"
            fillOpacity="0.95"
          />
        </svg>

        {/* Title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            fontSize: "48px",
            fontWeight: 700,
            letterSpacing: "-1px",
          }}
        >
          <span style={{ color: "#ffffff" }}>Video</span>
          <span
            style={{
              background: "linear-gradient(135deg, #3b82f6, #06b6d4, #14b8a6)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            Drop
          </span>
        </div>

        {/* Subtitle */}
        <p
          style={{
            color: "#71717a",
            fontSize: "22px",
            marginTop: "12px",
            textAlign: "center",
            maxWidth: "600px",
          }}
        >
          Free browser-based video tools. Compress, convert, trim &amp; more.
          No uploads, no servers.
        </p>

        {/* Tool pills */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginTop: "32px",
          }}
        >
          {["Compress", "Convert", "Trim", "GIF", "Resize", "Merge"].map(
            (tool) => (
              <div
                key={tool}
                style={{
                  padding: "8px 16px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "#2a2a2e",
                  color: "#a1a1aa",
                  fontSize: "14px",
                  fontWeight: 500,
                }}
              >
                {tool}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
