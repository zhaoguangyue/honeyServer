'use strict';

/**
 * 简单校验中间件工厂
 * @param {object} rules 字段必填数组或对象
 * 使用: validate({ required: ['device_id','timestamp'] })
 */
module.exports = (rules = {}) => {
  const required = rules.required || [];
  return async function validator(ctx, next) {
    if (required.length) {
      const source = ctx.method === 'GET' ? ctx.query : ctx.request.body || {};
      for (const key of required) {
        if (source[key] === undefined || source[key] === null || source[key] === '') {
          ctx.status = 400;
          ctx.body = { ok: false, error: `Missing required field: ${key}` };
          return;
        }
      }
    }
    await next();
  };
};
