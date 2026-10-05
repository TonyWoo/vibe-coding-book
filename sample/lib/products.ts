// 商品数据：贯穿全书的「小满烘焙」案例 v1 用硬编码商品（后续章节会迁移到数据库）

export type Category = "面包" | "蛋糕" | "饮品";

export interface Product {
  id: string;
  name: string;
  category: Category;
  /** 单价，单位：元 */
  price: number;
  desc: string;
  /** v1 用 emoji 做商品图占位，后续章节可换成真实图片 */
  emoji: string;
  /** 是否出现在首页「热卖推荐」 */
  hot?: boolean;
}

export const CATEGORIES: Array<"全部" | Category> = ["全部", "面包", "蛋糕", "饮品"];

export const PRODUCTS: Product[] = [
  { id: "b1", name: "奶香吐司", category: "面包", price: 18, desc: "每日现烤，奶香浓郁，松软可口", emoji: "🍞", hot: true },
  { id: "b2", name: "脆皮菠萝包", category: "面包", price: 10, desc: "表皮酥脆内里柔软，经典港式风味", emoji: "🥐" },
  { id: "b3", name: "全麦欧包", category: "面包", price: 22, desc: "低糖全麦，越嚼越香", emoji: "🥖", hot: true },
  { id: "b4", name: "红豆餐包", category: "面包", price: 14, desc: "豆沙馅料饱满，甜而不腻", emoji: "🥯" },
  { id: "c1", name: "草莓奶油蛋糕", category: "蛋糕", price: 128, desc: "6 寸，进口奶油，当日现做", emoji: "🍰", hot: true },
  { id: "c2", name: "巧克力慕斯杯", category: "蛋糕", price: 36, desc: "浓郁黑巧，入口即化", emoji: "🍫" },
  { id: "c3", name: "芒果千层", category: "蛋糕", price: 42, desc: "层层薄饼配新鲜芒果", emoji: "🥞" },
  { id: "c4", name: "纽约芝士蛋糕", category: "蛋糕", price: 38, desc: "重芝士配方，口感绵密", emoji: "🧀" },
  { id: "d1", name: "鲜奶拿铁", category: "饮品", price: 16, desc: "现磨咖啡豆配鲜牛奶", emoji: "🧋", hot: true },
  { id: "d2", name: "蜜桃乌龙茶", category: "饮品", price: 14, desc: "蜜桃果香配清香乌龙", emoji: "🍵" },
  { id: "d3", name: "经典美式", category: "饮品", price: 12, desc: "提神醒脑，咖啡原香", emoji: "☕" },
];

/** 按 id 查找商品，找不到返回 undefined */
export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

/** 首页热卖推荐 */
export function getHotProducts(): Product[] {
  return PRODUCTS.filter((p) => p.hot);
}
