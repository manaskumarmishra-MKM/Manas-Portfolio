tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "canvas-void": "#090A0F",
        "surface-charcoal": "#12151E",
        "surface-container": "#1c1f29",
        "surface-container-high": "#272a33",
        "surface-glass-border": "rgba(255,255,255,0.08)",
        "glow-violet": "rgba(138,43,226,0.35)",
        "text-secondary": "#A0A5B5",
        "on-surface": "#e0e2ef",
        "primary": "#dbfcff",
        "primary-container": "#00f0ff",
        "on-primary-container": "#006970",
        "secondary": "#dcb8ff",
        "secondary-container": "#7701d0",
        "secondary-fixed": "#efdbff"
      },
      fontFamily: {
        "label-action": ["JetBrains Mono"],
        "code-tech": ["JetBrains Mono"],
        "code-meta": ["JetBrains Mono"],
        "headline-lg": ["Syne"],
        "headline-md": ["Syne"],
        "headline-sm": ["Syne"],
        "display-hero": ["Syne"],
        "display-hero-mobile": ["Syne"],
        "body-lg": ["Plus Jakarta Sans"],
        "body-md": ["Plus Jakarta Sans"],
        "body-sm": ["Plus Jakarta Sans"]
      },
      fontSize: {
        "label-action": ["12px", { lineHeight: "16px", letterSpacing: "0.06em", fontWeight: "600" }],
        "code-tech": ["13px", { lineHeight: "18px", letterSpacing: "0.04em", fontWeight: "500" }],
        "code-meta": ["11px", { lineHeight: "14px", letterSpacing: "0.08em", fontWeight: "400" }],
        "headline-lg": ["48px", { lineHeight: "52px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-md": ["28px", { lineHeight: "34px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-sm": ["20px", { lineHeight: "26px", fontWeight: "600" }],
        "display-hero": ["72px", { lineHeight: "76px", letterSpacing: "-0.04em", fontWeight: "800" }],
        "display-hero-mobile": ["40px", { lineHeight: "44px", letterSpacing: "-0.03em", fontWeight: "800" }],
        "body-lg": ["18px", { lineHeight: "28px", letterSpacing: "-0.01em", fontWeight: "400" }],
        "body-md": ["15px", { lineHeight: "24px", fontWeight: "400" }],
        "body-sm": ["13px", { lineHeight: "20px", letterSpacing: "0.01em", fontWeight: "400" }]
      }
    }
  }
};
