/*
 * 在 Egg 的 agent 进程中启动 MQTT 客户端( 最佳实践：单例长连接 )。
 * 设计目标：
 * 1) 只在 agent 内维持一条 MQTT 长连接, 避免多 worker 重复连接/重复消费；
 * 2) 所有订阅/重连/关闭在此处统一管理；
 * 3) 通过 agent.messenger 将消息路由到任一 worker, 降低重复处理带来的副作用；
 * 4) 提供 app -> agent 的发布通道, 业务侧只需调用 app.mqttPublish 即可。
 */
const mqtt = require('mqtt');

module.exports = (agent) => {
  // 读取配置：写死的 Broker 地址在 config/config.default.js 内( 可按需切换协议/端口 )
  const mqttConfig = agent.config && agent.config.mqtt ? agent.config.mqtt : {};
  if (mqttConfig.enabled === false) {
    agent.coreLogger.info('[mqtt] disabled by config.mqtt.enabled=false');
    return;
  }

  // 连接地址( 示例：mqtts://broker.emqx.io:8883 或 ws/wss/tcp )
  const url = mqttConfig.url;
  if (!url) {
    agent.coreLogger.warn('[mqtt] skipped: config.mqtt.url is empty');
    return;
  }

  // 连接参数：包含 clientId/用户名/密码/超时/重连等
  const options = Object.assign(
    {
      clientId: mqttConfig.clientId || `${agent.name}_${process.pid}_${Date.now()}`,
      username: mqttConfig.username,
      password: mqttConfig.password,
      clean: mqttConfig.clean !== false,
      keepalive: mqttConfig.keepalive == null ? 60 : mqttConfig.keepalive,
      reconnectPeriod: mqttConfig.reconnectPeriod == null ? 1000 : mqttConfig.reconnectPeriod,
      connectTimeout: mqttConfig.connectTimeout == null ? 30 * 1000 : mqttConfig.connectTimeout,
    },
    mqttConfig.options || {}
  );

  // 建立与 Broker 的连接
  const client = mqtt.connect(url, options);
  let heartbeatTimer = null; // 心跳定时器引用, 便于关闭

  // 连接成功后：订阅固定主题 + 启动心跳发布
  client.on('connect', () => {
    agent.coreLogger.info('[mqtt] connected to %s', url);
    const list = Array.isArray(mqttConfig.subscribe) ? mqttConfig.subscribe : [];
    if (list.length > 0) {
      const subs = list.map((item) => {
        if (typeof item === 'string') return { topic: item, qos: 0 };
        return { topic: item.topic, qos: item.qos == null ? 0 : item.qos };
      });
      subs.forEach((s) => {
        if (s && s.topic) {
          client.subscribe(s.topic, { qos: s.qos }, (err) => {
            if (err)
              agent.coreLogger.error('[mqtt] subscribe %s error: %s', s.topic, err && err.message);
            else agent.coreLogger.info('[mqtt] subscribed %s (qos=%s)', s.topic, s.qos);
          });
        }
      });
    }

    // 启动每 3 秒发送一次心跳的定时任务
    if (!heartbeatTimer) {
      // 心跳：每 3 秒向 honeySleepController/heartbeat 发送一次, 用于链路探活
      heartbeatTimer = setInterval(() => {
        const topic = 'honeySleepController/heartbeat';
        const payload = JSON.stringify({ ts: Date.now(), pid: process.pid });
        client.publish(topic, payload, { qos: 0 }, (err) => {
          if (err) agent.coreLogger.error('[mqtt] heartbeat publish error: %s', err && err.message);
        });
      }, 30000);
      // 不阻止进程退出
      heartbeatTimer.unref && heartbeatTimer.unref();
    }
  });

  client.on('reconnect', () => agent.coreLogger.warn('[mqtt] reconnecting...'));
  client.on('close', () => agent.coreLogger.warn('[mqtt] connection closed'));
  client.on('end', () => agent.coreLogger.warn('[mqtt] connection ended'));
  client.on('error', (err) =>
    agent.coreLogger.error('[mqtt] error: %s', (err && err.stack) || err)
  );

  // 收到任意已订阅主题消息：
  // - 传感器前缀 honeySleepSubscribeSensor/# 在 agent 直接打印
  // - 同时通过 messenger 转发给一个随机 worker 进行业务处理
  client.on('message', (topic, payload, packet) => {
    const msg = {
      topic,
      payload: Buffer.isBuffer(payload)
        ? payload.toString()
        : String(payload == null ? '' : payload),
      packet: {
        dup: packet && packet.dup,
        retain: packet && packet.retain,
        qos: packet && packet.qos,
      },
    };
    // 对传感器订阅前缀的消息在 agent 侧直接打印
    if (topic && topic.startsWith('honeySleepSubscribeSensor/')) {
      agent.coreLogger.info('[mqtt] sensor message topic=%s payload=%s', topic, msg.payload);
    }
    // deliver to one random worker to avoid duplicate processing by all workers
    agent.messenger.sendRandom('mqtt-message', msg);
  });

  // app -> agent 发布通道：业务侧通过 app.mqttPublish 发送到此, 由 agent 真正 publish
  agent.messenger.on('mqtt-publish', (data) => {
    try {
      if (!data || !data.topic) return;
      const topic = data.topic;
      const options = data.options || {};
      let message = data.message;
      if (message != null && typeof message !== 'string' && !Buffer.isBuffer(message)) {
        message = JSON.stringify(message);
      }
      client.publish(topic, message == null ? '' : message, options, (err) => {
        if (err) agent.coreLogger.error('[mqtt] publish %s error: %s', topic, err && err.message);
      });
    } catch (e) {
      agent.coreLogger.error('[mqtt] publish handler error: %s', (e && e.stack) || e);
    }
  });

  // 进程优雅退出：清理定时器并断开连接
  agent.beforeClose(async () => {
    try {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
      client.end(true);
      agent.coreLogger.info('[mqtt] client ended');
    } catch (e) {
      agent.coreLogger.error('[mqtt] end error: %s', (e && e.stack) || e);
    }
  });
};
