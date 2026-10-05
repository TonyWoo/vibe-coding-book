
// 购物车页 /cart：数量增减、填写取货信息、提交订单（订单写入 localStorage）
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { getProduct } from "@/lib/products";
import { makeOrderId, saveOrder, type OrderItem } from "@/lib/orders";

export default function CartPage() {
  const { lines, total, setQty, remove, clear } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (!name.trim()) return setError("请填写姓名");
    if (!/^1[3-9]\d{9}$/.test(phone.trim())) return setError("请填写正确的 11 位手机号");
    if (!pickupTime) return setError("请选择取货时间");

    // 把购物车行快照成订单项（保存当时的商品名和单价）
    const items: OrderItem[] = lines.flatMap((line) => {
      const product = getProduct(line.productId);
      if (!product) return [];
      return [{ productId: product.id, name: product.name, price: product.price, qty: line.qty }];
    });

    saveOrder({
      id: makeOrderId(),
      createdAt: new Date().toISOString(),
      name: name.trim(),
      phone: phone.trim(),
      pickupTime,
      items,
      total,
      status: "待取货",
    });

    clear();
    router.push("/orders");
  }

  if (lines.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-6xl">🛒</div>
        <p className="mt-4 text-stone-500">购物车是空的，去挑点好吃的吧</p>
        <Link
          href="/menu"
          className="mt-6 inline-block rounded-full bg-amber-600 px-6 py-2.5 font-medium text-white hover:bg-amber-700"
        >
          去菜单看看
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-800">🛒 购物车</h1>

      {/* 商品行 */}
      <div className="mt-4 space-y-3">
        {lines.map((line) => {
          const product = getProduct(line.productId);
          if (!product) return null;
          return (
            <div
              key={line.productId}
              className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-amber-50 text-3xl">
                {product.emoji}
              </div>
              <div className="flex-1">
                <div className="font-medium">{product.name}</div>
                <div className="text-sm text-amber-700">¥{product.price}</div>
              </div>
              {/* 数量加减 */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQty(line.productId, line.qty - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-lg text-amber-800 hover:bg-amber-200"
                  aria-label="减少"
                >
                  −
                </button>
                <span className="w-6 text-center font-medium">{line.qty}</span>
                <button
                  onClick={() => setQty(line.productId, line.qty + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-lg text-amber-800 hover:bg-amber-200"
                  aria-label="增加"
                >
                  +
                </button>
              </div>
              <button
                onClick={() => remove(line.productId)}
                className="text-sm text-stone-400 hover:text-red-500"
              >
                删除
              </button>
            </div>
          );
        })}
      </div>

      {/* 取货信息表单 */}
      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-bold">📝 取货信息</h2>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="text-sm text-stone-600">姓名</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="取货人姓名"
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 outline-none focus:border-amber-500"
            />
          </label>
          <label className="block">
            <span className="text-sm text-stone-600">电话</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="11 位手机号"
              inputMode="numeric"
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 outline-none focus:border-amber-500"
            />
          </label>
          <label className="block">
            <span className="text-sm text-stone-600">取货时间</span>
            <input
              type="datetime-local"
              value={pickupTime}
              onChange={(e) => setPickupTime(e.target.value)}
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 outline-none focus:border-amber-500"
            />
          </label>
        </div>
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      </div>

      {/* 结算栏 */}
      <div className="mt-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
        <div>
          <span className="text-sm text-stone-500">合计</span>
          <span className="ml-2 text-2xl font-bold text-amber-700">¥{total}</span>
        </div>
        <button
          onClick={submit}
          className="rounded-full bg-amber-600 px-8 py-2.5 font-medium text-white hover:bg-amber-700 active:scale-95"
        >
          提交订单
        </button>
      </div>
    </div>
  );
}
