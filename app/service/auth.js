'use strict';

const { Service } = require('egg');
const crypto = require('crypto');

class AuthService extends Service {
  /**
   * 生成登录令牌
   * @param {string} userId 用户ID
   * @return {string} 登录令牌字符串
   */
  generateToken(userId) {
    const { app } = this;
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(16).toString('hex');
    return crypto
      .createHmac('sha256', app.config.keys)
      .update(`${userId}-${timestamp}-${randomStr}`)
      .digest('hex');
  }

  /**
   * 用户登录
   * @param {string} email 邮箱
   * @param {string} password 密码
   * @return {Promise<{ok: boolean, data?: object, error?: string}>>} 登录结果
   */
  async login(email, password) {
    const { ctx, app } = this;
    const { User } = ctx.model;

    // 1. 查找用户
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return { ok: false, error: '用户不存在' };
    }

    // 2. 检查账号状态
    if (!user.is_active) {
      return { ok: false, error: '账号已被禁用' };
    }

    // 3. 验证密码
    const passwordHash = crypto
      .createHmac('sha256', app.config.keys)
      .update(password)
      .digest('hex');

    if (passwordHash !== user.password_hash) {
      return { ok: false, error: '密码错误' };
    }

    // 4. 生成新的登录令牌
    const token = this.generateToken(user.id);
    const now = new Date();

    // 5. 更新用户登录信息
    await user.update({
      last_login: now,
      token,
    });

    return {
      ok: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        token,
        last_login: now,
      },
    };
  }

  /**
   * 验证登录令牌
   * @param {string} token 登录令牌
   * @return {Promise<object|null>} 用户对象或 null
   */
  async verifyToken(token) {
    if (!token) return null;

    const { User } = this.ctx.model;
    return await User.findOne({
      where: {
        token,
        is_active: true,
      },
    });
  }
}

module.exports = AuthService;
