import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "0G Quorum | Verifiable Multi-Agent Byzantine Consensus Protocol",
  description:
    "Autonomous multi-agent swarm deliberation, Byzantine fault tolerance (BFT), and cryptographic Merkle verification on 0G Storage & Compute.",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className="antialiased bg-[#06090e] text-slate-100 min-h-screen"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
