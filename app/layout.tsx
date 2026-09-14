import type { Metadata } from "next";
import "../public/styles.css";
import "../public/council-brand.css";
import "./council-home.css";

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
      <body>
        {children}
      </body>
    </html>
  );
}
