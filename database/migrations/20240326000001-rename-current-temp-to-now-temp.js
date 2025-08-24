'use strict';

/**
 * temperature 表结构调整：
 * - 将 current_temp 重命名为 now_temp
 */
module.exports = {
  /*
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {typeof import('sequelize')} Sequelize
   */
  async up(queryInterface) {
    const desc = await queryInterface.describeTable('temperature');
    // 重命名 current_temp -> now_temp（若已存在则跳过）
    if (desc.current_temp && !desc.now_temp) {
      await queryInterface.renameColumn('temperature', 'current_temp', 'now_temp');
    }
  },

  async down(queryInterface) {
    const desc = await queryInterface.describeTable('temperature');
    // 回滚列名 now_temp -> current_temp
    if (desc.now_temp && !desc.current_temp) {
      await queryInterface.renameColumn('temperature', 'now_temp', 'current_temp');
    }
  },
};
