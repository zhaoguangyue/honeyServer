'use strict';

/**
 * 日志模型( SQLite / Sequelize )
 * 字段定义：
 * - id INTEGER PRIMARY KEY AUTOINCREMENT( 自增ID )
 * - device_id TEXT NOT NULL( 关联设备ID )
 * - event_type TEXT NOT NULL( 事件类型 )
 * - event_data TEXT( 事件数据 )
 * - created_at DATETIME DEFAULT CURRENT_TIMESTAMP( 事件时间 )
 * @param {import('egg').Application} app Egg Application
 */
module.exports = (app) => {
  const { INTEGER, STRING, TEXT, DATE } = app.Sequelize;

  const Log = app.model.define(
    'log',
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
      event_type: {
        type: STRING(32),
        allowNull: false,
        comment: '事件类型',
      },
      event_data: {
        type: TEXT,
        allowNull: true,
        comment: '事件数据(JSON格式)',
      },
      created_at: {
        type: DATE,
        allowNull: false,
        defaultValue: app.Sequelize.NOW,
        comment: '事件时间',
      },
    },
    {
      tableName: 'log',
      freezeTableName: true,
      timestamps: false,
      comment: '设备日志表',
      indexes: [{ fields: ['device_id'] }, { fields: ['created_at'] }, { fields: ['event_type'] }],
    }
  );

  return Log;
};
