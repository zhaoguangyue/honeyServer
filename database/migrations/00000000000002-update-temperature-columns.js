'use strict';

/**
 * temperature 表结构调整：
 * - 将 body_temp 重命名为 current_temp
 * - 新增 night_temp、dawn_temp（允许为空，MVP 预留）
 */
module.exports = {
  /*
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {typeof import('sequelize')} Sequelize
   */
  async up(queryInterface, Sequelize) {
    const { FLOAT } = Sequelize;

    const desc = await queryInterface.describeTable('temperature');
    // 重命名 body_temp -> current_temp（若已存在则跳过）
    if (desc.body_temp && !desc.current_temp) {
      await queryInterface.renameColumn('temperature', 'body_temp', 'current_temp');
    }

    // 新增预留列 night_temp / dawn_temp
    const addIfMissing = async (column, type) => {
      const d = await queryInterface.describeTable('temperature');
      if (!d[column]) {
        await queryInterface.addColumn('temperature', column, { type, allowNull: true, comment: column === 'night_temp' ? '夜间温度( ℃ ) 预留' : '黎明温度( ℃ ) 预留' });
      }
    };
    await addIfMissing('night_temp', FLOAT);
    await addIfMissing('dawn_temp', FLOAT);
  },

  async down(queryInterface, ) {
    const desc = await queryInterface.describeTable('temperature');
    // 回滚列名 current_temp -> body_temp
    if (desc.current_temp && !desc.body_temp) {
      await queryInterface.renameColumn('temperature', 'current_temp', 'body_temp');
    }
    // 移除预留列
    const removeIfExists = async (column) => {
      const d = await queryInterface.describeTable('temperature');
      if (d[column]) {
        await queryInterface.removeColumn('temperature', column);
      }
    };
    await removeIfExists('night_temp');
    await removeIfExists('dawn_temp');
  },
};


