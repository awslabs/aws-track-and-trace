
export default class FrameworkService {

  constructor() {
    this.data = {
      alerts: []
    }
  }

  getData() {
    return this.data;
  }

  addAlert(rawType, message) {
    const type = `alert-${rawType}`;
    this.data.alerts.push({
      type, message
    });
  }

  static getInstance() {
    if (!FrameworkService._instance) FrameworkService._instance = new FrameworkService();
    return FrameworkService._instance;
  }
}
