<template>
  <div class="fleet-map" ref="mapContainer">
    <div class="map" v-if="init">
      <GmapMap
        ref="fleetMap"
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
          @click="assetClick(asset)"
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
        />
      </GmapMap>
    </div>
    <div class="map-overlay-menu" :class="{ extended: config.mapOverlayMenuExtended }">
      <div class="header">
        <button class="btn btn-link toggle-status" @click="toggleOverlayMenuStatus()">
          <i class="fas" :class="`fa-chevron-${ config.mapOverlayMenuExtended ? 'left' : 'right' }`"></i>
        </button>
      </div>
      <div class="content">
        <fleet-map-menu :assets="assets" @on-update="updateAssets()"></fleet-map-menu>
      </div>
    </div>
    <div class="map-overlay-panel" v-if="config.mapOverlayPanelSection">
      <div class="header">
        <div class="title">
          <button class="btn btn-link overview" :class="{ active: config.mapOverlayPanelSection === 'asset-overview' }" @click="config.mapOverlayPanelSection = 'asset-overview'">
            <i class="fas fa-search"></i>
            {{ config.mapOverlayPanelTitle }}
          </button>
          <!-- <button class="btn btn-link stats" :class="{ active: config.mapOverlayPanelSection === 'asset-stats' }" @click="config.mapOverlayPanelSection = 'asset-stats'">
            <i class="fas fa-chart-line"></i>
          </button> -->
          <button class="btn btn-link config" :class="{ active: config.mapOverlayPanelSection === 'asset-configuration' }" @click="config.mapOverlayPanelSection = 'asset-configuration'">
            <i class="fas fa-cog"></i>
          </button>
        </div>
        <div class="close">
          <button class="btn btn-link" @click="closeOverlayPanel()">
            <i class="fa fa-times"></i>
          </button>
        </div>
      </div>
      <div class="content">
        <asset-overview 
          :asset="config.selectedAsset" 
          v-if="config.mapOverlayPanelSection === 'asset-overview'"></asset-overview>
        <asset-configuration 
          :asset="config.selectedAsset" 
          @on-update="updateAssets()"
          v-else-if="config.mapOverlayPanelSection === 'asset-configuration'">
        </asset-configuration>
      </div>
    </div>
  </div>
</template>

<script>
import { gmapApi } from 'vue2-google-maps';
import nameGenerator from 'project-name-generator';
import randomColor from 'randomcolor';

import AssetConfiguration from '@/components/AssetConfiguration';
import AssetOverview from '@/components/AssetOverview';
import FleetMapMenu from '@/components/FleetMapMenu';

import AssetService from '@/services/AssetService';
import ConfigurationService from '@/services/ConfigurationService';
import DdbService from '@/services/DdbService';
import IotService from '@/services/IotService';

