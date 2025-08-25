'use strict';

/**
 * 呼吸频率数据模型( SQLite / Sequelize )
 * 字段来自最新 Demand.md：
 * - id INTEGER PRIMARY KEY AUTOINCREMENT( 自增ID )
 * - device_id TEXT NOT NULL( 关联设备ID )
 * - timestamp DATETIME NOT NULL( 数据时间戳, 精确到秒 )
 * - rr INTEGER( CHECK rr>5 AND rr<40 )
 * @param {import('egg').Application} app Egg Application
 */
module.exports = (app) => {
  const { INTEGER, STRING, DATE } = app.Sequelize;

  const RR = app.model.define(
    'rr',
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
        type: INTEGER,
        allowNull: true,
        validate: { min: 0, max: 1000 },
        comment: '呼吸频率( 次/分钟 ), 范围(0,100)',
      },
    },
    {
      tableName: 'rr',
      freezeTableName: true,
      timestamps: false,
      comment: '呼吸频率数据表',
      indexes: [{ fields: ['device_id', 'timestamp'] }],
    }
  );

  return RR;
};
