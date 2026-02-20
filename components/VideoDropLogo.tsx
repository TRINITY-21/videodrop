export default function VideoDropLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  const gradId = `vd-grad-${size}`;
  const shineId = `vd-shine-${size}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="50%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <radialGradient id={shineId} cx="0.35" cy="0.25" r="0.6">
          <stop offset="0%" stopColor="white" stopOpacity="0.35" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Droplet shape */}
      <path
        d="M16 1.5C12.5 7 4 14.5 4 21C4 27.075 9.373 31 16 31C22.627 31 28 27.075 28 21C28 14.5 19.5 7 16 1.5Z"
        fill={`url(#${gradId})`}
      />

      {/* Gloss / shine overlay */}
      <path
        d="M16 1.5C12.5 7 4 14.5 4 21C4 27.075 9.373 31 16 31C22.627 31 28 27.075 28 21C28 14.5 19.5 7 16 1.5Z"
        fill={`url(#${shineId})`}
      />

      {/* Play triangle */}
      <path
        d="M13.5 16L13.5 26L22.5 21L13.5 16Z"
        fill="white"
        fillOpacity="0.95"
      />
    </svg>
  );
}
