// Imports

export default class AssetService {

  constructor () {
    // Do something here
  }

  getAssetLocation (asset) {
    const ret = eval(`asset.$state.${asset.$inventory.LocationField}`);
    return ret;
  }
  
  getAssetStyle (asset) {
    const style = asset.$inventory.MarkerStyle;
    let parsedStyle = null;
    if (!style) {
      parsedStyle = {
        path: 'CIRCLE',
        scale: 8,
        fillColor: '#444',
        fillOpacity: 1,
        strokeWeight: 0,
        strokeColor: '#444'
      };
    } else {
      parsedStyle = JSON.parse(style);
    }

    const ret = { ...parsedStyle };

    const conditions = asset.$conditions
      .filter(condition => this.verifyConditionMatch(asset, condition))
      .reverse()
      .map(condition => JSON.parse(condition.StyleOverrides))
      .reduce((total, item) => ({ ...total, ...item }), ret)

    return conditions;
  }

  getSensorValue (asset, sensor) {
    const value = eval(`asset.$state.${sensor.ValueField}`);
    return value;
  }

  verifyConditionMatch (asset, condition) {
    const state = asset.$state;
    const sensorList = asset.$sensors;
    const sensors = sensorList.map(item => {
      const { ValueField } = item;
      const value = eval(`state.${ValueField}`);
      
      return {
        key: item.SensorName,
        value
      };
    }).reduce((total, item) => {
      total[item.key] = item.value;
      return total;
    }, {});

    let expressionString = condition.ConditionExpression;
    Object.keys(sensors).forEach(sensor => {
      expressionString = expressionString.replace(new RegExp(sensor, 'ig'), `sensors.${sensor}`);
    });

    const value = eval(expressionString);
    const matches = !!value;

    return matches;
  }

  static getInstance () {
    if (!AssetService._instance) AssetService._instance = new AssetService()
    return AssetService._instance
  }
}
