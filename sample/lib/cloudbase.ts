// CloudBase 初始化：腾讯云 Serverless，国内可稳定访问
// 环境 ID 配在 .env.local 里：NEXT_PUBLIC_CLOUDBASE_ENV_ID=你的环境ID
// 没配时返回 null，业务代码自动降级为纯 localStorage，不报错
import cloudbase from "@cloudbase/js-sdk";

let app: cloudbase.app.App | null = null;

export function getCloudApp(): cloudbase.app.App | null {
  const envId = process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID;
  if (!envId) return null;
  if (!app) {
    app = cloudbase.init({ env: envId });
  }
  return app;
}

/** 云数据库是否可用（配了环境 ID 即为可用） */
export function cloudEnabled(): boolean {
  return !!process.env.NEXT_PUBLIC_CLOUDBASE_ENV_ID;
}
