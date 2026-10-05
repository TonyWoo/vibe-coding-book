
// 根布局：中文页面、暖色底色，CartProvider 包住全站，顶部导航 + 底部页脚
import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "小满烘焙 · 线上订货",
  description: "小满烘焙线上订货系统：现烤面包、蛋糕、饮品，到店自取",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full">
      <body className="flex min-h-full flex-col bg-amber-50 text-stone-800 antialiased">
        <CartProvider>
          <Header />
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
          <footer className="border-t border-amber-100 bg-white py-4 text-center text-sm text-stone-400">
            🥐 小满烘焙 · 现烤现卖，用心烘焙每一天
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
