import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AppShell } from "@/components/shared/AppShell";

const sfProDisplay = localFont({
  src: [
    {
      path: "../assets/font/sf-pro-display/sfprodisplayregular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/font/sf-pro-display/sfprodisplaymedium.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/font/sf-pro-display/sfprodisplaybold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sf-pro",
});

export const metadata: Metadata = {
  title: {
    default: "Sociality",
    template: "%s | Sociality",
  },
  description:
    "Sociality — Share your moments, connect with friends, and discover inspiring content.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "https://sociality.app"
  ),
  openGraph: {
    title: "Sociality",
    description:
      "Share your moments, connect with friends, and discover inspiring content.",
    type: "website",
    siteName: "Sociality",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sociality",
    description:
      "Share your moments, connect with friends, and discover inspiring content.",
  },
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={sfProDisplay.variable}>
      <body
        className={`${sfProDisplay.className} antialiased bg-black text-white min-h-screen`}
      >
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
