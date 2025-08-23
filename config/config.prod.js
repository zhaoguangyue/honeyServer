module.exports = () => {
  const config = (exports = {});

  config.sequelize = {
    dialect: 'sqlite',
    storage: '/var/lib/honey/app.sqlite',
  };

  return config;
};
