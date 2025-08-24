'use strict';

const { Service } = require('egg');

class UserService extends Service {
  /**
   * 列表分页查询
   * @param {object} opts
   * @param {number} [opts.offset=0]
   * @param {number} [opts.limit=20]
   */
  async list(opts = {}) {
    const { offset = 0, limit = 20 } = opts;
    const { User } = this.ctx.model;
    const result = await User.findAndCountAll({
      offset,
      limit,
      order: [['created_at', 'DESC']],
    });
    return result;
  }

  /**
   * 获取详情
   * @param {string} id
   */
  async getById(id) {
    const { User, Device } = this.ctx.model;
    const user = await User.findByPk(id, {
      include: [
        {
          model: Device,
          as: 'devices',
        },
      ],
    });
    const config = this.app.config.sequelize;
    return {
      config,
    };
  }

  /**
   * 新建用户
   * mvp阶段，密码明文存储
   * @param {object} payload
   */
  async create(payload) {
    const { User } = this.ctx.model;
    const data = { ...payload };
    if (data.email) data.email = String(data.email).trim().toLowerCase();
    return await User.create(data);
  }

  /**
   * 更新用户
   * @param {string} id
   * @param {object} payload
   */
  async update(id, payload) {
    const { User } = this.ctx.model;
    const user = await User.findByPk(id);
    if (!user) return null;
    const data = { ...payload };
    if (data.id) delete data.id;
    if (data.email) data.email = String(data.email).trim().toLowerCase();
    await user.update(data);
    return user;
  }

  /**
   * 删除用户
   * @param {string} id
   */
  async remove(id) {
    const { User } = this.ctx.model;
    return await User.destroy({ where: { id } });
  }
}

module.exports = UserService;
