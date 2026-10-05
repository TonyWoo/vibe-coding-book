// 订单模型与存储：
// - v1 用 localStorage 存订单（顾客自己手机上看"我的订单"）
// - v2 起同步一份到 CloudBase 云数据库，店主在 /admin 后台能看到所有顾客的订单
// 没配 CloudBase 环境 ID 时，云写入自动跳过，不影响下单流程

import { getCloudApp } from "./cloudbase";
export { cloudEnabled } from "./cloudbase";

export type OrderStatus = "待取货" | "已完成";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  /** 下单时间，ISO 字符串 */
  createdAt: string;
  name: string;
  phone: string;
  /** 期望取货时间（表单原文，如 "2026-10-06T18:30"） */
  pickupTime: string;
  items: OrderItem[];
  /** 订单总金额，单位：元 */
  total: number;
  status: OrderStatus;
}

const STORAGE_KEY = "xiaoman-orders";

/** 生成订单号：XM + 时间戳转 36 进制 */
export function makeOrderId(): string {
  return "XM" + Date.now().toString(36).toUpperCase();
}

/** 读出全部订单（按 localStorage 里的数组顺序返回） */
export function loadOrders(): Order[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Order[]) : [];
  } catch {
    return [];
  }
}

/** 保存一笔新订单（插到最前面，方便「我的订单」倒序展示） */
export function saveOrder(order: Order): void {
  const orders = loadOrders();
  orders.unshift(order);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

/** 把订单标记为已完成 */
export function completeOrder(id: string): void {
  const orders = loadOrders().map((o) =>
    o.id === id ? { ...o, status: "已完成" as OrderStatus } : o,
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

/** 格式化展示时间：把 "2026-10-06T18:30" 显示为 "2026-10-06 18:30" */
export function formatTime(value: string): string {
  return value.replace("T", " ");
}

const CLOUD_COLLECTION = "orders";

/** 把订单同步到云数据库。失败/未配置时返回 false，调用方不应因此阻塞下单 */
export async function saveOrderToCloud(order: Order): Promise<boolean> {
  try {
    const app = getCloudApp();
    if (!app) return false;
    const db = app.database();
    // _id 用订单号，方便按订单号查；云数据库安全规则应设为：所有人可 create，仅店主可 read/update
    await db.collection(CLOUD_COLLECTION).add({ data: { _id: order.id, ...order } });
    return true;
  } catch {
    return false;
  }
}

/** 店主后台：读出云端全部订单（按创建时间倒序） */
export async function loadCloudOrders(): Promise<Order[]> {
  const app = getCloudApp();
  if (!app) return [];
  const db = app.database();
  const res = await db
    .collection(CLOUD_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();
  return (res.data as Order[]) ?? [];
}

/** 店主后台：把云端订单标记为已完成 */
export async function completeCloudOrder(id: string): Promise<boolean> {
  try {
    const app = getCloudApp();
    if (!app) return false;
    const db = app.database();
    await db.collection(CLOUD_COLLECTION).doc(id).update({ data: { status: "已完成" } });
    return true;
  } catch {
    return false;
  }
}
