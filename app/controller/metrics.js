'use strict';

const { Controller } = require('egg');

class MetricsController extends Controller {
  // 验证model类型并设置响应
  validateModel(model) {
    const { ctx } = this;

    if (!model) {
      ctx.status = 400;
      ctx.body = {
        ok: false,
        error: 'Missing required field: model',
      };
      return false;
    }

    const validModels = ['hr', 'rr', 'temperature', 'snore', 'motion'];
    if (!validModels.includes(model)) {
      ctx.status = 400;
      ctx.body = {
        ok: false,
        error: `Invalid model type. Must be one of: ${validModels.join(', ')}`,
      };
      return false;
    }

    return true;
  }
  // 单次插入传感器数据，model为数据类型，payload为数据内容
  async insertOne() {
    const { ctx } = this;
    const { model, ...payload } = ctx.request.body || {}; // hr|rr|temperature|snore|motion

    if (!this.validateModel(model)) return;

    const data = await ctx.service.metrics.insertOne(model, payload);
    ctx.status = 201;
    ctx.body = { ok: true, data };
  }

  // 批量插入传感器数据，model为数据类型，rows为数据
  async bulkInsert() {
    const { ctx } = this;
    const { model, rows } = ctx.request.body || {};

    if (!this.validateModel(model)) return;

    const rowsData = Array.isArray(rows) ? rows : [];
    const data = await ctx.service.metrics.bulkInsert(model, rowsData);
    ctx.status = 201;
    ctx.body = { ok: true, data: { affected: data.length } };
  }

  /**
   * 查询传感器数据
   * @param {string} model 数据类型
   * @param {string} device_id 设备ID
   * @param {string} start 开始时间
   * @param {string} end 结束时间
   * @param {number} limit 返回数量
   * @param {string} order 排序方式
   * @returns {Promise<{ok: boolean, data: Array<object>}>}
   */
  async queryMetricsRange() {
    const { ctx } = this;
    const { type, device_id, start, end, limit, order } = ctx.request.body || {};

    if (!this.validateModel(type)) return;

    const data = await ctx.service.metrics.queryMetricsRange(type, {
      device_id,
      start,
      end,
      limit: limit ? Number(limit) : undefined,
      order,
    });
    ctx.body = { ok: true, data };
  }
}

module.exports = MetricsController;
