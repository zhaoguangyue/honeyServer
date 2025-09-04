'use strict';

/**
 * MQTT原始数据模型( SQLite / Sequelize )
 * 用于存储从MQTT发送过来的传感器原始数据
 * 字段：
 * - id INTEGER PRIMARY KEY AUTOINCREMENT( 自增ID )
 * - device_id TEXT NOT NULL( 关联设备ID )
 * - timestamp DATETIME NOT NULL( 数据时间戳, 精确到秒 )
 * - raw_data TEXT( 原始数据，144个字节的数组字符串 )
 * - created_at DATETIME( 记录创建时间 )
 * @param {import('egg').Application} app Egg Application
 */
module.exports = (app) => {
  const { INTEGER, STRING, DATE, TEXT } = app.Sequelize;

  const Metric = app.model.define(
    'metric',
    {
      id: {
        type: INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true,
        comment: '自增ID',
      },
      device_id: {
        type: STRING(64),
        allowNull: false,
        comment: '关联设备ID',
        references: { model: 'device', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      timestamp: {
        type: DATE,
        allowNull: false,
        comment: '数据时间戳( 精确到秒 )',
      },
      raw_data: {
        type: TEXT,
        allowNull: true,
        comment: '原始数据，144个字节的数组字符串',
      },
      created_at: {
        type: DATE,
        allowNull: false,
        defaultValue: app.Sequelize.NOW,
        comment: '记录创建时间',
      },
    },
    {
      tableName: 'metric',
      freezeTableName: true,
      timestamps: false,
      comment: 'MQTT原始数据表',
      indexes: [
        { fields: ['device_id', 'timestamp'] },
        { fields: ['created_at'] }
      ],
    }
  );

  return Metric;
};