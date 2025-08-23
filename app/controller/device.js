'use strict';

const { Controller } = require('egg');

class DeviceController extends Controller {
  async index() {
    const { ctx } = this;
    const { offset = 0, limit = 20 } = ctx.query;
    const data = await ctx.service.device.list({ offset: Number(offset), limit: Number(limit) });
    ctx.body = { ok: true, data };
  }

  // 根据 id 查询设备
  async show() {
    const { ctx } = this;
    const { id } = ctx.request.body || {};
    const data = await ctx.service.device.getById(id);
    if (!data) {
      ctx.status = 404;
      ctx.body = { ok: false, error: 'Not Found' };
      return;
    }
    ctx.body = { ok: true, data };
  }

  // 创建设备
  async create() {
    const { ctx } = this;
    const payload = ctx.request.body || {};
    const data = await ctx.service.device.create(payload);
    ctx.status = 201;
    ctx.body = { ok: true, data };
  }

  // 更新设备信息
  async update() {
    const { ctx } = this;
    const payload = ctx.request.body || {};
    const { id } = payload;
    const data = await ctx.service.device.update(id, payload);
    if (!data) {
      ctx.status = 404;
      ctx.body = { ok: false, error: 'Not Found' };
      return;
    }
    ctx.body = { ok: true, data };
  }

  // 删除设备
  async destroy() {
    const { ctx } = this;
    const { id } = ctx.request.body || {};
    const rows = await ctx.service.device.remove(id);
    ctx.body = { ok: true, data: { affected: rows } };
  }

  // 控制设备开关机
  // PUT /api/devices/power  body: { device_id: string, on: boolean }
  async setPower() {
    const { ctx } = this;
    const { device_id, on } = ctx.request.body || {};
    if (!device_id || on === undefined) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'Missing required field: device_id or on' };
      return;
    }
    const updated = await ctx.service.device.setPower(String(device_id), on === '1');
    if (!updated) {
      ctx.status = 404;
      ctx.body = { ok: false, error: 'Device Not Found' };
      return;
    }
    ctx.body = { ok: true, data: { id: String(device_id), power_status: !!on } };
  }

  // 对设备进行温度控制
  // PUT /api/devices/temperature  body: { device_id: string, temperature: number }
  async setTemperature() {
    const { ctx } = this;
    const { device_id, temperature } = ctx.request.body || {};
    if (!device_id || temperature === undefined) {
      ctx.status = 400;
      ctx.body = { ok: false, error: 'Missing required field: device_id or temperature' };
      return;
    }
    const updated = await ctx.service.device.setTemperature(String(device_id), Number(temperature));
    if (!updated) {
      ctx.status = 404;
      ctx.body = { ok: false, error: 'Device Not Found' };
      return;
    }
    ctx.body = { ok: true, data: { id: String(device_id), temperature } };
  }
}

module.exports = DeviceController;
