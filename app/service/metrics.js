'use strict';

const dayjs = require('dayjs');

const { Service } = require('egg');
const { TOPIC } = require('../constant');

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

    console.log('--------------------------------', new Date());
    console.log('--------------------------------', new Date('2025-08-28 00:00:00'));

    app.on('mqtt-message', async (data) => {
      const { topic, payload } = data;
      const message = payload.toString();
      this.ctx.logger.info(`处理MQTT消息: [${topic}]`);
      try {
        // 使用 this.ctx 来调用其他服务或模型
        const metricsKeys = [
          {
            key: 'snore',
            model: 'snore',
          },
          {
            key: 'heart',
            model: 'hr',
          },
          {
            key: 'breath',
            model: 'rr',
          },
        ];
        if (topic === TOPIC.ReportMetric) {
          try {
            const messageObj = JSON.parse(message);
            const { time, ...restObj } = messageObj;
            const date = time ? new Date(time) : new Date();

            Object.keys(restObj).forEach(async (key) => {
              const metric = metricsKeys.find((m) => m.key === key);
              if (metric) {
                await this.insertOne(metric.model, {
                  device_id: 'device-0001',
                  timestamp: date,
                  data: messageObj[key],
                });
              }
            });
          } catch (error) {
            this.ctx.logger.error('处理MQTT消息失败:', error);
          }
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

  async queryMetricsRange(modelName, opts = {}) {
    const { device_id, start, end } = opts;
    const model = this._getModel(modelName);
    const where = { device_id };

    // 确保有开始和结束时间
    const startDate = new Date(start);
    const endDate = new Date(end);

    where.timestamp = {
      [this.app.Sequelize.Op.between]: [startDate, endDate],
    };

    const results = await model.findAll({
      attributes: ['data', 'timestamp'],
      where,
      order: [['timestamp', 'ASC']],
    });

    // 将结果按分钟分组
    const groupedByMinute = {};
    results.forEach((record) => {
      const timestamp = dayjs(record.timestamp);
      const minuteKey = timestamp.format('YYYY-MM-DD HH:mm:00');

      // 只保存每分钟的第一个非零数据
      if (!groupedByMinute[minuteKey]) {
        if (record.data !== 0) {
          groupedByMinute[minuteKey] = record.data;
        } else {
          // 如果是0，暂时保存，等待是否有非0数据
          groupedByMinute[minuteKey] = 0;
        }
      } else if (groupedByMinute[minuteKey] === 0 && record.data !== 0) {
        // 如果之前保存的是0，且当前数据非0，则更新为非0数据
        groupedByMinute[minuteKey] = record.data;
      }
    });

    // 生成完整的24小时数据点（1440个点）
    const completeData = [];
    let currentMinute = dayjs(startDate);

    while (currentMinute.isBefore(endDate) || currentMinute.isSame(endDate, 'minute')) {
      const minuteKey = currentMinute.format('YYYY-MM-DD HH:mm:00');
      completeData.push({
        timestamp: minuteKey,
        data: groupedByMinute[minuteKey] || 0, // 如果没有数据，使用0
      });
      currentMinute = currentMinute.add(1, 'minute');
    }

    return completeData;
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
