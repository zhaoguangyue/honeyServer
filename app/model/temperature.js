'use strict';

/**
 * 体温数据模型( SQLite / Sequelize )
 * 字段来自最新 Demand.md：
 * - id INTEGER PRIMARY KEY AUTOINCREMENT( 自增ID )
 * - device_id TEXT NOT NULL( 关联设备ID )
 * - timestamp DATETIME NOT NULL( 数据时间戳, 精确到秒 )
 * - body_temp REAL( 用户体温, ℃ )
 * @param {import('egg').Application} app Egg Application
 */
module.exports = (app) => {
  const { INTEGER, STRING, DATE, FLOAT } = app.Sequelize;

  const Temperature = app.model.define(
    'temperature',
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
      // 当前温度（MVP 用）
      current_temp: {
        type: FLOAT,
        allowNull: true,
        comment: '当前水毯温度( ℃ )',
      },
      // 夜间温度（预留）
      night_temp: {
        type: FLOAT,
        allowNull: true,
        comment: '夜间温度( ℃ ) 预留',
      },
      // 黎明温度（预留）
      dawn_temp: {
        type: FLOAT,
        allowNull: true,
        comment: '黎明温度( ℃ ) 预留',
      },
    },
    {
      tableName: 'temperature',
      freezeTableName: true,
      timestamps: false,
      comment: '水毯设备温度设置表',
      indexes: [{ fields: ['device_id', 'timestamp'] }],
    }
  );

  return Temperature;
};
