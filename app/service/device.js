'use strict';

const { Service } = require('egg');

const OPERATE_TYPE = {
  SetPower: 1,
  SetTemperature: 2,
};

class DeviceService extends Service {
  async list(opts = {}) {
    const { offset = 0, limit = 20 } = opts;
    const { Device } = this.ctx.model;
    return await Device.findAll({ offset, limit });
  }

  /**
   * 获取详情
   * @param {string} id 设备ID
   */
  async getById(id) {
    const { Device, User } = this.ctx.model;
    return await Device.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
        },
      ],
    });
  }

  /**
   * 新建设备
   * @param {object} payload 设备属性
   */
  async create(payload) {
    const { Device } = this.ctx.model;
    return await Device.create({ ...payload });
  }

  /**
   * 更新设备
   * @param {string} id 设备ID
   * @param {object} payload 待更新字段
   */
  async update(id, payload) {
    const { Device } = this.ctx.model;
    const dev = await Device.findByPk(id);
    if (!dev) return null;
    const data = { ...payload };
    if (data.id) delete data.id;
    await dev.update(data);
    return dev;
  }

  /**
   * 删除设备
   * @param {string} id 设备ID
   */
  async remove(id) {
    const { Device } = this.ctx.model;
    return await Device.destroy({ where: { id } });
  }

  /**
   * 获取设备温度
   * @param {string} device_id 设备ID
   */
  async getTemperature(device_id) {
    const { Temperature } = this.ctx.model;
    return await Temperature.findOne({
      where: { device_id },
    });
  }

  /**
   * 设备开关机
   * @param {string} id 设备ID
   * @param {boolean} powerOn true=开机, false=关机
   */
  async setPower(id, powerOn) {
    const { Device, Log } = this.ctx.model;
    const device = await Device.findByPk(id);
    if (!device) return null;

    // 1) 更新数据库状态
    await device.update({ power_status: !!powerOn });

    // 2) 通过 MQTT 下发控制指令
    const topic = `honeySleepController`;

    const message = {
      // device_id: id,
      // event_type: OPERATE_TYPE.SetPower,
      // event_data: powerOn ? 'on' : 'off',
      // event_time: Date.now(),
      led: Number(powerOn),
      gpio38: Number(powerOn),
      gpio39: Number(powerOn),
      gpio40: Number(powerOn),
    };

    this.app.mqttPublish(topic, message, { qos: 0 });

    // 3) 记录日志
    try {
      await Log.create({
        device_id: id,
        event_type: 'set_power',
        event_data: JSON.stringify(message),
      });
    } catch (e) {
      // 日志失败不影响主流程
      this.ctx.logger.warn('[device.setPower] log create failed: %s', e && e.message);
    }

    return device;
  }

  /**
   * 对设备进行温度控制
   * @param {string} id 设备ID
   * @param {string} phase 温度阶段
   * @param {number} temperature 目标温度值
   */
  async setTemperature(id, phase, temperature) {
    const { Device, Log } = this.ctx.model;
    const device = await Device.findByPk(id);
    if (!device) return null;

    // 1) 更新或创建温度记录
    const phaseMap = {
      now: 'now_temp',
      night: 'night_temp',
      dawn: 'dawn_temp',
    };

    const columnName = phaseMap[phase];
    if (!columnName) {
      throw new Error(`Invalid phase: ${phase}`);
    }

    // 查找或创建今天的温度记录
    const [tempRecord] = await this.ctx.model.Temperature.findOrCreate({
      where: {
        device_id: device.id,
      },
      defaults: {
        device_id: device.id,
        timestamp: new Date(),
        [columnName]: temperature,
      },
    });

    // 如果记录已存在，更新对应的温度值
    if (tempRecord) {
      await tempRecord.update({
        [columnName]: temperature,
      });
    }

    // 2) 通过 MQTT 下发控制指令
    const topic = `honeySleepController`;
    const message = {
      device_id: id,
      event_type: OPERATE_TYPE.SetTemperature,
      event_data: temperature,
      event_time: Date.now(),
    };
    this.app.mqttPublish(topic, message, { qos: 0 });

    // 3) 记录日志
    try {
      await Log.create({
        device_id: id,
        event_type: 'set_temperature',
        event_data: JSON.stringify(message),
      });
    } catch (e) {
      // 日志失败不影响主流程
      this.ctx.logger.warn('[device.setTemperature] log create failed: %s', e && e.message);
    }

    return device;
  }
}

module.exports = DeviceService;
