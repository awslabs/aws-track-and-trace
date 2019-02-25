<template>
  <div class="fleet-map" ref="mapContainer">
    <GmapMap
      :center="center"
      :zoom="7"
      map-type-id="roadmap"
      :style="mapStyle"
      :options="mapOptions"
      @click="clickMap($event)"
    >
      <GmapMarker
        v-if="google"
        :key="`v${index}`"
        v-for="(asset, index) in assets"
        :position="parseLocation(asset)"
        :clickable="true"
        :draggable="false"
        @click="clickVehicle(asset)"
        :icon="getMapIcon(asset)"
      />
      <GmapCircle
        v-if="google && mapActions[2].status === 'enabled'"
        :key="`a${index}`"
        v-for="(alert, index) in pois"
        :center="alert.center"
        :clickable="true"
        :draggable="false"
        :radius="alert.radius"
        :options="alert.options"
        @click="clickVehicle(asset)"
      />
    </GmapMap>
    <div class="map-overlay-menu">
      <fleet-map-menu :assets="assets"></fleet-map-menu>
    </div>
    <div class="map-overlay-panel">
      <div class="header">
        <div class="title">Lorem ipsum dolor sit</div>
        <div class="close">
          <button class="btn btn-link">
            <i class="fa fa-times"></i>
          </button>
        </div>
      </div>
      <div class="content" v-if="assets.length">
        <asset-configuration :asset="assets[0]"></asset-configuration>
      </div>
    </div>
  </div>
</template>

<script>
import { gmapApi } from 'vue2-google-maps';
import nameGenerator from 'project-name-generator';
import randomColor from 'randomcolor';

import AssetConfiguration from '@/components/AssetConfiguration';
import FleetMapMenu from '@/components/FleetMapMenu';

import ConfigurationService from '@/services/ConfigurationService';
import DdbService from '@/services/DdbService';
import IotService from '@/services/IotService';

