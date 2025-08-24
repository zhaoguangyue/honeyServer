'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();

    // 先创建用户
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

    // 再创建设备
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
    // 删除设备和用户（注意顺序：先删除引用，再删除被引用）
    await queryInterface.bulkDelete('device', { id: 'device-0001' });
    await queryInterface.bulkDelete('user', { id: 'user-0001' });
  },
};