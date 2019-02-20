<template>
  <div class="vehicle-status" v-if="vehicle && vehicleStatus">
    <div class="block-header">
      <h2 class="block-title">Vehicle information</h2>
    </div>
    <div class="status-items block-content block-content-full subscriptions">
      <div class="row">
        <div class="col">
          <div class="block block-rounded">
            <table class="table table-bordered table-striped">
              <thead>
                <tr role="row">
                  <th>Attribute name</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>VIN</td>
                  <td>{{ vehicle.vin }}</td>
                </tr>
                <tr>
                  <td>Brand</td>
                  <td>{{ vehicle.Brand }}</td>
                </tr>
                <tr>
                  <td>Model</td>
                  <td>{{ vehicle.Model }}</td>
                </tr>
                <tr>
                  <td>Year</td>
                  <td>{{ vehicle.Year }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="col">
          <div class="row">
            <div class="col-6">
              <div class="block block-rounded">
                <div class="block-header">
                  <h3 class="block-title">
                    <i class="fas fa-car-battery"></i>
                    Battery level
                  </h3>
                  <div class="block-options">
                    
                  </div>
                </div>
                <div class="block-content">
                  <battery-level :level="vehicleStatus.systems.mainBattery.level"></battery-level>
                </div>
              </div>
            </div>
            <div class="col-6" v-if="vehicleStatus.systems.engine">
              <div class="block block-rounded">
                <div class="block-header">
                  <h3 class="block-title">
                    <i class="fas fa-gas-pump"></i>
                    Fuel level
                  </h3>
                  <div class="block-options">
                    <!-- <button class="btn btn-sm btn-outline-danger">
                      <i class="fas fa-power-off"></i>
                    </button> -->
                  </div>
                </div>
                <div class="block-content">
                  <div class="status-text text-danger">
                    {{ Math.round(vehicleStatus.systems.engine.fuelLevel * 100) }} %
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12" v-if="vehicleStatus.systems.engine">
              <div class="block block-rounded">
                <div class="block-header">
                  <h3 class="block-title">
                    <i class="fas fa-bed"></i>
                    Last sleep cycle
                  </h3>
                  <div class="block-options">
                    <!-- <button class="btn btn-sm btn-outline-danger">
                      <i class="fas fa-power-off"></i>
                    </button> -->
                  </div>
                </div>
                <div class="block-content">
                  <div class="status-text text-danger">
                    {{ getTimeAgo(vehicleStatus.systems.engine.lastSleepCycle * 1000) }}
                  </div>
                </div>
              </div>
            </div>
            <div class="col-12" v-if="false">
              <div class="block block-rounded">
                <div class="block-header">
                  <h3 class="block-title text-danger">
                    <i class="fas fa-exclamation-triangle"></i>
                    Alerts
                  </h3>
                  <div class="block-options">
                    <!-- <button class="btn btn-sm btn-outline-danger">
                      <i class="fas fa-power-off"></i>
                    </button> -->
                  </div>
                </div>
                <div class="block-content">
                  <div class="status-text text-success" v-if="!vehicleAlerts.length">SYSTEMS OK</div>
                  <div v-if="vehicleAlerts.length">
                    <table class="table table-bordered table-striped">
                      <thead>
                        <tr role="row">
                          <th>System</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="(alert, index) in vehicleAlerts" :key="index">
                          <td><b>{{ alert.system }} ({{ alert.unit }})</b></td>
                          <td>{{ alert.label }}</td>
                        </tr>
                        
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="block-header">
      <h2 class="block-title">
        Tyre pressure
      </h2>
    </div>
    <div class="status-items block-content block-content-full subscriptions">
      <div class="row">
        <div class="col">
          <tyre-pressure :vehicle="mergedVehicle"></tyre-pressure>
        </div>
        <div class="col">
          <div class="block block-rounded">
            <table class="table table-bordered table-striped">
              <thead>
                <tr>
                  <th colspan="3">
                     Recommended pressure values
                  </th>
                </tr>
                <tr role="row">
                  <th></th>
                  <th>Mid-load</th>
                  <th>Full-load</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Front</td>
                  <td>33psi</td>
                  <td>35psi</td>
                </tr>
                <tr>
                  <td>Rear</td>
                  <td>33psi</td>
                  <td>35psi</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <div class="block-header" v-if="$route.params.subsystem === 'controls'">
      <h2 class="block-title">
        Simulator
      </h2>
    </div>
    <div class="status-items block-content block-content-full subscriptions" v-if="$route.params.subsystem === 'controls'">
      <div class="row">
        <div class="col">
          <div class="block block-rounded block-themed">
            <div class="block-header bg-dark">
              <h3 class="block-title">
                <i class="fas fa-car-battery"></i>
                Battery simulations
              </h3>
            </div>
            <div class="block-content">
              <button class="btn btn-outline-warning" @click="updateVehicleProperty('battery', .05)">
                <i class="fas fa-exclamation-triangle"></i>
                Discharge
              </button>
              <button class="btn btn-outline-primary" @click="updateVehicleProperty('battery', 1)">
                <i class="fas fa-bolt"></i>
                Charge
              </button>
            </div>
            
          </div>
        </div>
        <div class="col">
          <div class="block block-rounded block-themed">
            <div class="block-header bg-dark">
              <h3 class="block-title">
                <i class="fas fa-circle"></i>
                Tyre simulations
              </h3>
            </div>
            <div class="block-content">
              <button class="btn btn-outline-warning" @click="updateVehicleProperty('tyres', Math.random() * 20)">
                <i class="fas fa-exclamation-triangle"></i>
                Flat
              </button>
              <button class="btn btn-outline-primary" @click="updateVehicleProperty('tyres', 35)">
                <i class="fas fa-bolt"></i>
                Inflation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="block-header">
      <h2 class="block-title">
        Trip history
      </h2>
    </div>
    <div class="block-content block-content-full trip-history">
      <div class="row">
        <div class="col-3">
          <div class="block-header">
            <div class="block-title">Select your trip</div>
          </div>
          <div class="block-content block-content-full">
            <div class="trip">
              <div class="trip-title">
                Leamington Spa - Gaydon
              </div>
              <div class="trip-attributes">
                <div class="duration">
                  <i class="fas fa-stopwatch"></i>
                  1h21m.
                </div>
                <div class="distance">
                  <i class="fas fa-route"></i>
                  321mi.
                </div>
              </div>
            </div>
            <div class="trip">
              <div class="trip-title">
                Leamington Spa - Gaydon
              </div>
              <div class="trip-attributes">
                <div class="duration">
                  <i class="fas fa-stopwatch"></i>
                  1h21m.
                </div>
                <div class="distance">
                  <i class="fas fa-route"></i>
                  321mi.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-9">
          <div class="block block-rounded map-container">
            <trip-map :vehicle="vehicle"></trip-map>
          </div>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script>
import moment from 'moment';

import BatteryLevel from '@/components/BatteryLevel';
import TyrePressure from '@/components/TyrePressure';

import IotService from '@/services/IotService';

export default {
  name: 'vehicleStatus',
  components: {
    BatteryLevel,
    TyrePressure
  },
  data () {
    return {
      vehicle: null,
      vehicleStatus: null,
    }
  },
  computed: {
    mergedVehicle () {
      return {
        ...this.vehicle,
        ...this.vehicleStatus
      };
    },
    vehicleAlerts () {
      const alerts = [];

      // Battery
      if (this.vehicleStatus.systems.mainBattery.level < .1) {
        alerts.push({
          system: 'Battery',
          label: 'Critical level',
          unit: 'main'
        });
      } else if (this.vehicleStatus.systems.mainBattery.level < .25) {
        alerts.push({
          system: 'Battery',
          label: 'Low level',
          unit: 'main'
        });
      }

      // Tyre pressure
      let tyresOk = true;
      for (let tyreName in this.vehicleStatus.systems.tyres) {
        const tyre = this.vehicleStatus.systems.tyres[tyreName];
        if (tyre > 38 || tyre < 29) {
          alerts.push({
            system: 'Tyres',
            label: 'Critical Pressure',
            unit: tyreName
          });
        } else if (tyre < 32 || tyre > 35) {
          if (!this.vehicleStatus.warnings) this.vehicleStatus.warnings = [];
          alerts.push({
            system: 'Tyres',
            label: 'Incorrect Pressure',
            unit: tyreName
          });
        }
      }

      return alerts;
    }
  },
  created () {
    this.iotService = IotService.getInstance();
  },
  mounted () {
    this.fetchData()
    
    const vehiclesClient = this.iotService.connect();
    const vin = this.$route.params.id;
    vehiclesClient.on('connect', () => {
      console.log('INFO: Connected to AWS Iot');
      console.log('INFO: Subscribing to topics');
      vehiclesClient.subscribe(`$aws/things/${vin}/shadow/get/accepted`);
      vehiclesClient.subscribe(`$aws/things/${vin}/shadow/update/accepted`);
    });

    vehiclesClient.on('message', (topic, payload) => {
      try {
        const jsonPayload = JSON.parse(payload);
        this.processMessage(topic, jsonPayload);
      } catch(e) {
        console.error('ERROR: Cannot parse message');
        console.error(e)
      }
    })
  },
  methods: {
    async fetchData () {
      const vin = this.$route.params.id;
      this.vehicle = await this.vehicleService.getVehicle(vin);
      const status = await this.iotService.getVehicleStatus({ vin });
      if (!!status.battery) {
        this.vehicleStatus = {
          systems: {
            mainBattery: {
              level: status.battery
            },
            tyres: {
              frontLeft: status.tires[0],
              frontRight: status.tires[1],
              rearLeft: status.tires[2],
              rearRight: status.tires[3]
            },
            locks: {
              locked: status.doors,
              opened: status.door
            },
            trunk: {
              opened: status.trunk
            },
            clima: {
              temperature: 22
            }
          },
          location: {
            latitude: status.location[0],
            longitude: status.location[1]
          }
        }
      } else {
        this.vehicleStatus = status;
      }
    },
    
    processMessage (topic, payload) {
      const topicSplit = topic.split('/');
      const prefix = topicSplit[1];
      const vin = topic.split('/')[2];
      const data = topic.indexOf('$aws') === 0 ? payload.state.reported : payload;

      switch (prefix) {
        case 'battery':
          this.vehicleStatus.systems.mainBattery.level = data.battery;
          break;
        case 'tires':
          this.vehicleStatus.systems.tyres = {
            frontLeft: data.tires[0],
            frontRight: data.tires[1],
            rearLeft: data.tires[2],
            rearRight: data.tires[3],
          };
          break;
        case 'location':
          this.vehicleStatus.location = {
            latitude: data.location[0],
            longitude: data.location[1]
          };
          break;
        case 'things':
        default:
          this.vehicleStatus = {
            ...this.vehicleStatus,
            ...data
          };
      }

      this.$forceUpdate();
    },

    async updateVehicleLocation (data) {
      const location = {
        latitude: data.lngLat.lat,
        longitude: data.lngLat.lng,
        bearing: this.vehicleStatus.location.bearing
      };

      const status = {
        ...this.vehicleStatus,
        location
      };

      try {
        const update = await this.iotService.updateVehicleStatus(this.vehicle, status);
        console.log('INFO: Successfully updated vehicle location');
      } catch (e) {
        console.error('ERROR: Failed to update vehicle location');
      }

    },

    updateVehicleProperty (property, value) {
      console.log('INFO: Simulating values on vehicle')
      let realValue = null;
      switch (property) {
        case 'battery': 
          realValue = {
            systems: {
              ...this.vehicleStatus.systems,
              mainBattery: {
                level: value
              }
            }
          }
          break;
        case 'tyres':
          realValue = {
            systems: {
              ...this.vehicleStatus.systems,
              tyres: {
                frontLeft: value,
                frontRight: value,
                rearLeft: value,
                rearRight: value
              }
            }
          }
          break;
      }

      this.iotService.updateVehicleStatus(this.vehicle, {
        ...this.vehicleStatus,
        ...realValue
      });
    },

    getTimeAgo (time) {
      return moment(time).fromNow();
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.vehicle-status {
  position: relative;

  .status-items {
    .block {
      min-height: 160px;

      .status-text {
        font-size: 2em;
        margin: 6px;
      }
    }
  }

  .block {
    &.map-container {
      min-height: 400px;
      margin-right: -50px;
      padding-right: 50px;

      .trip-map {
        border-left: 1px solid #787878;
        overflow: hidden;
      }
    }
  }

  .trip-history {

    .trip {
      padding-top: 0.5em;
      padding-right: 500px;
      margin-right: -500px;
      padding-left: 200px;
      margin-left: -200px;
      margin-top: -1px;
      border-top: 1px solid #787878;
      border-bottom: 1px solid #787878;
      padding-bottom: 1em;
      cursor: pointer;

      &:hover {
        background: rgba(0, 0, 0, 0.1);
      }
      
      .trip-title {
        padding: 0 1em;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        font-weight: bold;
        margin-bottom: 1em;
      }

      .trip-attributes {
        text-align: left;
        margin-left: 1em;
        font-weight: 200;

        .distance {
          
        }

        .duration {
          float: right;
          margin-right: 1em;
        }
      }
    }
  }
}

</style>
