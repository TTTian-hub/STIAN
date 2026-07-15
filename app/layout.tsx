import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: "问命/AskFate - AI智能命理占卜",
  description: "融合古老命理智慧与现代AI技术，提供星座、塔罗、八字、奇门、六爻、合盘等全方位预测解读",
  keywords: ["AI占卜", "问命", "AskFate", "星座", "塔罗", "八字", "奇门遁甲", "六爻", "合盘"],
  authors: [{ name: "问命/AskFate" }],
  openGraph: {
    title: "问命/AskFate - AI智能命理占卜",
    description: "融合古老命理智慧与现代AI技术，提供星座、塔罗、八字、奇门、六爻、合盘等全方位预测解读",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-screen clean-bg text-foreground antialiased overflow-x-hidden">
        <ThemeProvider>
          <TooltipProvider>
            <Navbar />
            <main className="relative z-10 pt-16 sm:pt-20 pb-8 sm:pb-12 px-4 sm:px-6">
              <div className="w-full max-w-lg mx-auto">
                {children}
              </div>
            </main>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
