import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { NavHeader } from "@/components/NavHeader";
import { MobileNav } from "@/components/MobileNav";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
  // Pinned to fixed static weights rather than the full variable range —
  // interpolating arbitrary weights on Fraunces' variable font (esp. in
  // italic) can render with distorted, overly "wonky" letterforms.
  weight: ["400", "500", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nodalis",
  description:
    "What's actually going on, and how does it connect to everything else.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <NavHeader />
        <main className="flex-1 pb-16 sm:pb-0">{children}</main>
        <MobileNav />
      </body>
    </html>
  );
}
