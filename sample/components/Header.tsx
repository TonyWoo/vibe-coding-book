
// 顶部导航栏：店名 Logo、页面链接、右上角购物车角标（件数实时更新）
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";

const LINKS = [
  { href: "/", label: "首页" },
  { href: "/menu", label: "菜单" },
  { href: "/orders", label: "我的订单" },
];

export default function Header() {
  const { count } = useCart();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-amber-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold text-amber-900">
          🥐 小满烘焙
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3 py-1.5 ${
                pathname === l.href
                  ? "bg-amber-100 font-medium text-amber-900"
                  : "text-stone-500 hover:bg-amber-50"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/cart"
            className={`relative rounded-full px-3 py-1.5 ${
              pathname === "/cart"
                ? "bg-amber-100 font-medium text-amber-900"
                : "text-stone-500 hover:bg-amber-50"
            }`}
          >
            🛒 购物车
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-xs font-bold text-white">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
