// config/config.prod.js
const path = require('path');

module.exports = () => {
  const config = (exports = {});

  config.sequelize = {
    dialect: 'sqlite',
    storage: path.join(__dirname, '../database/app.sqlite'),
    // timezone: '+08:00',
    define: {
      freezeTableName: true,
      timestamps: false,
    },
  };

  return config;
};
