'use strict';

/**
 * 用户模型( SQLite / Sequelize )
 * 字段来自最新 Demand.md：
 * - id TEXT PRIMARY KEY( 用户唯一ID, 如 UUID )
 * - email TEXT UNIQUE NOT NULL( 登录邮箱 )
 * - password_hash TEXT NOT NULL( 加密后的密码 )
 * - name TEXT( 用户昵称, 可选 )
 * - phone TEXT( 手机号, 可选 )
 * - avatar_url TEXT( 头像 URL, 可选 )
 * - created_at DATETIME DEFAULT CURRENT_TIMESTAMP( 注册时间 )
 * - last_login DATETIME( 最后登录时间, 可选 )
 * - is_active BOOLEAN DEFAULT 1( 账号状态：1=启用, 0=禁用 )
 * @param {import('egg').Application} app Egg Application
 */
module.exports = (app) => {
  const { STRING, TEXT, BOOLEAN, DATE } = app.Sequelize;

  const User = app.model.define(
    'user',
    {
      id: {
        type: STRING(64),
        allowNull: false,
        primaryKey: true,
        comment: '用户唯一ID( 如UUID )',
      },
      email: {
        type: STRING(255),
        allowNull: false,
        unique: true,
        comment: '登录邮箱',
      },
      password_hash: {
        type: TEXT,
        allowNull: false,
        comment: '加密后的密码( argon2/bcrypt )',
      },
      name: {
        type: STRING(255),
        allowNull: true,
        comment: '用户昵称',
      },
      phone: {
        type: STRING(32),
        allowNull: true,
        comment: '手机号( 可选 )',
      },
      avatar_url: {
        type: STRING(512),
        allowNull: true,
        comment: '头像URL',
      },
      created_at: {
        type: DATE,
        allowNull: false,
        defaultValue: app.Sequelize.NOW,
        comment: '注册时间',
      },
      last_login: {
        type: DATE,
        allowNull: true,
        comment: '最后登录时间',
      },
      is_active: {
        type: BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: '账号状态(1=启用, 0=禁用)',
      },
      token: {
        type: STRING(512),
        allowNull: true,
        comment: '登录令牌',
      },
    },
    {
      tableName: 'user',
      freezeTableName: true, // 避免自动复数
      timestamps: false, // 使用显式 created_at/last_login 字段
      comment: '用户表',
      // email 字段已在列定义中设置了 unique
    }
  );

  // 设置模型关联关系
  User.associate = function () {
    // 用户可以拥有多个设备
    app.model.User.hasMany(app.model.Device, {
      foreignKey: 'user_id',
      as: 'devices',
    });
  };

  return User;
};
