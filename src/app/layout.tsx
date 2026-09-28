import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

/**
 * Client-supplied brand faces, self-hosted and subsetted to woff2 by next/font.
 * Both are exposed only as CSS custom properties so components never name a
 * family directly — swapping a face is a one-line change here.
 */
const cyGroteskWide = localFont({
  variable: "--font-cy-grotesk-wide",
  display: "swap",
  fallback: ["Arial Black", "Helvetica Neue", "sans-serif"],
  src: [
    { path: "../fonts/CYGroteskWide-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/CYGroteskWide-Bold.woff2", weight: "700", style: "normal" },
  ],
});

const agrandir = localFont({
  variable: "--font-agrandir",
  display: "swap",
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
  src: [
    { path: "../fonts/Agrandir-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/Agrandir-Bold.woff2", weight: "700", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "Rhubarb Collective — Creative Agency. Simplified.",
  description:
    "Rhubarb Collective is a forward-thinking, no-nonsense creative studio, built to turn enduring ideas into memorable experiences.",
};

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cyGroteskWide.variable} ${agrandir.variable}`}>
      <head>
        {/*
          Without JavaScript nothing can animate, so every element that the
          timeline would have revealed is shown in its resting state instead.
          The site stays fully readable with scripting disabled.
        */}
        <noscript>
          <style>{`
            [data-hero-state] [data-reveal] { opacity: 1 !important; }
            [data-hero="intro"] { display: none !important; }
            [data-fg-state] [data-fg-reveal] { opacity: 1 !important; }
            [data-branch], [data-fg-branch], [data-fg-connection],
            [data-fg-leader], [data-descender] { stroke-dashoffset: 0 !important; }
            [data-node], [data-halftone], [data-fg-node] { opacity: 1 !important; }
            [data-work-state] [data-work-frame] { clip-path: none !important; }
            [data-work-meta], [data-work-marker], [data-work-discipline] { opacity: 1 !important; }
            [data-work-branch] { stroke-dashoffset: 0 !important; }
            [data-work-node-mark] { opacity: 1 !important; }
            [data-branches-state] [data-branch-frame] { clip-path: none !important; }
            [data-branch-body], [data-branch-print], [data-branches-marker] { opacity: 1 !important; }
            [data-branch-path] { stroke-dashoffset: 0 !important; }
            [data-branch-node] { opacity: 1 !important; }
            [data-collective-state] [data-collective-frame] { clip-path: none !important; }
            [data-collective-meta], [data-collective-marker],
            [data-collective-lede] { opacity: 1 !important; }
            [data-collective-path], [data-collective-anchor] { stroke-dashoffset: 0 !important; }
            [data-collective-node] { opacity: 1 !important; }
            [data-proof-state] [data-proof-reveal] {
              clip-path: none !important; opacity: 1 !important;
            }
            [data-proof-meta], [data-proof-marker], [data-proof-lede] { opacity: 1 !important; }
            [data-proof-rule] { transform: none !important; }
            [data-proof-path], [data-proof-anchor] { stroke-dashoffset: 0 !important; }
            [data-proof-node], [data-proof-junction] { opacity: 1 !important; }
            [data-journal-state] [data-journal-reveal] {
              clip-path: none !important; opacity: 1 !important;
            }
            [data-journal-meta], [data-journal-marker], [data-journal-lede],
            [data-journal-strand] { opacity: 1 !important; }
            [data-journal-rule] { transform: none !important; }
            [data-journal-path], [data-journal-anchor] { stroke-dashoffset: 0 !important; }
            [data-journal-node], [data-journal-junction] { opacity: 1 !important; }
            [data-contact-state] [data-contact-reveal],
            [data-contact-state] [data-contact-line] {
              clip-path: none !important; opacity: 1 !important;
            }
            [data-contact-marker], [data-contact-invitation],
            [data-contact-meta], [data-contact-colophon] { opacity: 1 !important; }
            [data-contact-rule] { transform: none !important; }
            [data-contact-path], [data-contact-anchor] { stroke-dashoffset: 0 !important; }
            [data-contact-node], [data-contact-junction] { opacity: 1 !important; }
            [data-about-state] [data-about-reveal] {
              clip-path: none !important; opacity: 1 !important;
            }
            [data-about-state] [data-about-rule] { transform: none !important; }
            [data-cp-state] [data-cp-reveal] {
              clip-path: none !important; opacity: 1 !important;
            }
            [data-cp-state] [data-cp-rule] { transform: none !important; }
            [data-wk-state] [data-wk-intro],
            [data-wk-state] [data-wk-frame] {
              clip-path: none !important; opacity: 1 !important;
            }
            [data-wk-state] [data-wk-meta] { opacity: 1 !important; }
            [data-wk-state] [data-wk-rule] { transform: none !important; }
            [data-sv-state] [data-sv-reveal] {
              clip-path: none !important; opacity: 1 !important;
            }
            [data-sv-state] [data-sv-rule],
            [data-sv-state] [data-sv-spine] { transform: none !important; }
            [data-in-state] [data-in-reveal] {
              clip-path: none !important; opacity: 1 !important;
            }
            [data-in-state] [data-in-rule] { transform: none !important; }
            [data-cs-state] [data-cs-reveal],
            [data-cs-state] [data-cs-hero] {
              clip-path: none !important; opacity: 1 !important;
            }
            [data-cs-state] [data-cs-rule] { transform: none !important; }
            [data-ia-state] [data-ia-reveal],
            [data-ia-state] [data-ia-hero] {
              clip-path: none !important; opacity: 1 !important;
            }
            [data-ia-state] [data-ia-rule] { transform: none !important; }
          `}</style>
        </noscript>
      </head>
      <body>
        {children}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
