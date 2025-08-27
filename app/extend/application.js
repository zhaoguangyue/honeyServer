/*
 * 扩展 Application：
 * 提供 app.mqttPublish 便捷方法, 将发布请求通过 messenger 转发至 agent, 由 agent 真正 publish。
 */
module.exports = {
  /**
   * 发布 MQTT 消息( 通过 agent 通道 )
   * @param {string} topic 目标主题, 例如 'deviceCommand/command'
   * @param {any} message 消息体, 非字符串将自动 JSON.stringify
   * @param {object} [options] 发布选项( 如 { qos: 1, retain: false } )
   */
  mqttPublish(topic, message, options) {
    this.messenger.sendToAgent('mqtt-publish', { topic, message, options });
  },
};
