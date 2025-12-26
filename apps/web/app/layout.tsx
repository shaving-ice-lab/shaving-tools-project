import type { Metadata } from "next";

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
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
