'use strict';

/**
 * 打鼾强度数据模型( SQLite / Sequelize )
 * 字段来自 Demand.md：
 * - id INTEGER PRIMARY KEY AUTOINCREMENT( 自增ID )
 * - device_id TEXT NOT NULL( 关联设备ID )
 * - timestamp DATETIME NOT NULL( 数据时间戳, 精确到秒 )
 * - snore REAL( 打鼾强度 0-1.0, 0=无鼾声 )
 * @param {import('egg').Application} app Egg Application
 */
module.exports = (app) => {
  const { INTEGER, STRING, DATE, FLOAT } = app.Sequelize;

  const Snore = app.model.define(
    'snore',
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
      snore: {
        type: FLOAT,
        allowNull: true,
        comment: '打鼾强度( 0-1.0, 0=无鼾声 )',
      },
    },
    {
      tableName: 'snore',
      freezeTableName: true,
      timestamps: false,
      comment: '打鼾强度数据表',
      indexes: [{ fields: ['device_id', 'timestamp'] }],
    }
  );

  return Snore;
};
