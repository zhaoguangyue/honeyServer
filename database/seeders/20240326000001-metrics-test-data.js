'use strict';

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const startTime = dayjs.utc('2025-08-24 17:52:58.000Z');
    const hrData = [];
    const snoreData = [];
    const rrData = [];
    let currentValue = 136;
    let increasing = true;

    // 生成20条数据
    for (let i = 0; i < 20; i++) {
      // 计算时间：每次增加1分钟
      const timestamp = startTime.add(i, 'minute').format('YYYY-MM-DD HH:mm:ss.SSS [+00:00]');

      // HR数据：136-140递增再135-140递增
      hrData.push({
        device_id: 'device-0001',
        timestamp,
        data: currentValue,
      });

      // 更新心率值
      if (increasing) {
        currentValue++;
        if (currentValue >= 140) {
          increasing = false;
        }
      } else {
        currentValue--;
        if (currentValue <= 135) {
          increasing = true;
        }
      }

      // Snore数据：随机0或1
      snoreData.push({
        device_id: 'device-0001',
        timestamp,
        data: Math.round(Math.random()),
      });

      // RR数据：全是0
      rrData.push({
        device_id: 'device-0001',
        timestamp,
        data: 0,
      });
    }

    // 批量插入数据
    await queryInterface.bulkInsert('hr', hrData, {});
    await queryInterface.bulkInsert('snore', snoreData, {});
    await queryInterface.bulkInsert('rr', rrData, {});
  },

  async down(queryInterface, Sequelize) {
    const startTime = dayjs.utc('2025-08-24 17:52:58.000Z');
    const endTime = startTime.add(20, 'minute').format('YYYY-MM-DD HH:mm:ss.SSS [+00:00]');

    // 删除指定时间范围内的所有数据
    const where = {
      timestamp: {
        [Sequelize.Op.between]: [
          startTime.format('YYYY-MM-DD HH:mm:ss.SSS [+00:00]'),
          endTime,
        ],
      },
    };

    await queryInterface.bulkDelete('hr', where);
    await queryInterface.bulkDelete('snore', where);
    await queryInterface.bulkDelete('rr', where);
  },
};
