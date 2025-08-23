'use strict';

const { Service } = require('egg');

class MetricsService extends Service {
  /**
   * 通用写入（单条）
   * @param {string} modelName hr|rr|temperature|snore|motion
   * @param {object} payload { device_id, timestamp, value }
   *  - 对应字段名：hr/rr -> value; temperature -> body_temp; snore/motion -> 各自字段
   */
  async insertOne(modelName, payload) {
    const model = this._getModel(modelName);
    const row = this._normalizePayload(modelName, payload);
    return await model.create(row);
  }

  /**
   * 批量写入
   * @param {string} modelName
   * @param {Array<object>} rows
   */
  async bulkInsert(modelName, rows) {
    const model = this._getModel(modelName);
    const normalized = rows.map((r) => this._normalizePayload(modelName, r));
    return await model.bulkCreate(normalized, { validate: true });
  }

  /**
   * 区间查询（按 device 与时间范围）
   * @param {string} modelName
   * @param {object} opts { device_id, start, end, limit, order }
   */
  async queryRange(modelName, opts = {}) {
    const { device_id, start, end, limit = 5000, order = 'ASC' } = opts;
    const model = this._getModel(modelName);
    const where = {};
    if (device_id) where.device_id = device_id;
    if (start || end) {
      where.timestamp = {};
      if (start) where.timestamp.$gte = new Date(start);
      if (end) where.timestamp.$lte = new Date(end);
    }
    return await model.findAll({
      where,
      limit,
      order: [['timestamp', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']],
    });
  }

  _getModel(modelName) {
    const m = this.ctx.model[modelName.toUpperCase()] || this.ctx.model[modelName];
    if (!m) throw new Error(`model not found: ${modelName}`);
    return m;
  }

  _normalizePayload(modelName, payload) {
    const base = {
      device_id: payload.device_id,
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
    };
    switch (modelName) {
      case 'hr':
        return { ...base, hr: payload.hr ?? payload.value };
      case 'rr':
        return { ...base, rr: payload.rr ?? payload.value };
      case 'temperature':
        return { ...base, body_temp: payload.body_temp ?? payload.value };
      case 'snore':
        return { ...base, snore: payload.snore ?? payload.value };
      case 'motion':
        return { ...base, motion: payload.motion ?? payload.value };
      default:
        throw new Error(`unsupported model: ${modelName}`);
    }
  }
}

module.exports = MetricsService;
