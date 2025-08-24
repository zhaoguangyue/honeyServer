module.exports = () => {
  const config = (exports = {});

  config.sequelize = {
    dialect: 'sqlite',
    storage: '/var/lib/honey/app.sqlite',
    define: {
      freezeTableName: true,
      timestamps: false,
    },
    logging: (...args) => {
      console.log('SQL Query:', ...args);
      console.log('Stack:', new Error().stack);
    },
  };

  return config;
};
