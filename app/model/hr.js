'use strict';

/**
 * 实时心率数据模型( SQLite / Sequelize )
 * 字段来自最新 Demand.md：
 * - id INTEGER PRIMARY KEY AUTOINCREMENT( 自增ID )
 * - device_id TEXT NOT NULL( 关联设备ID )
 * - timestamp DATETIME NOT NULL( 数据时间戳, 精确到秒 )
 * - hr INTEGER( CHECK hr>30 AND hr<200 )
 * @param {import('egg').Application} app Egg Application
 */
module.exports = (app) => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const HR = app.model.define(
    'hr',
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
      hr: {
        type: INTEGER,
        allowNull: true,
        validate: { min: 31, max: 199 },
        comment: '实时心率( 次/分钟 ), 范围(30,200)',
      },
    },
    {
      tableName: 'hr',
      freezeTableName: true,
      timestamps: false,
      comment: '实时心率数据表',
      indexes: [{ fields: ['device_id', 'timestamp'] }],
    }
  );

  return HR;
};
