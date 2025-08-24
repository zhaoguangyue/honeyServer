'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // 创建示例用户
    await queryInterface.bulkInsert('user', [
      {
        id: 'user-0001',
        name: 'honey',
        email: 'honeysleep@honey.com',
        password_hash: 'asdf1234',
        phone: '18888888888',
        is_active: true,
        created_at: now,
      },
    ]);

    // 创建示例设备
    await queryInterface.bulkInsert('device', [
      {
        id: 'device-0001',
        name: '智能水毯',
        is_online: false,
        power_status: false,
        created_at: now,
        user_id: 'user-0001',
      },
    ]);
  },

  async down(queryInterface) {
    // 回滚操作：按照相反顺序删除数据
    await queryInterface.bulkDelete('device', { id: 'device-0001' });
    await queryInterface.bulkDelete('user', { id: 'user-0001' });
  },
};
