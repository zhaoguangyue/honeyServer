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
        password_hash: 'asdf1234',
        phone: '18888888888',
        created_at: now,
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('user', { id: 'user-0001' });
  },
};
