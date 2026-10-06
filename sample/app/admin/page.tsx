// 店主后台 /admin：看云端全部订单、标记完成
//
// 安全模型：密码校验在 CloudBase 云函数 admin-login 里完成（服务端），
// 前端永远拿不到密码。校验通过后前端用票据登录，读订单走数据库安全规则
// （orders 集合：create 所有人可写，read/update 仅登录用户）。
// 部署步骤见 README 和 cloudfunctions/admin-login/index.js 头部注释。
"use client";

import { useState } from "react";
import { getCloudApp } from "@/lib/cloudbase";
import {
  cloudEnabled,
  completeCloudOrder,
  formatTime,
  loadCloudOrders,
  type Order,
} from "@/lib/orders";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      setOrders(await loadCloudOrders());
    } catch {
      setError("读取订单失败：请检查网络，或确认数据库安全规则允许登录用户读取");
    } finally {
      setLoading(false);
    }
  }

  // 密码发给云函数校验，通过后拿票据登录（密码不出前端 → 云函数这一跳之外）
  async function login() {
    const app = getCloudApp();
    if (!app) return;
    setLoggingIn(true);
    setError("");
    try {
      const res = await app.callFunction({
        name: "admin-login",
        data: { password },
      });
      const result = res.result as { ok: boolean; ticket?: string; error?: string };
      if (!result.ok) {
        setError(result.error || "登录失败");
        return;
      }
      // 注：@cloudbase/js-sdk 的类型定义未暴露 signInWithTicket（运行时存在），这里做一次类型断言
      const auth = app.auth() as unknown as {
        signInWithTicket: (ticket: string) => Promise<unknown>;
      };
      await auth.signInWithTicket(result.ticket!);
      setAuthed(true);
      setPassword("");
      refresh();
    } catch {
      setError("登录失败：请检查网络，或确认 admin-login 云函数已部署");
    } finally {
      setLoggingIn(false);
    }
  }

  async function markComplete(id: string) {
    const ok = await completeCloudOrder(id);
    if (ok) refresh();
    else setError("标记失败：请确认数据库安全规则允许登录用户更新");
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
        <p className="mt-2 text-center text-xs text-stone-400">
          密码在云端校验，不会暴露在前端代码里
        </p>
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
          disabled={loggingIn}
          className="mt-4 w-full rounded-full bg-amber-600 py-2.5 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {loggingIn ? "验证中…" : "进入"}
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
