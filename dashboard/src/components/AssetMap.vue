<template>
  <div class="asset-map">
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
</template>

<script>
import { gmapApi } from 'vue2-google-maps';

import AssetService from '@/services/AssetService';

export default {
  name: 'assetMap',
  props: ['asset', 'width', 'height'],
  data () {
    return {
      mapOptions: {
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false
      },
      mapStyle: null
    }
  },
  computed: {
    google: gmapApi,
    mapCenter () {
      if (!this.asset) return null;
      const location = this.assetService.getAssetLocation(this.asset)

      return {
        lat: location.latitude,
        lng: location.longitude
      };
    }
  },
  created () {
    this.assetService = AssetService.getInstance();

    this.mapStyle = {
      width: `${ this.width || 320 }px`,
      height: `${ this.height || 240 }px`
    }
  },
  methods: {
    getMapIcon (asset) {
      const style = this.assetService.getAssetStyle(asset);
      style.path = this.google.maps.SymbolPath[style.path];

      return style;
    },

    verifyConditionMatch (condition) {
      const matches = this.assetService.verifyConditionMatch(this.asset, condition);
      const matchClass = matches ? 'text-success fas fa-check' : 'text-danger fas fa-times';
      return {
        matches, matchClass
      };
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.asset-map {
}

</style>
