'use strict';

const { Service } = require('egg');

class MetricsService extends Service {
  async validateModel(model) {
    const validModels = ['hr', 'rr', 'temperature', 'snore', 'motion'];
    if (!validModels.includes(model)) {
      throw new Error(`Invalid model: ${model}`);
    }
  }
  // 提供一个方法来注册监听器
  async registerHandlers() {
    const { app } = this;

    app.on('mqtt-message', async (data) => {
      const { topic, payload } = data;
      const message = payload.toString();
      this.ctx.logger.info(`处理MQTT消息: [${topic}]`);
      try {
        // 使用 this.ctx 来调用其他服务或模型
        if (typeof topic === 'string' && topic.startsWith('honeySleepSubscribeSensor')) {
          const { type, ...payload } = JSON.parse(message);
          await this.validateModel(type);
          await this.insertOne(type, payload);
        }
      } catch (error) {
        this.ctx.logger.error('处理MQTT消息失败:', error);
      }
    });
  }

  /**
   * 通用写入（单条）
   * @param {string} modelName hr|rr|temperature|snore|motion
   * @param {object} payload { device_id, timestamp, value }
   *  - 对应字段名：hr/rr/snore/motion -> data; temperature -> body_temp
   */
  async insertOne(modelName, payload) {
    const model = this._getModel(modelName);
    const row = this._normalizePayload(modelName, payload);
    return await model.create(row);
  }

  /**
   * 批量写入
   * @param {string} modelName 模型名：hr|rr|temperature|snore|motion
   * @param {Array<object>} rows 行数据数组
   */
  async bulkInsert(modelName, rows) {
    const model = this._getModel(modelName);
    const normalized = rows.map((r) => this._normalizePayload(modelName, r));
    return await model.bulkCreate(normalized, { validate: true });
  }

  /**
   * 区间查询（按 device 与时间范围）
   * @param {string} modelName 模型名
   * @param {object} opts { device_id, start, end, limit, order }
   */
  async queryMetricsRange(modelName, opts = {}) {
    const { device_id, /* start, end, */ limit = 5000, order = 'ASC' } = opts;
    const model = this._getModel(modelName);
    const where = {};
    if (device_id) where.device_id = device_id;
    // if (start || end) {
    //   where.timestamp = {};
    //   if (start) where.timestamp.$gte = new Date(start);
    //   if (end) where.timestamp.$lte = new Date(end);
    // }
    return await model.findAll({
      where,
      limit,
      order: [['timestamp', order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC']],
    });
  }

  _getModel(modelName) {
    const pascal =
      modelName && modelName[0] ? modelName[0].toUpperCase() + modelName.slice(1) : modelName;
    const m = this.ctx.model[pascal] || this.ctx.model[modelName];
    if (!m) throw new Error(`model not found: ${modelName}`);
    return m;
  }

  _normalizePayload(modelName, payload) {
    // 校验必填字段
    if (!payload || !payload.device_id) {
      throw new Error('device_id is required');
    }

    // 预留，后续公共基础字段可在这里新增
    const base = {
      device_id: payload.device_id,
      timestamp: payload.timestamp ? new Date(payload.timestamp) : new Date(),
    };

    switch (modelName) {
      case 'hr':
      case 'rr':
      case 'snore':
      case 'motion':
        if (payload.data == null) {
          throw new Error('data is required');
        }
        return { ...base, data: payload.data };
      case 'temperature':
        if (payload.current_temp == null) {
          throw new Error('current_temp is required');
        }
        return { ...base, current_temp: payload.current_temp };
      default:
        throw new Error(`unsupported model: ${modelName}`);
    }
  }
}

module.exports = MetricsService;
