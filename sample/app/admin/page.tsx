// 店主后台 /admin：看云端全部订单、标记完成
// 简单密码保护（示例级别）：密码配在 .env.local 的 NEXT_PUBLIC_ADMIN_PASSWORD，
// 默认 xiaoman123，上线前务必改掉。正式做法见书中第 12 章（登录与授权）。
"use client";

import { useState } from "react";
import {
  cloudEnabled,
  completeCloudOrder,
  formatTime,
  loadCloudOrders,
  type Order,
} from "@/lib/orders";

const DEFAULT_PASSWORD = "xiaoman123";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const expected = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || DEFAULT_PASSWORD;

  async function refresh() {
    setLoading(true);
    try {
      setOrders(await loadCloudOrders());
    } catch {
      setError("读取订单失败，请检查网络或 CloudBase 配置");
    } finally {
      setLoading(false);
    }
  }

  function login() {
    if (password === expected) {
      setAuthed(true);
      setError("");
      refresh();
    } else {
      setError("密码不对");
    }
  }

  async function markComplete(id: string) {
    const ok = await completeCloudOrder(id);
    if (ok) refresh();
    else setError("标记失败，请重试");
  }

  if (!cloudEnabled()) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center">
        <div className="text-6xl">🔧</div>
        <p className="mt-4 font-medium text-stone-700">店主后台还没接上云数据库</p>
        <p className="mt-2 text-sm leading-relaxed text-stone-500">
          在 <code className="rounded bg-stone-100 px-1">.env.local</code> 里配置
          <code className="rounded bg-stone-100 px-1">NEXT_PUBLIC_CLOUDBASE_ENV_ID</code>
          后重新构建，顾客下的单才会同步到这里。
        </p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-sm py-16">
        <h1 className="text-center text-2xl font-bold text-stone-800">🔐 店主后台</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && login()}
          placeholder="请输入店主密码"
          className="mt-6 w-full rounded-xl border border-stone-200 px-4 py-2.5 outline-none focus:border-amber-500"
        />
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <button
          onClick={login}
          className="mt-4 w-full rounded-full bg-amber-600 py-2.5 font-medium text-white hover:bg-amber-700"
        >
          进入
        </button>
      </div>
    );
  }

  const pending = orders.filter((o) => o.status === "待取货");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-stone-800">📦 店主后台</h1>
        <button
          onClick={refresh}
          className="rounded-full border border-stone-200 px-4 py-1.5 text-sm text-stone-500 hover:bg-stone-50"
        >
          {loading ? "刷新中…" : "刷新"}
        </button>
      </div>
      <p className="mt-1 text-sm text-stone-400">
        待取货 {pending.length} 单 · 共 {orders.length} 单
      </p>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

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
                  className="rounded-full bg-green-600 px-4 py-1.5 text-sm text-white hover:bg-green-700"
                >
                  完成取货
                </button>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && !loading && (
          <p className="py-12 text-center text-stone-400">还没有顾客下单</p>
        )}
      </div>
    </div>
  );
}
