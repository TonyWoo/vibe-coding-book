
// 商品卡片：展示 emoji 图、名称、描述、价格，「加购」按钮把商品放进购物车
"use client";

import type { Product } from "@/lib/products";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  return (
    <div className="flex flex-col rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
      <div className="flex h-20 items-center justify-center rounded-xl bg-amber-50 text-5xl">
        {product.emoji}
      </div>
      <h3 className="mt-3 font-medium text-stone-800">{product.name}</h3>
      <p className="mt-1 flex-1 text-sm text-stone-500">{product.desc}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-bold text-amber-700">¥{product.price}</span>
        <button
          onClick={() => add(product.id)}
          className="rounded-full bg-amber-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-amber-700 active:scale-95"
        >
          加购
        </button>
      </div>
    </div>
  );
}
