import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { Paywall } from "@/components/Paywall";

export const metadata: Metadata = {
  title: "AskFate 问命 · 宇宙正在给你回信",
  description: "融合东方命理、塔罗象征与 AI 个性化解读，陪你看见问题背后的另一种可能。",
  keywords: ["AI 命理", "AskFate", "问命", "塔罗", "八字", "星座运势", "奇门遁甲", "六爻", "关系合盘"],
  authors: [{ name: "AskFate 问命" }],
  openGraph: { title: "AskFate 问命 · 宇宙正在给你回信", description: "一段只属于你的 AI 命理探索旅程。", type: "website" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 5, themeColor: "#fff5e6" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <ThemeProvider><TooltipProvider>
          <div className="default-navbar"><Navbar /></div>
          <main>{children}</main>
          <Paywall />
        </TooltipProvider></ThemeProvider>
      </body>
    </html>
  );
}
