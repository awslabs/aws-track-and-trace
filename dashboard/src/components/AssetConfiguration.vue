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
            Add sensor
          </button>
        </div>
        <div class="sensors-content" v-if="config.sensorsViewStatus !== 'add'">
          <div class="no-sensors" v-if="!asset.$sensors.length">
            You have setup no sensors
          </div>
          <div class="sensor" v-for="(sensor, index) in asset.$sensors" :key="index">
            <div class="info">
              <span class="name">{{ sensor.SensorName }}</span>
              <!-- <span class="type">({{ sensor.SensorType }})</span> -->
            </div>
            <!-- <div class="current-value">
              <span class="value" v-if="sensor.SensorType === 'number'">{{ sensor.value }}</span>
              <span class="value" v-else-if="sensor.SensorType === 'percent'">{{ sensor.value * 100 }}</span>
              <span class="value" v-else-if="sensor.SensorType === 'boolean'">{{ sensor.value ? 'Yes' : 'No' }}</span>
              <span class="units">{{ sensor.ValueUnits }}</span>
            </div> -->
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
        <div class="actions">
          <button class="btn btn-sm btn-outline-success" @click="startAddingStyleCondition()" v-if="config.stylingViewStatus !== 'edit'">
            <i class="fas fa-code-branch"></i>
            Add condition
          </button>
          <button class="btn btn-sm btn-outline-dark" @click="editMainStyle()" v-if="config.stylingViewStatus !== 'edit'">
            <i class="fas fa-pencil-alt"></i>
            Edit main style
          </button>
        </div>
        <div class="add-condition" v-if="config.stylingViewStatus === 'condition-add'">
          <meta-form :metadata="forms.styleConditionOnboarding"></meta-form>
        </div>
        <div class="main-styling" v-else-if="config.stylingViewStatus !== 'conditions'">
          <textarea rows="8" v-model="assetStyle"></textarea>
          <div class="actions text-right">
            <button class="btn btn-sm btn-outline-success" @click="saveAssetStyle()">
              <i class="fas fa-save"></i>
              Save
            </button>
          </div>
        </div>
        <div class="conditions" v-else>
          <div class="no-conditions" v-if="!asset.$conditions.length">
            You have setup no conditions
          </div>
          <div class="condition" v-for="(condition, index) in sortedStyleConditions" :key="index">
            <div class="info">
              <span class="matches">
                <i :class="verifyConditionMatch(condition).matchClass"></i>
              </span>
              <span class="expression">{{ condition.ConditionExpression }}</span>
            </div>
            <div class="actions">
              <button class="btn btn-outline-primary btn-sm promote" @click="sortStyleCondition(condition, -1)">
                <i class="fas fa-chevron-up"></i>
              </button>
              <button class="btn btn-outline-primary btn-sm demote" @click="sortStyleCondition(condition, 1)">
                <i class="fas fa-chevron-down"></i>
              </button>
              <button class="btn btn-outline-danger btn-sm delete" @click="deleteStyleCondition(condition)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="current-status">
      <h2>Current status</h2>
      <div class="current-location">
        <h3>Location</h3>
        <asset-map :asset="asset"></asset-map>
      </div>
      <div class="current-state">
        <h3>State</h3>
        <pre lang="json" v-html="assetState"></pre>
      </div>
    </div>
  </div>
</template>

<script>
import uuid from 'uuid/v4';

import AssetMap from '@/components/AssetMap';
import MetaForm from '@/components/Form';

import AssetService from '@/services/AssetService';
import ConfigurationService from '@/services/ConfigurationService';
import DdbService from '@/services/DdbService';
import FrameworkService from '@/services/FrameworkService';

