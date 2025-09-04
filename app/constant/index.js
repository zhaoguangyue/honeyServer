const OPERATE_TYPE = {
  SetPower: 1,
  SetTemperature: 2,
};

const TOPIC = {
  DeviceCommand: 'deviceCommand',
  ReportMetric: 'reportMetric',
  RawData: 'reportMetric/rawdata'
};

module.exports = {
  OPERATE_TYPE,
  TOPIC,
};
