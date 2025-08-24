'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { STRING, TEXT, BOOLEAN, DATE, INTEGER, FLOAT } = Sequelize;

    // user
    await queryInterface.createTable('user', {
      id: { type: STRING(64), allowNull: false, primaryKey: true },
      email: { type: STRING(255), allowNull: false, unique: true },
      password_hash: { type: TEXT, allowNull: false },
      name: { type: STRING(255), allowNull: true },
      phone: { type: STRING(32), allowNull: true },
      avatar_url: { type: STRING(512), allowNull: true },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      last_login: { type: DATE, allowNull: true },
      is_active: { type: BOOLEAN, allowNull: false, defaultValue: true },
      token: { type: STRING(512), allowNull: true },
    });

    // device
    await queryInterface.createTable('device', {
      id: { type: STRING(64), allowNull: false, primaryKey: true },
      name: { type: STRING(255), allowNull: false, defaultValue: '智能水毯' },
      is_online: { type: BOOLEAN, allowNull: false, defaultValue: false },
      power_status: { type: BOOLEAN, allowNull: false, defaultValue: false },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
      user_id: {
        type: STRING(64),
        allowNull: true,
        references: {
          model: 'user',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
    });

    // hr
    await queryInterface.createTable('hr', {
      id: { type: INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
      device_id: {
        type: STRING(64),
        allowNull: false,
        references: { model: 'device', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      timestamp: { type: DATE, allowNull: false },
      hr: { type: INTEGER, allowNull: true },
    });
    await queryInterface.addIndex('hr', ['device_id', 'timestamp']);

    // rr
    await queryInterface.createTable('rr', {
      id: { type: INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
      device_id: {
        type: STRING(64),
        allowNull: false,
        references: { model: 'device', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      timestamp: { type: DATE, allowNull: false },
      rr: { type: INTEGER, allowNull: true },
    });
    await queryInterface.addIndex('rr', ['device_id', 'timestamp']);

    // motion
    await queryInterface.createTable('motion', {
      id: { type: INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
      device_id: {
        type: STRING(64),
        allowNull: false,
        references: { model: 'device', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      timestamp: { type: DATE, allowNull: false },
      motion: { type: FLOAT, allowNull: true },
    });
    await queryInterface.addIndex('motion', ['device_id', 'timestamp']);

    // temperature
    await queryInterface.createTable('temperature', {
      id: { type: INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
      device_id: {
        type: STRING(64),
        allowNull: false,
        references: { model: 'device', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      timestamp: { type: DATE, allowNull: false },
      body_temp: { type: FLOAT, allowNull: true },
    });
    await queryInterface.addIndex('temperature', ['device_id', 'timestamp']);

    // snore
    await queryInterface.createTable('snore', {
      id: { type: INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
      device_id: {
        type: STRING(64),
        allowNull: false,
        references: { model: 'device', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      timestamp: { type: DATE, allowNull: false },
      snore: { type: FLOAT, allowNull: true },
    });
    await queryInterface.addIndex('snore', ['device_id', 'timestamp']);

    // log
    await queryInterface.createTable('log', {
      id: { type: INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
      device_id: {
        type: STRING(64),
        allowNull: false,
        references: { model: 'device', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      event_type: { type: STRING(32), allowNull: false },
      event_data: { type: TEXT, allowNull: true },
      created_at: { type: DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    });
    await queryInterface.addIndex('log', ['device_id']);
    await queryInterface.addIndex('log', ['created_at']);
    await queryInterface.addIndex('log', ['event_type']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('log', ['event_type']).catch(() => {});
    await queryInterface.removeIndex('log', ['created_at']).catch(() => {});
    await queryInterface.removeIndex('log', ['device_id']).catch(() => {});
    await queryInterface.dropTable('log');

    await queryInterface.removeIndex('snore', ['device_id', 'timestamp']).catch(() => {});
    await queryInterface.dropTable('snore');

    await queryInterface.removeIndex('temperature', ['device_id', 'timestamp']).catch(() => {});
    await queryInterface.dropTable('temperature');

    await queryInterface.removeIndex('motion', ['device_id', 'timestamp']).catch(() => {});
    await queryInterface.dropTable('motion');

    await queryInterface.removeIndex('rr', ['device_id', 'timestamp']).catch(() => {});
    await queryInterface.dropTable('rr');

    await queryInterface.removeIndex('hr', ['device_id', 'timestamp']).catch(() => {});
    await queryInterface.dropTable('hr');

    await queryInterface.dropTable('device');
    await queryInterface.dropTable('user');
  },
};


