/*
 * 应用( worker )启动钩子：
 * - 接收 agent 转发的 MQTT 消息并打印关键信息；
 * - 通过 app.emit 将消息广播给应用内其它监听者( 如 service/controller 等 )；
 * - 提供 app.mqttPublish(topic, message, options) 代理, 业务侧无需感知 agent。
 */
module.exports = (app) => {
  app.coreLogger.info('[app] app.js initialized');
  // 从 agent 接收 MQTT 消息
  app.messenger.on('mqtt-message', (data) => {
    app.coreLogger.info(
      '[mqtt] message topic=%s qos=%s retain=%s',
      data && data.topic,
      data && data.packet && data.packet.qos,
      data && data.packet && data.packet.retain
    );
    app.emit('mqtt-message', data);
  });

  // 提供发布代理
  app.mqttPublish = (topic, message, options) => {
    app.messenger.sendToAgent('mqtt-publish', { topic, message, options });
  };
};
