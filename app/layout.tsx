import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import localFont from "next/font/local";
import { getSiteContent } from "@/lib/cms/server";
import "./globals.css";
import "@/components/page-frame.css";

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

export async function generateMetadata(): Promise<Metadata> {
  const content = await getSiteContent();
  const hero = content.projects.find(
    (project) => project.id === content.home.heroProjects[0],
  );
  return {
    metadataBase: new URL(process.env.SITE_URL || "https://www.immrsv-exp.com"),
    title: content.settings.seoTitle,
    description: content.settings.seoDescription,
    openGraph: {
      title: content.settings.seoTitle,
      description: content.settings.seoDescription,
      type: "website",
      images: hero ? [hero.cover.src] : [],
    },
    robots: {
      index: process.env.SITE_INDEXABLE === "true",
      follow: process.env.SITE_INDEXABLE === "true",
    },
  };
}
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
      <body>
        <div className="page-frame">{children}</div>
      </body>
    </html>
  );
}
