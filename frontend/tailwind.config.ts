import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      backgroundImage: {
        'quantum-gradient': 'linear-gradient(135deg, #0a0a0f 0%, #1a0d2e 25%, #2d1b4e 50%, #1a0d2e 75%, #0a0a0f 100%)',
        'quantum-space': 'radial-gradient(ellipse at center, #2d1b4e 0%, #1a0d2e 40%, #0a0a0f 100%)',
        'holographic': 'linear-gradient(45deg, #8b5cf6, #a855f7, #c084fc, #e879f9, #f0abfc)',
        'quantum-glow': 'linear-gradient(135deg, rgba(139, 92, 246, 0.3) 0%, rgba(168, 85, 247, 0.2) 50%, rgba(192, 132, 252, 0.1) 100%)',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        quantum: {
          primary: "#4c1d95",
          secondary: "#6b21a8",
          accent: "#8b5cf6",
          light: "#a855f7",
          lighter: "#c084fc",
          glow: "#e879f9",
          electric: "#3b82f6",
        },
        space: {
          black: "#0a0a0f",
          dark: "#1a0d2e",
          medium: "#2d1b4e",
          light: "#4c1d95",
        },
        brand: {
          blue: "#3b82f6",
          orange: "#f97316",
          teal: "#06b6d4",
          cyan: "#0891b2",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "quantum-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(139, 92, 246, 0.5), 0 0 40px rgba(168, 85, 247, 0.3), 0 0 60px rgba(192, 132, 252, 0.1)"
          },
          "50%": {
            boxShadow: "0 0 30px rgba(139, 92, 246, 0.8), 0 0 60px rgba(168, 85, 247, 0.5), 0 0 90px rgba(192, 132, 252, 0.3)"
          },
        },
        "holographic-shift": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "quantum-pulse": "quantum-pulse 3s ease-in-out infinite",
        "holographic-shift": "holographic-shift 4s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
