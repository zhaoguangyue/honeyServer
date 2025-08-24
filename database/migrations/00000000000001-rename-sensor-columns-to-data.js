'use strict';

/**
 * 将 hr/rr/snore/motion 四张表的数值列统一重命名为 data
 * - hr.hr -> hr.data (INTEGER)
 * - rr.rr -> rr.data (INTEGER)
 * - snore.snore -> snore.data (FLOAT)
 * - motion.motion -> motion.data (FLOAT)
 */
module.exports = {
  /*
   * @param {import('sequelize').QueryInterface} queryInterface
   * @param {typeof import('sequelize')} Sequelize
   */
  async up(queryInterface) {
    // SQLite 从 3.25 起支持 RENAME COLUMN；sequelize-cli 会直接生成 ALTER TABLE ... RENAME COLUMN 语句
    // 逐表执行重命名，若列已存在则跳过
    const renameSafe = async (table, from, to) => {
      const desc = await queryInterface.describeTable(table);
      if (desc[to]) return; // 已经是目标列
      if (!desc[from]) return; // 源列不存在，跳过
      await queryInterface.renameColumn(table, from, to);
    };

    await renameSafe('hr', 'hr', 'data');
    await renameSafe('rr', 'rr', 'data');
    await renameSafe('snore', 'snore', 'data');
    await renameSafe('motion', 'motion', 'data');
  },

  async down(queryInterface) {
    const renameSafe = async (table, from, to) => {
      const desc = await queryInterface.describeTable(table);
      if (desc[to]) return; // 已经是目标列
      if (!desc[from]) return; // 源列不存在，跳过
      await queryInterface.renameColumn(table, from, to);
    };

    await renameSafe('hr', 'data', 'hr');
    await renameSafe('rr', 'data', 'rr');
    await renameSafe('snore', 'data', 'snore');
    await renameSafe('motion', 'data', 'motion');
  },
};


