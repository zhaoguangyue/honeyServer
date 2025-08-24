/* eslint valid-jsdoc: "off" */

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */

const path = require('path');

module.exports = (appInfo) => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = (exports = {});

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1755920308235_3367';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  // 默认数据库配置
  config.sequelize = {
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database/app.sqlite'),
    define: {
      freezeTableName: true,
      timestamps: false,
    },
  };

  // 安全配置：对 /api/ 开头的接口关闭 CSRF 校验（便于纯后端 API 调用）
  config.security = Object.assign({}, config.security, {
    csrf: Object.assign({ enable: true }, (config.security && config.security.csrf) || {}, {
      ignore: (ctx) => ctx.path.startsWith('/api/'),
    }),
  });

  // MQTT config (agent maintains connection)
  config.mqtt = {
    // 写死公共 EMQX Broker, 默认走 TCP 1883
    enabled: true,
    url: 'mqtts://broker.emqx.io:8883',
    // 备用端点( 手动切换时可参考 )
    endpoints: {
      tcp: 'mqtt://broker.emqx.io:1883',
      ws: 'ws://broker.emqx.io:8083/mqtt',
      mqtt: 'mqtt://broker.emqx.io:1883',
      wss: 'wss://broker.emqx.io:8084/mqtt',
      // QUIC: mqtt.js 暂不支持, 仅作为端口参考 14567
    },
    username: process.env.MQTT_USERNAME || undefined,
    password: process.env.MQTT_PASSWORD || undefined,
    clientId: process.env.MQTT_CLIENT_ID || undefined,
    clean: process.env.MQTT_CLEAN !== 'false',
    keepalive: process.env.MQTT_KEEPALIVE ? Number(process.env.MQTT_KEEPALIVE) : 60,
    reconnectPeriod: process.env.MQTT_RECONNECT_PERIOD
      ? Number(process.env.MQTT_RECONNECT_PERIOD)
      : 1000,
    connectTimeout: process.env.MQTT_CONNECT_TIMEOUT
      ? Number(process.env.MQTT_CONNECT_TIMEOUT)
      : 30 * 1000,
    // 固定订阅的主题( 不受环境变量影响 )
    subscribe: [
      { topic: 'honeySleepController/#', qos: 0 },
      { topic: 'honeySleepSubscribeSensor/#', qos: 0 },
    ],
    options: {
      // set to 'false' to allow self-signed certs when using mqtts
      rejectUnauthorized: process.env.MQTT_TLS_REJECT_UNAUTHORIZED === 'false' ? false : undefined,
    },
  };

  return {
    ...config,
    ...userConfig,
  };
};
