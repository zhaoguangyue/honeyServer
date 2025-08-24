/**
 * @param {Egg.Application} app - egg application
 */
module.exports = (app) => {
  const { router, controller } = app;
  router.get('/', controller.home.index);

  // Auth
  router.post('/api/login', controller.user.login);

  // Users CRUD (需要登录)
  // const auth = middleware.auth();
  router.post('/api/users/get', controller.user.get);
  router.post('/api/users/create', controller.user.create);
  router.post('/api/users/update', controller.user.update);
  router.post('/api/users/delete', controller.user.destroy);

  // Devices CRUD (需要登录)
  router.get('/api/devices/list', controller.device.index);
  router.post('/api/devices/get', controller.device.show);
  router.post('/api/devices/create', controller.device.create);
  router.post('/api/devices/update', controller.device.update);
  router.post('/api/devices/delete', controller.device.destroy);

  // 对设备进行开关控制
  router.post('/api/devices/set-power', controller.device.setPower);
  // 对设备进行温度控制
  router.post('/api/devices/set-temperature', controller.device.setTemperature);

  // // 传感器指标处理，查询和写入
  // // 单条写入: POST /api/metrics/insert  body={ model, device_id, timestamp, value|field }
  // router.post('/api/metrics/insert', controller.metrics.insertOne);
  // // 批量写入: POST /api/metrics/bulk body={ model, rows: [...] }
  // router.post('/api/metrics/bulk', controller.metrics.bulkInsert);
  // 区间查询: POST /api/metrics/query body={ model, device_id, start, end, limit, order }
  router.post('/api/metrics/query', controller.metrics.queryMetricsRange);
};
