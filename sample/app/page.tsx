
// 首页 / ：Hero 横幅、热卖推荐、店铺信息（地址 / 营业时间 / 电话）
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { getHotProducts } from "@/lib/products";

export default function HomePage() {
  const hotProducts = getHotProducts();

  return (
    <div className="space-y-10">
      {/* Hero：店名 + 一句话卖点 + 行动按钮 */}
      <section className="rounded-3xl bg-gradient-to-br from-amber-100 via-orange-100 to-amber-200 px-6 py-12 text-center">
        <div className="text-6xl">🥐</div>
        <h1 className="mt-4 text-3xl font-bold text-amber-950">小满烘焙</h1>
        <p className="mt-2 text-amber-800">现烤现卖 · 线上下单 · 到店自取</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/menu"
            className="rounded-full bg-amber-600 px-6 py-2.5 font-medium text-white hover:bg-amber-700"
          >
            去点单
          </Link>
          <Link
            href="/orders"
            className="rounded-full border border-amber-300 bg-white px-6 py-2.5 font-medium text-amber-800 hover:bg-amber-50"
          >
            我的订单
          </Link>
        </div>
      </section>

      {/* 热卖推荐：从商品数据里取 hot 标记的商品 */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-stone-800">🔥 热卖推荐</h2>
          <Link href="/menu" className="text-sm text-amber-700 hover:underline">
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {hotProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 店铺信息 */}
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
          <div className="text-2xl">📍</div>
          <h3 className="mt-2 font-medium">店铺地址</h3>
          <p className="mt-1 text-sm text-stone-500">幸福路 88 号一层</p>
        </div>
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
          <div className="text-2xl">🕗</div>
          <h3 className="mt-2 font-medium">营业时间</h3>
          <p className="mt-1 text-sm text-stone-500">每天 8:00 – 21:00</p>
        </div>
        <div className="rounded-2xl bg-white p-5 text-center shadow-sm">
          <div className="text-2xl">📞</div>
          <h3 className="mt-2 font-medium">联系电话</h3>
          <p className="mt-1 text-sm text-stone-500">138-0000-0000</p>
        </div>
      </section>
    </div>
  );
}
