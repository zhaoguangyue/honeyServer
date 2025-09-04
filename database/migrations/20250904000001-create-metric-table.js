'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { STRING, TEXT, DATE, INTEGER } = Sequelize;

    // metric - MQTT原始数据表
    await queryInterface.createTable('metric', {
      id: { 
        type: INTEGER, 
        allowNull: false, 
        primaryKey: true, 
        autoIncrement: true,
        comment: '自增ID'
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
        comment: '数据时间戳( 精确到秒 )'
      },
      raw_data: { 
        type: TEXT, 
        allowNull: true,
        comment: '原始数据，144个字节的数组字符串'
      },
      created_at: { 
        type: DATE, 
        allowNull: false, 
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: '记录创建时间'
      },
    });

    // 添加索引
    await queryInterface.addIndex('metric', ['device_id', 'timestamp']);
    await queryInterface.addIndex('metric', ['created_at']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('metric', ['created_at']).catch(() => {});
    await queryInterface.removeIndex('metric', ['device_id', 'timestamp']).catch(() => {});
    await queryInterface.dropTable('metric');
  },
};