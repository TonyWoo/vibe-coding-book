// 订单模型与本地存储：v1 用 localStorage 存订单（后续章节会换成数据库 + 后端接口）

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
