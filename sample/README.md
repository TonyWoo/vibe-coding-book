# 小满烘焙 · 线上订货系统（示例项目）

《人人都能开发软件》一书的贯穿示例：烘焙店主林小满用 AI 从零做出的订货系统。

## 页面

- `/` 首页 · `/menu` 菜单 · `/cart` 购物车 · `/orders` 我的订单 · `/admin` 店主后台

## 订单数据：localStorage + CloudBase 云数据库

- 顾客下单：先写本地 localStorage（"我的订单"秒开），再异步同步到云端
- 店主在 `/admin` 看云端全部订单、标记完成（简单密码保护，见下）
- 没配 CloudBase 时自动降级为纯 localStorage，不影响下单流程

## 接入 CloudBase（腾讯云，国内可稳定访问）

1. 腾讯云控制台开通 CloudBase，创建一个环境，记下**环境 ID**
2. 云数据库新建集合 `orders`，权限规则设为：
   - `create`：所有人可写（顾客下单用）
   - `read` / `update`：仅管理员（店主后台用）
3. 复制 `.env.example` 为 `.env.local`，填入：
   - `NEXT_PUBLIC_CLOUDBASE_ENV_ID=你的环境ID`
   - `NEXT_PUBLIC_ADMIN_PASSWORD=` 改掉默认密码 `xiaoman123`
4. 重新 `npm run build`

## 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:3000