export default {
  name: 'ComponentCamelName',
  props: ['mapCenter', 'mapClick', 'mapItems', 'mapZoom', 'width', 'height', 'enableOverlayMenu'],
  components: {
    AssetConfiguration,
    FleetMapMenu
  },
  data () {
    return {
      zoom: this.mapZoom || 6,
      center: {
        lat: 43.3695167, 
        lng: -5.8661674
      },
      url:'http://aws.amazon.com',
      attribution:'Amazon Web Services',
      mapOptions: {
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        fullscreenControl: false
      },
      mapStyle: {
        width: `${ this.width || 1920 }px`,
        height: `${ this.height || 1080 }px`
      },
      pois: [],
      assets: this.mapItems || []
    }
  },
  computed: {
    google: gmapApi,
  },
  async created () {
    this.configurationService = ConfigurationService.getInstance();

    this.iotService = IotService.getInstance();
    this.ddbService = DdbService.getInstance()

    this.inventoryTableName = this.configurationService.get('INVENTORY_ASSETS_TABLE_NAME');

    const assetsClient = this.iotService.connect();
    assetsClient.on('connect', async () => {
      console.log('INFO: Connected to AWS Iot');
      console.log('INFO: Subscribing to topics');
      // assetsClient.subscribe('$aws/things/+/shadow/get/accepted');
      // assetsClient.subscribe('$aws/things/+/shadow/update/accepted');

      console.log('INFO: Fetching assets');
      await this.fetchAssets();
    });

    assetsClient.on('message', (topic, payload) => {
      try {
        const jsonPayload = JSON.parse(payload);
        this.processMessage(topic, jsonPayload);
      } catch(e) {
        console.error('ERROR: Cannot parse message');
        console.error(e)
      }
    })
  },
  mounted () {
    if (!this.mapItems) {
      this.fetchAssets();
    }
    this.configureMap();
  },
  methods: {
    actionClick (action) {
      if (action.actions && action.actions.click) {
        action.actions.click();
      } else {
        if (action.status === 'enabled') action.status = 'disabled';
        else action.status = 'enabled';
      }
    },

    async clearPois () {
      console.log('INFO: Clearing all POIs');
      try {
        await this.poiService.clearPois(this.pois);
        this.fetchData()
      } catch (e) {
        console.error('ERROR: Failed to clear POIs');
        console.error(e);
      }
    },

    async clickMap (event) {
      if (this.mapActions[3].status === 'enabled') {
        const location = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        const color = randomColor();
        const poi = {
          Name: nameGenerator({ words: 2, alliterative: true }).spaced,
          center: location,
          radius: 20000,
          options: {
            fillColor: color,
            fillOpacity: .3,
            strokeColor: color,
            strokeWeight: 2
          }
        };

        try {
          console.log('INFO: Adding POI to table');
          await this.poiService.addPoi(poi);
          this.fetchData();
        } catch (e) {
          console.error('ERROR: Failed to create POI');
          console.error(e);
        }
      }
    },

    clickVehicle (asset) {
      this.$router.push(`/dashboard/asset-status/${asset.vin}`);
    },

    configureMap () {
      this.container = this.$refs.mapContainer;
      const { offsetWidth, offsetHeight } = this.container;

      this.mapStyle = {
        width: `${this.width || offsetWidth}px`,
        height: `${this.height || offsetHeight}px`
      };

      
    },

    createAssetDefinition (inventoryDef, stateDef) {
      const location = eval(`stateDef.${inventoryDef.LocationField}`);
      // TODO Manage exceptions here

      const ret = {
        $inventory: inventoryDef,
        $state: stateDef,

        location
      };

      return ret
    },

    async fetchAssets () {
      console.log('INFO: Fetching assets');
      const inventoryAssets = await this.ddbService.scan(this.inventoryTableName);
      const assets = [];
      for (let i = 0; i < inventoryAssets.length; i++) {
        const inventoryAsset = inventoryAssets[i];
        const stateAsset = await this.iotService.getAssetStatus(inventoryAsset.AssetId);

        const parsedAsset = this.createAssetDefinition(inventoryAsset, stateAsset);
        assets.push(parsedAsset);
      }
      
      this.assets = assets;
    },

    getMapIcon (asset) {
      return {
        path: this.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#444',
        fillOpacity: 1,
        strokeWeight: 0,
        strokeColor: '#444'
      }
    },

    parseLocation (asset) {
      // TODO Implement
      return {
        lat: asset.location.latitude,
        lng: asset.location.longitude
      };
    },

    processMessage (topic, payload) {
      const vin = topic.split('/')[2];
      const data = topic.indexOf('$aws') === 0 ? payload.state.reported : payload;
      const item = this.assets.filter(item => item.vin === vin)[0];
      if (item) {
        console.log('INFO: Received request from asset to update location')
        if (data.location instanceof Array) {
          item.location = {
            latitude: data.location[0],
            longitude: data.location[1],
            bearing: 0
          };
        } else if (data.location) {
          item.location = data.location;
        }
        // this.renderMarkers();
      }
    }
  },
  watch: {
    assets: {
      handler () {
        this.$forceUpdate();
      },
      deep: true
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

.fleet-map {
  position: relative;
  margin: 0;
  padding: 0;

  #fleet-map {
    position: absolute;
    top: 0px;
    left: 0px;
    right: 100%;
    bottom: 100%;

    #map {
      position: absolute;
      top: 0px;
      left: 0px;
      bottom: 0px;
      right: 0px;
      text-align: left;
    }
  }

  .map-overlay-menu {
    position: fixed;
    top: 80px;
    left: 0px;
    width: 265px;
    min-height: 100px;
    background: rgba(255, 255, 255, .7);
    z-index: 10;
    border-bottom-right-radius: 1em;
    padding-bottom: 1em;

    .info-item {
      font-size: 2em;
    }

    .map-actions {
      padding: .5em 1em;
      button {
        display: block;
        margin: 1em 0;
        width: 100%;

        i {
          float: left;
          margin-top: 3px;
        }

        &:first-child {
          margin-top: 0px;
        }
      }
    }
  }

  .map-overlay-panel {
    position: fixed;
    top: 100px;
    right: 0px;
    left: 320px;
    bottom: 10px;
    background: rgba(255, 255, 255, .7);

    border-top-left-radius: 1em;
    border-bottom-left-radius: 1em;

    .header {
      position: relative;

      .title {
        text-align: left;
        padding: 1em;

        font-size: 1.3em;
        font-weight: 600;
      }

      .close {
        position: absolute;
        top: .5em;
        right: .5em;
        
        button {
          color: #222;
        }
      }
    }

    .content {
      position: absolute;
      top: 4em;
      left: 1em;
      right: 1em;
      bottom: 1em;
      overflow: auto;
    }
  }
}

</style>
