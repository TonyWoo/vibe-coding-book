
// 我的订单页 /orders：从 localStorage 读订单列表，展示状态，可把「待取货」标记为已完成
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { completeOrder, formatTime, loadOrders, type Order } from "@/lib/orders";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  // 客户端挂载后再读 localStorage，避免 SSR 水合不一致
  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  function markComplete(id: string) {
    completeOrder(id);
    setOrders(loadOrders());
  }

  if (orders.length === 0) {
    return (
      <div className="py-16 text-center">
        <div className="text-6xl">📋</div>
        <p className="mt-4 text-stone-500">还没有订单</p>
        <Link
          href="/menu"
          className="mt-6 inline-block rounded-full bg-amber-600 px-6 py-2.5 font-medium text-white hover:bg-amber-700"
        >
          去下单
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-800">📋 我的订单</h1>
      <div className="mt-4 space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-400">订单 {order.id}</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  order.status === "待取货"
                    ? "bg-orange-100 text-orange-700"
                    : "bg-green-100 text-green-700"
                }`}
              >
                {order.status}
              </span>
            </div>

            <div className="mt-3 space-y-1 text-sm">
              {order.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-stone-600">
                  <span>
                    {item.name} × {item.qty}
                  </span>
                  <span>¥{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            <div className="mt-3 border-t border-dashed border-stone-200 pt-3 text-sm text-stone-500">
              <div>取货人：{order.name}（{order.phone}）</div>
              <div>取货时间：{formatTime(order.pickupTime)}</div>
              <div>下单时间：{formatTime(order.createdAt.slice(0, 16))}</div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-lg font-bold text-amber-700">¥{order.total}</span>
              {order.status === "待取货" && (
                <button
                  onClick={() => markComplete(order.id)}
                  className="rounded-full border border-green-300 px-4 py-1.5 text-sm text-green-700 hover:bg-green-50"
                >
                  标记为已完成
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
