'use strict';

module.exports = () => {
  return async function auth(ctx, next) {
    // 从请求头获取token
    const token = ctx.get('Authorization');
    if (!token) {
      ctx.status = 401;
      ctx.body = { ok: false, error: '未登录' };
      return;
    }

    // 验证token
    const user = await ctx.service.auth.verifyToken(token);
    if (!user) {
      ctx.status = 401;
      ctx.body = { ok: false, error: '登录已过期' };
      return;
    }

    // 将用户信息添加到上下文
    ctx.user = user;
    await next();
  };
};
