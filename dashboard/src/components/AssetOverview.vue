<template>
  <div class="asset-overview">
    <div class="sensors">
      <h3 class="section-title">
        <i class="fas fa-microchip"></i>
        Sensor overview
      </h3>
      <sensor-overview v-for="(sensor, index) in asset.$sensors" :key="index" :asset="asset" :sensor="sensor"></sensor-overview>
    </div>
    <div class="location" ref="mapContainer">
      <h3 class="section-title">
        <i class="fas fa-map-pin"></i>
        Location overview
      </h3>
      <asset-map :asset="asset" :width="mapSize.width" :height="mapSize.height" v-if="mapSize"></asset-map>
    </div>
    <div class="sensor-history">
      <h3 class="section-title">
        <i class="fas fa-history"></i>
        Sensor history
      </h3>
      <sensor-history v-for="(sensor, index) in asset.$sensors" :key="index" :asset="asset" :sensor="sensor"></sensor-history>
    </div>
  </div>
</template>

<script>
import AssetMap from '@/components/AssetMap';
import SensorHistory from '@/components/SensorHistory';
import SensorOverview from '@/components/SensorOverview';

export default {
  name: 'assetOverview',
  props: ['asset'],
  components: {
    AssetMap,
    SensorHistory,
    SensorOverview
  },
  data () {
    return {
      mapSize: null
    }
  },
  mounted () {
    const container = this.$refs.mapContainer;
    const { offsetWidth, offsetHeight } = container;

    this.mapSize = {
      width: offsetWidth,
      height: offsetHeight
    };
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.asset-overview {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  flex-wrap: wrap;

  .section-title {
    width: 100%;
    text-align: left;
    font-size: 1.2em;
    white-space: nowrap;
  }

  .sensors {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .sensor-history {
    width: 100%;
  }

  .location {
    width: 40%;
    max-width: 320px;
    height: 250px;
    justify-self: flex-end;
  }
}

</style>
