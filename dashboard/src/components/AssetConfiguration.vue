<template>
  <div class="asset-configuration" v-if="asset">
    <div class="general-information">
      <h2>General information</h2>
      <div class="basic">
        <meta-form :metadata="forms.assetBasicInformation"></meta-form>
      </div>
      <div class="sensors">
        <h3>Sensors</h3>
        <div class="actions">
          <button class="btn btn-outline-success btn-sm" @click="startAddingSensor()">
            <i class="fas fa-plus"></i>
          </button>
        </div>
        <div class="sensors-content" v-if="config.sensorsViewStatus !== 'add'">
          <div class="no-sensors" v-if="!sensors.length">
            You have setup no sensors
          </div>
          <div class="sensor" v-for="(sensor, index) in sensors" :key="index">
            <div class="info">
              <span class="name">{{ sensor.SensorName }}</span>
              <!-- <span class="type">({{ sensor.SensorType }})</span> -->
            </div>
            <div class="current-value">
              <span class="value" v-if="sensor.SensorType === 'number'">{{ sensor.value }}</span>
              <span class="value" v-else-if="sensor.SensorType === 'percent'">{{ sensor.value * 100 }}</span>
              <span class="value" v-else-if="sensor.SensorType === 'boolean'">{{ sensor.value ? 'Yes' : 'No' }}</span>
              <span class="units">{{ sensor.ValueUnits }}</span>
            </div>
            <div class="actions">
              <button class="btn btn-outline-danger btn-sm" @click="deleteSensor(sensor)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="sensors-content add" v-if="config.sensorsViewStatus === 'add'">
          <meta-form :metadata="forms.sensorOnboarding"></meta-form>
        </div>
      </div>
      <div class="styling">
        <h3>Styling</h3>
        <div class="text-muted">
          Enter your styling rules here. You can use <code>this</code> (Vue component), <code>this.google</code> (GMaps instance) and all sensors defined.
        </div>
        <textarea rows="10" v-model="assetStyle">
        </textarea>
        <div class="actions text-right">
          <button class="btn btn-sm btn-outline-success">
            <i class="fas fa-save"></i>
            Save
          </button>
        </div>
      </div>
    </div>
    <div class="current-status">
      <h2>Current status</h2>
      <div class="current-location">
        <h3>Location</h3>
        <GmapMap
          :center="mapCenter"
          :zoom="7"
          map-type-id="roadmap"
          :style="mapStyle"
          :options="mapOptions"
          @click="clickMap($event)"
        >
          <GmapMarker
            v-if="google"
            :position="mapCenter"
            :clickable="false"
            :draggable="false"
            :icon="getMapIcon(asset)"
          />
        </GmapMap>
      </div>
      <div class="current-state">
        <h3>State</h3>
        <pre lang="json" v-html="assetState"></pre>
      </div>
    </div>
  </div>
</template>

<script>
import { gmapApi } from 'vue2-google-maps';

import MetaForm from '@/components/Form';

import ConfigurationService from '@/services/ConfigurationService';
import DdbService from '@/services/DdbService';
import FrameworkService from '@/services/FrameworkService';

