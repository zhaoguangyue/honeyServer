'use strict';

/**
 * 体动数据模型( SQLite / Sequelize )
 * 字段来自最新 Demand.md：
 * - id INTEGER PRIMARY KEY AUTOINCREMENT( 自增ID )
 * - device_id TEXT NOT NULL( 关联设备ID )
 * - timestamp DATETIME NOT NULL( 数据时间戳, 精确到秒 )
 * - motion REAL( 体动强度 0-1.0 )
 * @param {import('egg').Application} app Egg Application
 */
module.exports = (app) => {
  const { INTEGER, STRING, DATE, FLOAT } = app.Sequelize;

  const Motion = app.model.define(
    'motion',
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
      data: {
        type: FLOAT,
        allowNull: true,
        comment: '体动强度( 0-1.0, 0=静止 )',
      },
    },
    {
      tableName: 'motion',
      freezeTableName: true, // 避免自动复数
      timestamps: false,
      comment: '体动数据表',
      indexes: [{ fields: ['device_id', 'timestamp'] }],
    }
  );

  return Motion;
};
