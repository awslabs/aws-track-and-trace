<template>
  <div class="sensor" :style="sensorStyle">
    <div class="name">{{ sensor.SensorName }}</div>
    <div class="value formatted" v-if="showFormattedValue">
      <span class="current">{{ sensorFormattedValue }}</span>
      <sup class="units">
        {{ sensor.ValueUnits }}
      </sup>
    </div>
    <div class="value plain" v-else>
      <battery-level v-if="sensor.SensorType === 'battery'" :level="sensorValue"></battery-level>
      <tyre-pressure v-else-if="sensor.SensorType === 'tyres'" :tyres="sensorValue" :units="sensor.ValueUnits"></tyre-pressure>
    </div>
  </div>
</template>

<script>
import BatteryLevel from '@/components/BatteryLevel';
import TyrePressure from '@/components/TyrePressure';

import AssetService from '@/services/AssetService';

export default {
  name: 'sensorOverview',
  props: ['asset', 'sensor', 'short'],
  components: {
    BatteryLevel,
    TyrePressure
  },
  data () {
    return {
    }
  },
  computed: {
    showFormattedValue () {
      switch(this.sensor.SensorType) {
        case 'battery':
        case 'tyres':
          return false;
        default:
          return true;
      }
    },
    sensorFormattedValue () {
      if (typeof this.sensorValue === 'object') return {};
      return this.formatValue(this.sensorValue);
    },
    sensorValue () {
      return this.getSensorValue(this.sensor);
    },
    sensorStyle () {
      return {};
    }
  },
  created () {
    this.assetService = AssetService.getInstance();
  },
  methods: {
    formatValue (value) {
      switch (this.sensor.SensorType) {
        case 'percent':
          return value * 100;
        case 'number':
        case 'string':
        default: 
          return value;
      }
    },
    getSensorValue (sensor) {
      const asset = this.asset;
      const value = eval(`asset.$state.${sensor.ValueField}`);

      return value;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.sensor {
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;
  min-height: 120px;
  background: rgba(255, 255, 255, .7);
  margin: 0 .5em .5em 0;
  border-radius: 3px;

  > div {
    width: 100%;
  }

  .name {
    font-size: .9em;
    font-weight: bold;
    padding: .25em .5em;
    color: #999;
  }

  .value {
    
    &.formatted {
      font-size: 2.5em;
    }

    .units {
      font-size: .4em;
      display: inline-block;
      margin: -.5em;
      top: -1em;
      color: #999;
    }
  }
}

</style>
