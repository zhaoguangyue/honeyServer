'use strict';

module.exports = {
  async up(queryInterface) {
    // 更新 device 表中指定设备的 user_id
    await queryInterface.bulkUpdate(
      'device',
      {
        user_id: 'user-0001',
      },
      {
        id: 'device-0001',
      }
    );
  },

  async down(queryInterface) {
    // 回滚操作：将该设备的 user_id 设置为 null
    await queryInterface.bulkUpdate(
      'device',
      {
        user_id: null,
      },
      {
        id: 'device-0001',
      }
    );
  },
};
