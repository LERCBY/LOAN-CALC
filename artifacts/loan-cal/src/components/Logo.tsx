interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  className?: string;
}

export function Logo({ size = "md", variant = "full", className = "" }: LogoProps) {
  const gradId = `lavGrad_${variant}_${size}`;

  if (variant === "icon") {
    const dim = size === "sm" ? 32 : size === "md" ? 44 : 60;
    return (
      <svg
        width={dim} height={dim}
        viewBox="0 0 512 512" fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="LOAN CALC. icon"
      >
        <rect width="512" height="512" rx="112" fill={`url(#${gradId})`} />
        <rect x="1" y="1" width="510" height="510" rx="111"
          fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="2" />
        <text x="50%" y="338" textAnchor="middle"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif"
          fontSize="228" fontWeight="700" letterSpacing="-12" fill="white">
          LC
        </text>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="512" y2="512" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C2A8E0" />
            <stop offset="45%" stopColor="#967BB6" />
            <stop offset="100%" stopColor="#4A2080" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  const height = size === "sm" ? 22 : size === "md" ? 28 : 38;
  return (
    <svg
      height={height} viewBox="0 0 300 54" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="LOAN CALC."
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="300" y2="54" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" />
        </linearGradient>
      </defs>
      <text x="2" y="40"
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
        fontSize="38" fontWeight="700" letterSpacing="-2" fill="currentColor">
        LOAN
      </text>
      <text x="118" y="40"
        fontFamily="-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
        fontSize="38" fontWeight="300" letterSpacing="-2" fill="currentColor">
        {" CALC"}
      </text>
      <circle cx="292" cy="36" r="5" fill="#C8961E" />
    </svg>
  );
}
