const { Controller } = require('egg');

class MqttController extends Controller {
  async publish() {
    const { ctx, app } = this;
    const params =
      ctx.request && ctx.request.body && Object.keys(ctx.request.body).length
        ? ctx.request.body
        : ctx.query;
    const topic = params && params.topic;
    const message = params && params.message;
    const qos = params && params.qos;

    if (!topic) {
      ctx.status = 400;
      ctx.body = { error: 'topic is required' };
      return;
    }

    const options = {};
    if (qos !== undefined) options.qos = Number(qos);

    app.mqttPublish(topic, message, options);
    ctx.body = { ok: true };
  }
}

module.exports = MqttController;
