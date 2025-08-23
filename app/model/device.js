'use strict';

/**
 * 设备模型( SQLite / Sequelize )
 * 字段来自 Demand.md：
 * - id TEXT PRIMARY KEY
 * - name TEXT DEFAULT '智能水毯'
 * - is_online BOOLEAN DEFAULT 0
 * - power_status BOOLEAN DEFAULT 0
 * - created_at DATETIME DEFAULT CURRENT_TIMESTAMP
 * @param {import('egg').Application} app Egg Application
 */
module.exports = (app) => {
  const { STRING, BOOLEAN, DATE } = app.Sequelize;

  const Device = app.model.define(
    'device',
    {
      id: {
        type: STRING(64),
        allowNull: false,
        primaryKey: true,
        comment: '设备唯一ID( MAC地址或SN码 )',
      },
      name: {
        type: STRING(255),
        allowNull: false,
        defaultValue: '智能水毯',
        comment: '用户自定义设备名称',
      },
      is_online: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '在线状态( 0=离线, 1=在线 )',
      },
      power_status: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: '电源状态( 0=关机, 1=开机 )',
      },
      created_at: {
        type: DATE,
        allowNull: false,
        defaultValue: app.Sequelize.NOW,
        comment: '设备注册时间',
      },
      user_id: {
        type: STRING(64),
        allowNull: true,
        comment: '所属用户ID',
        references: {
          model: 'user',
          key: 'id',
        },
      },
    },
    {
      tableName: 'device',
      freezeTableName: true, // 避免复数表名
      timestamps: false, // 已显式包含 created_at 字段
      comment: '设备表',
    }
  );

  // 设置模型关联关系
  Device.associate = function () {
    // 设备属于某个用户
    app.model.Device.belongsTo(app.model.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  };

  return Device;
};
