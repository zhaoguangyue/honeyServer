'use strict';

module.exports = {
  async up(queryInterface) {
    const now = new Date();
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
    await queryInterface.bulkDelete('device', { id: 'device-0001' });
  },
};


