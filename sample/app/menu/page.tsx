
// 菜单页 /menu：按分类（全部 / 面包 / 蛋糕 / 饮品）筛选商品，点击加购
"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { CATEGORIES, PRODUCTS, type Category } from "@/lib/products";

export default function MenuPage() {
  const [category, setCategory] = useState<"全部" | Category>("全部");

  const visible =
    category === "全部" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800">🍽️ 菜单</h1>

      {/* 分类筛选 */}
      <div className="mt-4 flex gap-2">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              category === c
                ? "bg-amber-600 font-medium text-white"
                : "bg-white text-stone-600 hover:bg-amber-100"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* 商品网格：手机 2 列，桌面 3 列 */}
      <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
