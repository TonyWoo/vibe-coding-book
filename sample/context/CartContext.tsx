
// 购物车全局状态：React Context 对外提供读写接口，localStorage 做持久化（刷新不丢失）
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getProduct } from "@/lib/products";

export interface CartLine {
  productId: string;
  qty: number;
}

interface CartContextValue {
  lines: CartLine[];
  /** 商品总件数（导航栏角标用） */
  count: number;
  /** 购物车总金额，单位：元 */
  total: number;
  add: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "xiaoman-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  // 先给空数组避免 SSR 水合不一致，挂载后再从 localStorage 恢复
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: unknown = JSON.parse(raw);
        if (Array.isArray(parsed)) setLines(parsed as CartLine[]);
      }
    } catch {
      // 读失败就当空购物车，不打断页面
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, loaded]);

  const add = useCallback((productId: string) => {
    setLines((prev) => {
      const found = prev.find((l) => l.productId === productId);
      if (found) {
        return prev.map((l) =>
          l.productId === productId ? { ...l, qty: l.qty + 1 } : l,
        );
      }
      return [...prev, { productId, qty: 1 }];
    });
  }, []);

  const setQty = useCallback((productId: string, qty: number) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, qty } : l)),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((prev) => prev.filter((l) => l.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const { count, total } = useMemo(() => {
    let count = 0;
    let total = 0;
    for (const line of lines) {
      const product = getProduct(line.productId);
      if (!product) continue;
      count += line.qty;
      total += product.price * line.qty;
    }
    return { count, total };
  }, [lines]);

  const value = useMemo(
    () => ({ lines, count, total, add, setQty, remove, clear }),
    [lines, count, total, add, setQty, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** 在组件里读取购物车：const { lines, add, total } = useCart() */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart 必须在 CartProvider 内使用");
  return ctx;
}
