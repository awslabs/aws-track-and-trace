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
    <div class="map-overlay-menu">
      <fleet-map-menu :assets="assets"></fleet-map-menu>
    </div>
    <div class="map-overlay-panel" v-if="config.mapOverlayPanelSection">
      <div class="header">
        <div class="title">{{ config.mapOverlayPanelTitle }}</div>
        <div class="close">
          <button class="btn btn-link" @click="closeOverlayPanel()">
            <i class="fa fa-times"></i>
          </button>
        </div>
      </div>
      <div class="content">
        <asset-configuration :asset="config.selectedAsset" v-if="config.mapOverlayPanelSection === 'asset-configuration'"></asset-configuration>
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
      assets: this.mapItems || [],
      config: {
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

    async assetClick (asset) {
      this.config.selectedAsset = asset;
      this.config.mapOverlayPanelSection = 'asset-configuration';
      this.config.mapOverlayPanelTitle = `Configure asset ${asset.$inventory.AssetId}`;
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
      const location = eval(`stateDef.${inventoryDef.LocationField}`);
      // TODO Manage exceptions here

      const $conditions = await this.fetchConditions(inventoryDef)
      const $sensors = await this.fetchSensors(inventoryDef, stateDef);

      const ret = {
        $inventory: inventoryDef,
        $state: stateDef,
        $conditions, 
        $sensors,

        location
      };

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
      const values = { ':assetId': asset.AssetId };
      const conditions = await this.ddb.query(this.conditionsTableName, '#asset = :assetId', keys, values);
      return conditions;
    },
    
    async fetchSensors (asset, state) {
      console.log('INFO: Start fetching sensors');
      const keys = { '#asset': 'AssetId' };
      const values = { ':assetId': asset.AssetId };
      const sensors = await this.ddb.query(this.sensorsTableName, '#asset = :assetId', keys, values);

      const parsedSensors = sensors.map(sensor => {
        const value = eval(`state.${sensor.ValueField}`);
        return {
          ...sensor,
          value
        }
      });
      return parsedSensors;
    },

    getMapIcon (asset) {
      const style = asset.$inventory.MarkerStyle;
      if (!style) {
        return {
          path: this.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#444',
          fillOpacity: 1,
          strokeWeight: 0,
          strokeColor: '#444'
        }
      }
      const parsedStyle = JSON.parse(style);

      const ret = { ...parsedStyle };
      ret.path = this.google.maps.SymbolPath[parsedStyle.path];

      const conditions = asset.$conditions
        .filter(condition => this.verifyConditionMatch(asset, condition).matches)
        .reverse()
        .map(condition => JSON.parse(condition.StyleOverrides))
        .reduce((total, item) => ({ ...total, ...item }), ret)

      return conditions;
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
    },

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
      
      const matchClass = matches ? 'text-success fas fa-check' : 'text-danger fas fa-times';

      return {
        matches, matchClass
      };
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
