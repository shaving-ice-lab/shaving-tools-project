import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Shaving Tools Project",
  description: "A turborepo monorepo project",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="dark">
      <body className="min-h-screen bg-background font-sans antialiased">{children}</body>
    </html>
  );
}
