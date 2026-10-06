// 云函数 admin-login：服务端校验店主密码
//
// 部署方式（二选一）：
//   1. CloudBase 控制台 → 云函数 → 新建函数，函数名填 admin-login，把本文件内容粘贴进去
//   2. 用 CloudBase CLI：cloudbase functions:deploy admin-login
// 部署后，在该函数的「环境变量」里配置 ADMIN_PASSWORD=你的店主密码。
//
// 原理：密码只活在云端，前端永远拿不到。校验通过后签发自定义登录票据，
// 前端用票据登录 CloudBase，后续读订单走数据库安全规则（仅登录用户可读/改）。
const cloudbase = require("@cloudbase/node-sdk");

const app = cloudbase.init({
  env: cloudbase.SYMBOL_CURRENT_ENV,
});

exports.main = async (event) => {
  const password = (event && event.password) || "";
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected) {
    return { ok: false, error: "服务端未配置 ADMIN_PASSWORD" };
  }
  if (!password || password !== expected) {
    return { ok: false, error: "密码不对" };
  }

  // 筱发自定义登录票据，uid 固定为 admin（单店主场景够用）
  const ticket = app.auth().createTicket("admin");
  return { ok: true, ticket };
};
