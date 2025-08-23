'use strict';

const path = require('path');

// 极简静态配置：按环境指定 sqlite 存储路径，可用环境变量覆盖生产路径
const define = { freezeTableName: true, timestamps: false };
const commonConfig = {
	dialect: 'sqlite',
	define,
	logging: false,
}

module.exports = {
  development: {
    ...commonConfig,
    storage: path.join(__dirname, 'app.sqlite'),
  },
  production: {
    ...commonConfig,
    storage: '/var/lib/honey/app.sqlite',
  },
};

