# honeyServer

mvp版本

## QuickStart

### Development

```bash
npm i
npm run dev
open http://localhost:7001/
```

### Deploy

```bash
npm start
npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.

### 数据迁移( Sequelize CLI )

本项目使用迁移管理。

常用命令：

```bash
# 执行迁移（根据 NODE_ENV 选择数据库，默认使用 database/app.sqlite）
npm run db:migrate

# 回滚最近一次迁移
npm run db:migrate:undo

# 回滚所有迁移 //先备份否则会清楚全部数据
npm run db:migrate:undo:all

# 执行所有 seed
npm run db:seed

# 回滚所有 seed
npm run db:seed:undo
```

注意：
- 迁移配置位于 `database/config.js`，SQLite 存储文件为 `database/app.sqlite`；生产环境为 `var/lib/honey/app.sqlite'`。
- 初始迁移位于 `database/migrations/00000000000000-initial-schema.js`。
- 如需修改表结构，请新增迁移文件而非直接修改模型并依赖运行时同步。

[egg]: https://eggjs.org

## MQTT 接入
通过 agent 维护单例 MQTT 连接, 应用通过 `app.messenger` 与 agent 交互, 避免多进程重复连接。
环境变量：

- `MQTT_URL` 必填, 如 `mqtt://127.0.0.1:1883` 或 `mqtts://host:8883`
- `MQTT_USERNAME` 可选
- `MQTT_PASSWORD` 可选
- `MQTT_CLIENT_ID` 可选
- `MQTT_SUBSCRIBE_TOPICS` 逗号分隔订阅列表, 如 `a/+,b/c`
- `MQTT_ENABLED` 设为 `false` 可关闭




```
app.on('mqtt-message', (data) => {
  // data: { topic, payload, packet: { qos, retain, dup } }
});
```

### 集成流程( 重要 )

1. agent( 根目录 `agent.js` )
   - 仅在 agent 进程建立 MQTT 长连接, 避免多个 worker 重复连接和重复消费；
   - 固定订阅主题：`honeySleepController/#`( 用于发布 )与 `honeySleepSubscribeSensor/#`( 用于接收 )；
   - 每 30 秒向 `honeySleepController/heartbeat` 发布心跳消息；
   - 将收到的任意消息( 特别是 `honeySleepSubscribeSensor/#` )打印, 并通过 `agent.messenger.sendRandom('mqtt-message', data)` 转发给一个 worker；
   - 在 `beforeClose` 钩子中清理定时器和断开连接。

2. app( 根目录 `app.js` )
   - 监听 `mqtt-message`, 打印主题与基础元信息；
   - 通过 `app.emit('mqtt-message', data)` 将消息广播给应用内其他订阅者；
   - 提供 `app.mqttPublish(topic, message, options)` 代理方法, 业务方可直接发布。

3. application 扩展( `app/extend/application.js` )
   - 实现 `app.mqttPublish`, 将发布请求通过 `app.messenger.sendToAgent` 转交给 agent 统一发布, 避免 worker 直连 Broker。

4. 配置( `config/config.default.js` )
   - 写死公共 EMQX Broker 端点( 可按需修改为 TCP/WS/TLS/WSS )；
   - 固定订阅 `honeySleepController/#` 与 `honeySleepSubscribeSensor/#`；
   - 可选通过环境变量调整超时、keepalive、重连等参数。




# 部署
登录云服务器
云服务器密码：honeySleep123】

如果服务异常，删除所有
pm2 delete all
查找端口
netstat -tlnp | grep :7001
杀掉
kill -9 189072

1. 找到egg进程并杀掉
pgrep -f 'egg-scripts start' | xargs kill -9

2. 项目在/opt下
使用git pull origin master 拉最新代码

3. 安装生产依赖（跳过开发依赖）
npm install

4. 运行数据库迁移等前置操作（如果有）
npm run db:migrate

# 5. 启动应用
npm run start


sqlite3 /var/lib/honey/app.sqlite "SELECT * FROM device;"