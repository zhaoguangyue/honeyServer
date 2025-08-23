'use strict';

const { Controller } = require('egg');

class UserController extends Controller {
  // 用户登录
  async login() {
    const { ctx } = this;
    const { email, password } = ctx.request.body || {};

    // 参数验证
    if (!email || !password) {
      ctx.status = 400;
      ctx.body = { ok: false, error: '邮箱和密码不能为空' };
      return;
    }

    const result = await ctx.service.auth.login(email, password);
    if (!result.ok) {
      ctx.status = 401;
    }
    ctx.body = result;
  }
  async index() {
    const { ctx } = this;
    const { offset = 0, limit = 20 } = ctx.query;
    const data = await ctx.service.user.list({ offset: Number(offset), limit: Number(limit) });
    ctx.body = { ok: true, data };
  }

  async show() {
    const { ctx } = this;
    const { id } = ctx.request.body || {};
    const data = await ctx.service.user.getById(id);
    if (!data) {
      ctx.status = 404;
      ctx.body = { ok: false, error: 'Not Found' };
      return;
    }
    ctx.body = { ok: true, data };
  }

  async create() {
    const { ctx } = this;
    const payload = ctx.request.body || {};
    const data = await ctx.service.user.create(payload);
    ctx.status = 201;
    ctx.body = { ok: true, data };
  }

  async update() {
    const { ctx } = this;
    const payload = ctx.request.body || {};
    const { id } = payload;
    const data = await ctx.service.user.update(id, payload);
    if (!data) {
      ctx.status = 404;
      ctx.body = { ok: false, error: 'Not Found' };
      return;
    }
    ctx.body = { ok: true, data };
  }

  async destroy() {
    const { ctx } = this;
    const { id } = ctx.request.body || {};
    const rows = await ctx.service.user.remove(id);
    ctx.body = { ok: true, data: { affected: rows } };
  }
}

module.exports = UserController;