export default {
  name: 'assetConfiguration',
  props: ['asset', '@onUpdate'],
  components: {
    AssetMap,
    MetaForm
  },
  data () {
    return {
      config: {
        sensorsViewStatus: 'idle',
        stylingViewStatus: 'edit'
      },
      assetStyle: JSON.stringify({
        path: 'CIRCLE',
        scale: 8,
        fillColor: '#444',
        fillOpacity: 1,
        strokeWeight: 0,
        strokeColor: '#444'
      }, null, 2),
      forms: {
        assetBasicInformation: {
          fields: [
            {
              id: 'AssetId',
              type: 'text',
              label: 'Thing name',
              placeholder: 'MyAsset1',
              hint: 'The thing name in AWS IoT',
              disabled: true
            },
            {
              id: 'LocationField',
              type: 'text',
              label: 'Location variable',
              placeholder: 'systems.gps.location',
              hint: 'Path to the location variable',
              disabled: true
            }
          ],
          model: this.asset ? this.asset.$inventory : {
            AssetId: '',
            LocationField: ''
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
              placeholder: 'CoolerTemperature',
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
                },
                {
                  label: 'Battery Level',
                  value: 'battery'
                },
                {
                  label: 'Tyre pressure',
                  value: 'tyres'
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
        },
        styleConditionOnboarding: {
          title: 'New condition',
          model: {
            ConditionExpression: '',
            StyleOverrides: '',
            Priority: 0
          },
          fields: [
            {
              id: 'ConditionExpression',
              type: 'text',
              label: 'Condition expression',
              placeholder: 'CoolerTemperature.indexOf(\'something\') === 2',
              hint: 'Condition matching expression. Use the sensor names.'
            },
            {
              id: 'StyleOverrides',
              type: 'textarea',
              label: 'Style overrides',
              placeholder: JSON.stringify({ fillColor: 'red', fillOpacity: 1 }, null, 2),
              hint: 'Style overrides. Empty means no change.',
              rows: 8
            }
          ],
          actions: [{
            label: 'Save condition',
            icon: 'fas fa-save',
            style: 'btn-success',
            handler: async (data) => {
              this.onboardStyleCondition(data);
            }
          }]
        }
      }
    }
  },
  computed: {
    assetState () {
      return JSON.stringify(this.asset.$state, null, 2);
    },
    sortedStyleConditions () {
      return this.asset.$conditions.sort((a, b) => {
        return a.Priority - b.Priority;
      });
    }
  },
  created () {
    this.assetService = AssetService.getInstance();
    this.configService = ConfigurationService.getInstance();
    this.ddb = DdbService.getInstance();
    this.fwk = FrameworkService.getInstance();

    this.assetsTableName     = this.configService.get('INVENTORY_ASSETS_TABLE_NAME');
    this.conditionsTableName = this.configService.get('INVENTORY_CONDITIONS_TABLE_NAME');
    this.sensorsTableName    = this.configService.get('INVENTORY_SENSORS_TABLE_NAME');
  },
  mounted () {
    if (this.asset.$inventory.MarkerStyle) {
      const parsed = JSON.parse(this.asset.$inventory.MarkerStyle);
      this.assetStyle = JSON.stringify(parsed, null, 2);
      this.config.stylingViewStatus = 'conditions';
    }
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

    async deleteStyleCondition (condition) {
      console.log ('INFO: Deleting sensor');
      const { AssetId, ConditionId } = condition;

      try {
        const ret = await this.ddb.delete(this.conditionsTableName, { AssetId, ConditionId });
        this.fwk.addAlert('success', `Successfully deleted condition.`);
        this.fetchConditions();
      } catch (e) {
        this.fwk.addAlert('danger', `Failed to delete sensor.`);
      }
    },

    editMainStyle () {
      this.config.stylingViewStatus = 'edit';
    },

    async onboardSensor (data) {
      console.log('INFO: Saving sensor');
      const currentValue = this.assetService.getSensorValue(this.asset, data);

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
        this.onUpdate();
      } catch (e) {
        this.fwk.addAlert('danger', `Failed to add sensor ${SensorId}`);
      }

    },

    async onboardStyleCondition (condition) {
      const { AssetId } = this.asset.$inventory;
      
      const ConditionId = uuid();

      const item = {
        ...condition,
        AssetId,
        ConditionId
      }

      try {
        const ret = await this.ddb.put(this.conditionsTableName, { AssetId, ConditionId }, item);
        this.fwk.addAlert('success', 'Successfully added condition');
        this.config.stylingViewStatus = 'conditions';
        this.onUpdate();
      } catch (e) {
        this.fwk.addAlert('danger', 'Failed to add condition to marker style')
      }
    },

    async saveAssetStyle () {
      const style = this.assetStyle;
      const parsedStyle = JSON.parse(style);
      const minified = JSON.stringify(parsedStyle);

      const { AssetId } = this.asset.$inventory;

      const UpdateExpression = 'set #style = :style';
      const names = { '#style': 'MarkerStyle' };
      const values = { ':style': minified };

      try {
        const ret = await this.ddb.update(this.assetsTableName, { AssetId }, UpdateExpression, names, values);
        this.fwk.addAlert('success', 'Successsfully stored asset style');
        this.config.stylingViewStatus = 'conditions';
      } catch (e) {
        this.fwk.addAlert('danger', 'Failed to store asset style');
      }
    },

    async sortStyleCondition (condition, direction) {
      const index = this.sortedStyleConditions.indexOf(condition);
      const item = direction > 0 ? this.sortedStyleConditions[index + 1] : this.sortedStyleConditions[index - 1];
      condition.Priority = item.Priority + direction;

      const { AssetId, ConditionId } = condition
      const expression = 'set #priority = :priority';
      const names = { '#priority': 'Priority' };
      const values = { ':priority': condition.Priority };

      try {
        const ret = await this.ddb.update(this.conditionsTableName, { AssetId, ConditionId }, expression, names, values);
        this.fwk.addAlert('success', 'Successfully changed condition order');
      } catch (e) {
        this.fwk.addAlert('danger', 'Failed to change condition order');
      }
    },

    startAddingSensor () {
      this.config.sensorsViewStatus = 'add';
    },

    startAddingStyleCondition () {
      this.config.stylingViewStatus = 'condition-add';
    },

    verifyConditionMatch (condition) {
      const matches = this.assetService.verifyConditionMatch(this.asset, condition);
      const matchClass = matches ? 'text-success fas fa-check' : 'text-danger fas fa-times';
      return {
        matches, matchClass
      };
    }
  },
  watch: {
    asset (val) {
      if (val) {
        this.fetchSensors();
        this.forms.assetBasicInformation.model = val.$inventory;
      }
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

        button {
          font-size: .8em;
        }
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

      h3 {
        display: inline-block;
      }

      .actions {
        display: inline-block;

        button {
          font-size: .8em;
        }
      }

      textarea {
        margin: .5em 0;
        padding: .5em;
        width: 100%;
        border: none;
        background: rgba(0, 0, 0, .6);
        border-radius: .5em;
        color: white;
      }

      .conditions {
        display: flex;
        align-items: flex-start;
        justify-content: stretch;
        flex-wrap: wrap;
        width: 100%;
        padding-top: 1em;

        .no-conditions {
          align-self: center;
          justify-content: center;
          text-align: center;
          width: 100%;
        }

        .condition {
          width: 100%;
          padding: .5em;
          display: flex;
          justify-content: flex-start;
          align-items: center;

          &:nth-child(odd) {
            background: rgba(255, 255, 255, .8);
          }

          &:nth-child(even) {
            background: rgba(255, 255, 255, .3);
          }

          &:first-child {
            .actions .promote {
              display: none;
            }
          }

          &:last-child {
            .actions .demote {
              display: none;
            }
          }

          .info {
            flex: 1;
            display: flex;
            justify-content: flex-start;
            align-items: center;

            .expression {
              text-indent: .5em;
              font-size: 1.2em;
              font-weight: 200;
              margin-right: .5em;
            }

            .matches {
              margin-left: .5em;
            }
          }

          .actions {
            opacity: 0;
            transition: opacity .3s ease-in-out;
            justify-self: flex-end;

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
  }

  .current-status {
    align-self: stretch;

    .current-state {
      
      pre {
        background: rgba(255, 255, 255, .8);
        padding: .5em;
        border-radius: .5em;
        max-height: 400px;
        overflow: auto;
      }
    }
  }
}

</style>