export default {
  name: 'ComponentCamelName',
  props: ['mapCenter', 'mapClick', 'mapItems', 'mapZoom', 'width', 'height', 'enableOverlayMenu'],
  components: {
    AssetConfiguration,
    AssetOverview,
    FleetMapMenu
  },
  data () {
    return {
      init: false,
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
      assets: this.mapItems || [],
      config: {
        mapOverlayMenuExtended: false,
        mapOverlayPanelSection: null,
        mapOverlayPanelTitle: null,
        selectedAsset: null
      }
    }
  },
  computed: {
    google: gmapApi,
  },
  async created () {
    this.assetService = AssetService.getInstance();
    this.configurationService = ConfigurationService.getInstance();
    this.iot = IotService.getInstance();
    this.ddb = DdbService.getInstance()

    this.assetsTableName = this.configurationService.get('INVENTORY_ASSETS_TABLE_NAME');
    this.sensorsTableName = this.configurationService.get('INVENTORY_SENSORS_TABLE_NAME');
    this.conditionsTableName = this.configurationService.get('INVENTORY_CONDITIONS_TABLE_NAME');

    const assetsClient = this.iot.connect();
    assetsClient.on('connect', async () => {
      console.log('INFO: Connected to AWS Iot');
      console.log('INFO: Subscribing to topics');
      
      assetsClient.subscribe('$aws/things/+/shadow/get/accepted');
      assetsClient.subscribe('$aws/things/+/shadow/update/accepted');

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
  async mounted () {
    if (!this.mapItems) {
      this.fetchAssets();
    }
    if (!this.init) {
      this.configureMap();
      this.init = true;
    }
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

    async assetClick (asset) {
      this.config.selectedAsset = asset;
      this.config.mapOverlayPanelSection = 'asset-overview';
      this.config.mapOverlayPanelTitle = `${asset.$inventory.AssetId}`;
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

    closeOverlayPanel () {
      this.config.selectedAsset = null;
      this.config.mapOverlayPanelSection = null;
      this.config.mapOverlayPanelTitle = null;
      this.fetchAssets();
    },

    configureMap () {
      this.container = this.$refs.mapContainer;
      const { offsetWidth, offsetHeight } = this.container;

      this.mapStyle = {
        width: `${this.width || offsetWidth}px`,
        height: `${this.height || offsetHeight}px`
      };
    },

    async createAssetDefinition (inventoryDef, stateDef) {
      console.log('INFO: Creating asset definition')

      console.log('INFO: Preparing object');
      const ret = {
        $inventory: inventoryDef,
        $state: stateDef,
        
        $metrics: {
          successes: [],
          errors: []
        }
      };

      console.log('INFO: Fetching conditions');
      const $conditions = await this.fetchConditions(ret);
      console.log('INFO: Fetching sensors');
      const $sensors = await this.fetchSensors(ret);

      ret.$conditions = $conditions;
      ret.$sensors = $sensors

      return ret
    },

    async fetchAssets () {
      console.log('INFO: Fetching assets');
      const inventoryAssets = await this.ddb.scan(this.assetsTableName);
      const assets = [];
      for (let i = 0; i < inventoryAssets.length; i++) {
        const inventoryAsset = inventoryAssets[i];
        const stateAsset = await this.iot.getAssetStatus(inventoryAsset.AssetId);

        const parsedAsset = await this.createAssetDefinition(inventoryAsset, stateAsset);
        assets.push(parsedAsset);
      }
      
      this.assets = assets;
    },

    async fetchConditions (asset) {
      console.log('INFO: Start fetching conditions');
      const keys = { '#asset': 'AssetId' };
      const values = { ':assetId': asset.$inventory.AssetId };
      const conditions = await this.ddb.query(this.conditionsTableName, '#asset = :assetId', keys, values);
      return conditions;
    },
    
    async fetchSensors (asset) {
      console.log('INFO: Start fetching sensors');
      const keys = { '#asset': 'AssetId' };
      const values = { ':assetId': asset.$inventory.AssetId };
      const sensors = await this.ddb.query(this.sensorsTableName, '#asset = :assetId', keys, values);

      const parsedSensors = sensors.map(sensor => {
        const value = this.assetService.getSensorValue(asset, sensor);
        return {
          ...sensor,
          value
        }
      });
      return parsedSensors;
    },

    getMapIcon (asset) {
      const style = this.assetService.getAssetStyle(asset);
      style.path = this.google.maps.SymbolPath[style.path];

      return style;
    },

    parseLocation (asset) {
      const location = this.assetService.getAssetLocation(asset);

      return {
        lat: location.latitude,
        lng: location.longitude
      };
    },

    processMessage (topic, payload) {
      const AssetId = topic.split('/')[2];
      const isShadow = topic.indexOf('$aws') === 0;
      const data = isShadow ? payload.state.reported : payload;
      const asset = this.assets.filter(item => item.$inventory.AssetId === AssetId)[0];
      if (asset) {
        console.log('INFO: Received request from asset to update information');
        if (!isShadow) {
          // TODO Manage
        } else {
          const mappedState = this.iot.mapAssetState(payload.state.reported, payload.metadata.reported);
          mappedState.$metadata.timestamp = payload.timestamp;
          mappedState.$metadata.version = payload.version;
          
          asset.$state = mappedState;

          asset.$metrics.successes.push(new Date().getTime());
          this.$forceUpdate();
        }
      } else {
        // Ignoring message as it's not from one of our assets
      }
    },

    toggleOverlayMenuStatus () {
      this.config.mapOverlayMenuExtended = !this.config.mapOverlayMenuExtended;
    },

    async updateAssets () {
      await this.fetchAssets();
    },

    verifyConditionMatch (asset, condition) {
      const matches = this.assetService.verifyConditionMatch(asset, condition);
      const matchClass = matches ? 'text-success fas fa-check' : 'text-danger fas fa-times';
      return {
        matches, matchClass
      };
    }
  },
  watch: {
    assets: {
      async handler () {
        const map = await this.$refs.fleetMap.$mapPromise;
        const bounds = new this.google.maps.LatLngBounds();
        const markers = this.assets.map(asset => {
          const location = this.parseLocation(asset);
          return new this.google.maps.LatLng(location.lat, location.lng);
        });
        markers.forEach(marker => bounds.extend(marker));

        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        const adjustmentNE = new this.google.maps.LatLng(ne.lat() + .05, ne.lng() + .05);
        const adjustmentSW = new this.google.maps.LatLng(sw.lat() - .05, sw.lng() - .05);
        bounds.extend(adjustmentNE);
        bounds.extend(adjustmentSW);

        map.fitBounds(bounds);
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
  height: 100%;

  .map {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
  }

  .map-overlay-menu {
    position: fixed;
    top: 10px;
    padding-top: 70px;
    left: 0px;
    min-height: 100px;
    z-index: 10;
    transition: width .1s ease-out;

    .header {
      position: absolute;
      top: 0px;
      left: 0px;
      width: 100%;
      height: 70px;
      z-index: -1;
      border-top-right-radius: 1em;
      transition: background-color .1s ease-out;
      
      .toggle-status {
        position: absolute;
        top: 23px;
        left: 270px;
        z-index: 11;
        padding: 0;
      }
    }

    .content {
      background: rgba(255, 255, 255, .7);
      padding-bottom: 1em;
      border-bottom-right-radius: 1em;
    }

    &:not(.extended) {
      width: 265px;

      .header {
        background-color: transparent;
      }
    }

    &.extended {
      width: 60%;
      max-width: 800px;
      transition: width .25s ease-in;

      .header {
        transition: background-color .25s ease-in;
        background-color: rgba(255, 255, 255, .7);
      }
    }

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

        button {
          &.overview {
            font-size: 1.3em;
            font-weight: 600;
            text-decoration: none;
          }

          &.active {
            color: #444;
          }
        }        
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