export default {
  name: 'assetConfiguration',
  props: ['asset'],
  components: {
    MetaForm
  },
  data () {
    return {
      config: {
        sensorsViewStatus: 'idle'
      },
      assetStyle: JSON.stringify({
        path: 'CIRCLE',
        scale: 8,
        fillColor: '#444',
        fillOpacity: 1,
        strokeWeight: 0,
        strokeColor: '#444'
      }, null, 2),
      sensors: [],
      mapOptions: {
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false
      },
      mapStyle: {
        width: `${ this.width || 320 }px`,
        height: `${ this.height || 240 }px`
      },
      forms: {
        assetBasicInformation: {
          fields: [
            {
              id: 'AssetId',
              type: 'text',
              label: 'Thing name',
              placeholder: 'MyAsset1',
              hint: 'The thing name in AWS IoT'
            },
            {
              id: 'LocationField',
              type: 'text',
              label: 'Location variable',
              placeholder: 'systems.gps.location',
              hint: 'Path to the location variable'
            }
          ],
          model: {
            AssetId: '',
            locationField: ''
          }
        },
        sensorOnboarding: {
          title: 'New sensor',
          model: {
            SensorName: '',
            SensorType: '',
            ValueField: '',
            ValueUnits: ''
          },
          fields: [
            {
              id: 'SensorName',
              type: 'text',
              label: 'Sensor name',
              placeholder: 'Cooler temperature',
              hint: 'Set a name for your sensor'
            },
            {
              id: 'SensorType',
              type: 'select',
              label: 'Sensor type',
              placeholder: 'Sensor type',
              hint: 'Select your sensor type',
              options: [
                {
                  label: 'Number',
                  value: 'number'
                },
                {
                  label: 'Percent',
                  value: 'percent'
                },
                {
                  label: 'Boolean',
                  value: 'boolean'
                }
              ]
            },
            {
              id: 'ValueField',
              type: 'text',
              label: 'Value field',
              placeholder: 'systems.cooler.temperature',
              hint: 'Location of your value in the state'
            },
            {
              id: 'ValueUnits',
              type: 'text',
              label: 'Value units',
              placeholder: 'ºC',
              hint: 'Units for this type of value'
            }
          ],
          actions: [{
            label: 'Save sensor',
            icon: 'fas fa-save',
            style: 'btn-success',
            handler: async (data) => {
              this.onboardSensor(data);
            }
          }]
        }
      }
    }
  },
  computed: {
    google: gmapApi,
    assetState () {
      return JSON.stringify(this.asset.$state, null, 2);
    },
    mapCenter () {
      if (!this.asset) return null;

      return {
        lat: this.asset.location.latitude,
        lng: this.asset.location.longitude
      };
    }
  },
  created () {
    this.config = ConfigurationService.getInstance();
    this.ddb = DdbService.getInstance();
    this.fwk = FrameworkService.getInstance();

    this.sensorsTableName = this.config.get('INVENTORY_SENSORS_TABLE_NAME');
  },
  mounted () {
    this.fetchSensors();
  },
  methods: {
    async deleteSensor (sensor) {
      console.log ('INFO: Deleting sensor');
      const { AssetId, SensorId } = sensor;

      try {
        const ret = await this.ddb.delete(this.sensorsTableName, { AssetId, SensorId });
        this.fwk.addAlert('success', `Successfully deleted sensor ${SensorId}`);
        this.fetchSensors();
      } catch (e) {
        this.fwk.addAlert('danger', `Failed to delete sensor ${SensorId}`);
      }
    },
    
    async fetchSensors () {
      console.log('INFO: Start fetching sensors');
      const keys = { '#asset': 'AssetId' };
      const values = { ':assetId': this.asset.$inventory.AssetId };
      const sensors = await this.ddb.query(this.sensorsTableName, '#asset = :assetId', keys, values);

      const state = this.asset.$state;
      this.sensors = sensors.map(sensor => {
        const value = eval(`state.${sensor.ValueField}`);
        return {
          ...sensor,
          value
        }
      });
      this.$forceUpdate()
    },

    getMapIcon (asset) {
      const style = this.assetStyle;
      const parsedStyle = JSON.parse(style);

      const ret = { ...parsedStyle };
      ret.path = this.google.maps.SymbolPath[parsedStyle.path];

      return ret;
    },

    async onboardSensor (data) {
      console.log('INFO: Saving sensor');
      const state = this.asset.$state;
      const currentValue = eval(`state.${data.ValueField}`);

      const AssetId = this.asset.$inventory.AssetId;
      const SensorId = data.SensorName;

      const Item = {
        ...data,
        AssetId,
        SensorId
      };

      try {
        const ret = await this.ddb.put(this.sensorsTableName, { AssetId, SensorId }, Item);
        this.fwk.addAlert('success', `Successfully added sensor ${SensorId}`);
        this.config.sensorsViewStatus = 'idle';
        this.forms.sensorOnboarding.model = {
          SensorName: '',
          SensorType: '',
          ValueField: ''
        }
        await this.fetchSensors();
      } catch (e) {
        this.fwk.addAlert('danger', `Failed to add sensor ${SensorId}`);
      }

    },

    startAddingSensor () {
      this.config.sensorsViewStatus = 'add';
      this.$forceUpdate();
    }
  },
  watch: {
    asset (val) {
      if (val) {
        this.fetchSensors();
        this.forms.assetBasicInformation.model = val.$inventory;
      }
    },

    assetStyle (val) {
      this.$$forceUpdate();
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.asset-configuration {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  width: 100%;
  height: 100%;

  > div {
    margin: .25em;
    padding: 1em;
    text-align: left;
    
    h2 {
      font-size: 1.2em;
    }

    h3 {
      font-size: 1.1em;
      margin-top: .5em;
    }
  }

  .general-information {
    flex: 1;
    min-width: 60%;

    display: flex;
    justify-content: stretch;
    align-items: flex-start;
    flex-wrap: wrap;

    > div { 
    }

    .basic {
      width: 100%;      
    }

    .sensors {
      position: relative;
      width: 45%;

      h3 {
        display: inline-block;
      }

      .actions {
        display: inline-block;
      }

      .sensors-content {
        display: flex;
        align-items: flex-start;
        justify-content: stretch;
        flex-wrap: wrap;
        width: 100%;
        padding-top: 1em;
        padding-right: 1em;

        .no-sensors {
          align-self: center;
          justify-content: center;
          text-align: center;
          width: 100%;
        }

        .sensor {
          width: 100%;
          padding: .5em;

          &:nth-child(even) {
            background: rgba(255, 255, 255, .8);
          }

          &:nth-child(odd) {
            background: rgba(255, 255, 255, .3);
          }

          .info {
            display: inline-block;

            .name {
              font-weight: bold;
            }
          }

          .current-value {
            display: inline-block;
            margin: 0 .5em;

            .value {
              font-weight: 300;
              font-size: 1.2em;
            }

            .units {
              color: #666;
            }
          }

          .actions {
            opacity: 0;
            transition: opacity .3s ease-in-out;
            float: right;

            button {
              font-size: .8em;
            }
          }

          &:hover {
            .actions {
              opacity: 1;
            }
          }
        }
      }
    }

    .styling {
      width: 55%;

      textarea {
        margin: .5em 0;
        padding: .5em;
        width: 100%;
        border: none;
        background: rgba(0, 0, 0, .6);
        border-radius: .5em;
        color: white;
      }
    }
  }

  .current-status {
    align-self: stretch;

    .current-state {
      
      pre {
        background: rgba(255, 255, 255, .8);
        padding: .5em;
        border-radius: .5em;
      }
    }
  }
}

</style>
