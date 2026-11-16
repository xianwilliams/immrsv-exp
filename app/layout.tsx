import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";
import "./globals.css";

const plexMono = localFont({
  src: [
    { path: "../public/fonts/IBMPlexMono-Light.ttf", weight: "300" },
    { path: "../public/fonts/IBMPlexMono-Regular.ttf", weight: "400" },
    { path: "../public/fonts/IBMPlexMono-Medium.ttf", weight: "500" },
    { path: "../public/fonts/IBMPlexMono-SemiBold.ttf", weight: "600" },
  ],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.SITE_URL || "https://www.immrsv-exp.com"),
  title: "IMMRSV | Experiences, brought to life.",
  description:
    "Independent experiential production for agencies, internal brand teams, and creative partners. From a short planning sprint to a full production team.",
  openGraph: {
    title: "IMMRSV | Experiences, brought to life.",
    description:
      "Your project. The right support. Independent experiential production, from one production lead to a full team.",
    type: "website",
    images: ["/media/starry.webp"],
  },
  robots: {
    index: process.env.SITE_INDEXABLE === "true",
    follow: process.env.SITE_INDEXABLE === "true",
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${plexMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{document.documentElement.dataset.theme=localStorage.getItem('immrsv-theme')==='dark'?'dark':'light'}catch{}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
