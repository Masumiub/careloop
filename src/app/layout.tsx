import type { Metadata } from "next";
import { Fraunces, Public_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";
import { ToastProvider } from "@/components/toast";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CareLoop — Disability support services, Australia",
    template: "%s · CareLoop",
  },
  description:
    "CareLoop connects Australians with disability to trusted everyday support — personal care, transport, community access and more. Request help in minutes, track it live.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-AU" className={`${fraunces.variable} ${publicSans.variable}`}>
      <body className="grain flex min-h-screen flex-col font-sans antialiased">
        <ToastProvider>
          <Nav />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
