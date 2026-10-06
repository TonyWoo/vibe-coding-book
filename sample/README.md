# 小满烘焙 · 线上订货系统（示例项目）

《人人都能开发软件》一书的贯穿示例：烘焙店主林小满用 AI 从零做出的订货系统。

## 页面

- `/` 首页 · `/menu` 菜单 · `/cart` 购物车 · `/orders` 我的订单 · `/admin` 店主后台

## 订单数据：localStorage + CloudBase 云数据库

- 顾客下单：先写本地 localStorage（"我的订单"秒开），再异步同步到云端
- 店主在 `/admin` 看云端全部订单、标记完成
- 没配 CloudBase 时自动降级为纯 localStorage，不影响下单流程

## 安全模型

- **环境 ID**（`NEXT_PUBLIC_CLOUDBASE_ENV_ID`）在前端，但它只是公开的环境标识，不是密钥，CloudBase 设计如此
- **店主密码**只活在云函数 `admin-login` 的环境变量 `ADMIN_PASSWORD` 里，前端永远拿不到
- 顾客下单走 `orders` 集合的 `create` 权限（所有人可写）；读订单、标记完成走 `read`/`update` 权限（仅登录用户——店主用票据登录后才有身份）

## 接入 CloudBase（腾讯云，国内可稳定访问）

1. 腾讯云控制台开通 CloudBase，创建一个环境，记下**环境 ID**
2. 云数据库新建集合 `orders`，安全规则设为：
   - `create`：所有人（顾客下单用）
   - `read` / `update`：仅登录用户（店主后台用票据登录）
   - `delete`：关闭
3. 部署云函数 `admin-login`（代码在 `cloudfunctions/admin-login/`）：
   - 控制台 → 云函数 → 新建，函数名填 `admin-login`，粘贴 `index.js` 内容；或装 CLI 后 `cloudbase functions:deploy admin-login`
   - 给该函数配置环境变量 `ADMIN_PASSWORD=你的店主密码`
4. 复制 `.env.example` 为 `.env.local`，填入 `NEXT_PUBLIC_CLOUDBASE_ENV_ID=你的环境ID`
5. 重新 `npm run build`

## 本地运行

```bash
npm install
npm run dev
```

打开 http://localhost:3000
