import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://movingbeaumontforward.com"),
  title: "Moving Beaumont Forward",
  description: "Beaumont information straight from the source—focused on the work, the progress, and the community we call home.",
  openGraph: {
    title: "Moving Beaumont Forward",
    description: "Beaumont information straight from the source.",
    url: "https://movingbeaumontforward.com",
    siteName: "Moving Beaumont Forward",
    images: [{ url: "/og.png", width: 1536, height: 768, alt: "Moving Beaumont Forward over a Beaumont mountain panorama" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moving Beaumont Forward",
    description: "Beaumont information straight from the source.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script src="/site-nav.js" defer />
        {children}
      </body>
    </html>
  );
}
