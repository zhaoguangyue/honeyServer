'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
    await queryInterface.bulkInsert('user', [
      {
        id: 'user-0001',
        name: 'honey',
        email: 'honeysleep@honey.com',
        is_active: true,
        password: 'asdf1234', // 注意：在实际生产环境中，密码应该被加密存储
        phone: '18888888888',
        created_at: now,
        updated_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('user', { id: 'user-0001' });
  },
};
