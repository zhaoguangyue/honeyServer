'use strict';

/**
 * 在 ctx.params 注入固定的 model 名称，以复用通用的 metrics controller
 * @param {string} model hr|rr|temperature|snore|motion
 */
module.exports = (model) => {
  return async function withModel(ctx, next) {
    ctx.params = ctx.params || {};
    ctx.params.model = model;
    await next();
  };
};
