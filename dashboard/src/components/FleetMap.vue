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
        v-for="(vehicle, index) in vehicles"
        :position="parseLocation(vehicle)"
        :clickable="true"
        :draggable="false"
        @click="clickVehicle(vehicle)"
        :icon="getMapIcon(vehicle)"
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
        @click="clickVehicle(vehicle)"
      />
    </GmapMap>
    <div class="map-overlay-menu" v-if="config.overlayMenu">
      <div class="block-header">
        <h3 class="block-title">
          Fleet Overview
        </h3>
      </div>
      <div class="block-content block-content-full">
        <div class="row">
          <div class="col">
            <div class="info-item text-dark">
              <i class="fas fa-car"></i>
              {{ vehicles.length }}
            </div>
          </div>
          <div class="col">
            <div class="info-item text-warning">
              <i class="fas fa-exclamation-triangle"></i>
              {{ numAlerts }}
            </div>
          </div>
        </div>
      </div>
      <div class="block-header">
        <h3 class="block-title">
          Overlay layers
        </h3>
      </div>
      <div class="block-content block-content-full">
        <div class="row map-actions">
          <div class="col">
            <button class="btn" :class="action.classes[action.status]" v-for="(action, index) in mapActions" :key="index" @click="actionClick(action)">
              <i :class="action.icons[action.status]"></i>
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { gmapApi } from 'vue2-google-maps';
import nameGenerator from 'project-name-generator';
import randomColor from 'randomcolor';

import ConfigurationService from '@/services/ConfigurationService';
import IotService from '@/services/IotService';

export default {
  name: 'ComponentCamelName',
  props: ['mapCenter', 'mapClick', 'mapItems', 'mapZoom', 'width', 'height', 'enableOverlayMenu'],
  data () {
    return {
      config: {
        overlayMenu: this.enableOverlayMenu !== undefined ? this.enableOverlayMenu : false
      },
      zoom: this.mapZoom || 6,
      center: [-1.4776583, 52.1837845],
      url:'http://aws.amazon.com',
      attribution:'Amazon Web Services',
      mapActions: [
        {
          label: 'Inactive vehicles',
          status: 'enabled',
          icons: {
            disabled: 'far fa-circle',
            enabled: 'fas fa-circle'
          },
          classes: {
            disabled: 'btn-outline-warning',
            enabled: 'btn-warning'
          }
        },
        {
          label: 'Abandoned vehicles',
          status: 'enabled',
          icons: {
            disabled: 'far fa-circle',
            enabled: 'fas fa-circle'
          },
          classes: {
            disabled: 'btn-outline-danger',
            enabled: 'btn-danger'
          }
        },
        {
          label: 'Geo alerts',
          status: 'enabled',
          icons: {
            disabled: 'far fa-circle',
            enabled: 'fas fa-circle'
          },
          classes: {
            disabled: 'btn-outline-primary',
            enabled: 'btn-primary'
          }
        },
        {
          label: 'Add zone',
          status: 'disabled',
          icons: {
            disabled: 'fas fa-plus-circle',
            enabled: 'fas fa-plus-circle'
          },
          classes: {
            disabled: 'btn-outline-success',
            enabled: 'btn-success'
          }
        },
        {
          label: 'Clear zones',
          status: 'disabled',
          icons: {
            disabled: 'fas fa-times-circle',
            enabled: 'fas fa-times-circle'
          },
          classes: {
            disabled: 'btn-outline-danger',
            enabled: 'btn-outline-danger'
          },
          actions: {
            click: () => {
              this.clearPois();
            }
          }
        }
      ],
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
      mapMarkers: [],
      pois: [],
      vehicles: this.mapItems || [],
      warnings: []
    }
  },
  computed: {
    google: gmapApi,
    
    numAlerts () {
      const ret = this.vehicles.filter(vehicle => {
        const mapIcon = this.getMapIcon(vehicle);
        if (mapIcon.warnings && mapIcon.warnings.length) {
          return true
        }
        return false;
      });
      return ret.length;
    }
  },
  created () {
    this.configurationService = ConfigurationService.getInstance();
    // mapbox.accessToken = this.configurationService.get('MAPBOX_API_TOKEN');
    const center = this.mapCenter || this.configurationService.get('VIRTUAL_VEHICLES_CENTER');
    this.center = {
      lat: center.latitude,
      lng: center.longitude
    };

    this.iotService = IotService.getInstance();
    const vehiclesClient = this.iotService.connect();
    vehiclesClient.on('connect', () => {
      console.log('INFO: Connected to AWS Iot');
      console.log('INFO: Subscribing to topics');
      vehiclesClient.subscribe('$aws/things/+/shadow/get/accepted');
      vehiclesClient.subscribe('$aws/things/+/shadow/update/accepted');
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
  mounted () {
    if (!this.mapItems) {
      this.fetchData();
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

    clickVehicle (vehicle) {
      this.$router.push(`/dashboard/vehicle-status/${vehicle.vin}`);
    },

    configureMap () {
      this.container = this.$refs.mapContainer;
      const { offsetWidth, offsetHeight } = this.container;

      this.mapStyle = {
        width: `${this.width || offsetWidth}px`,
        height: `${this.height || offsetHeight}px`
      };

      
    },

    async fetchData () {
      console.log('INFO: Fetching vehicles');
      console.warn('WARN: This is not implemented');
    },

    getMapIcon (vehicle) {
      const warnings = [];
      let tyresOk = true;
      const currentDate = (new Date().getTime() / 1000) | 0;

      if (vehicle.systems && vehicle.systems.tyres) {
        const lastUpdateTime = vehicle.systems.engine ? vehicle.systems.engine.lastSleepCycle : vehicle.location.lastUpdated;
        
        if (lastUpdateTime < currentDate - 10*86400) {
          const scale = this.mapActions[1].status === 'enabled' ? 10 : 0;

          return {
            path: this.google.maps.SymbolPath.CIRCLE,
            scale,
            fillColor: 'red',
            fillOpacity: 1,
            strokeWeight: 0,
            strokeColor: 'red'
          }
        } else if (lastUpdateTime < currentDate - 5*86400) {
          const scale = this.mapActions[0].status === 'enabled' ? 8 : 0;

          return {
            path: this.google.maps.SymbolPath.CIRCLE,
            scale,
            fillColor: 'orange',
            fillOpacity: 1,
            strokeWeight: 0,
            strokeColor: 'orange'
          }
        } else {
          for (let tyreName in vehicle.systems.tyres) {
            const tyre = vehicle.systems.tyres[tyreName];
            if (tyre > 36 || tyre < 32) {
              warnings.push(`tyres-critical-values-${tyreName}`);
              console.log(`Vehicle ${vehicle.vin} has tyre alert on tyre ${tyreName}. Value: ${tyre}`);
            } 
          }
        }
      } else if (vehicle.tyres) {
        vehicle.tyres.forEach(tyre => {
          if (tyre > 36 || tyre < 32) {
            warnings.push(`tyres-critical-values-${tyreName}`);
            console.log(`Vehicle ${vehicle.vin} has tyre alert on tyre ${tyreName}. Value: ${tyre}`);
          }
        });
      }

      const scale = warnings && warnings.length ? 8 : 6;
      const fillColor = warnings && warnings.length ? 'yellow' : '#444';
      const fillOpacity = warnings && warnings.length ? .9 : 1;
      const strokeWeight = 2;
      const strokeColor = vehicle.VehicleType === 'amazon' ? '#f29837' : '#444';
      return {
        path: this.google.maps.SymbolPath.CIRCLE,
        scale,
        fillColor,
        fillOpacity,
        strokeWeight,
        strokeColor,
        warnings
      };
    },

    parseLocation (vehicle) {
      const location = vehicle.location;
      if (location.latitude) {
        return {
          lat: location.latitude,
          lng: location.longitude
        }
      } else if (location instanceof Array) {
        return {
          lat: location[0],
          lng: location[1]
        }
      }
    },

    processMessage (topic, payload) {
      const vin = topic.split('/')[2];
      const data = topic.indexOf('$aws') === 0 ? payload.state.reported : payload;
      const item = this.vehicles.filter(item => item.vin === vin)[0];
      if (item) {
        console.log('INFO: Received request from vehicle to update location')
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

    renderMarkers () {
      this.mapMarkers.forEach(marker => {
        marker.remove();
      });

      this.mapMarkers = this.vehicles.map(marker => {
        // Parse AMZN vehicle location
        // TODO Remove this
        // const marker = markerRef.hasOwnProperty('battery') ? {
        //   ...markerRef,
          
        // } : markerRef;

        let tyresOk = true;
        for (let tyreName in marker.systems.tyres) {
          const tyre = marker.systems.tyres[tyreName];
          if (tyre > 38 || tyre < 29) {
            if (!marker.warnings) marker.warnings = [];
            marker.warnings.push('tyres-critical-values');
          } else if (tyre < 32 || tyre > 35) {
            if (!marker.warnings) marker.warnings = [];
            marker.warnings.push('tyres-values-beyond-limits');
          }
        }

        const el = document.createElement('div')
        el.setAttribute('class', `marker ${marker.VehicleType}`);

        const icon = document.createElement('div');
        icon.setAttribute('class', 'icon');
        icon.setAttribute('style', `transform: rotate(${90+marker.location.bearing}deg)`);
        icon.addEventListener('click', event => {
          this.clickVehicle(marker);
        });
        el.appendChild(icon);

        const alerts = document.createElement('div');
        alerts.setAttribute('class', `alerts ${marker.warnings ? 'errors' : marker.warnings ? 'warnings' : ''}`);
        alerts.setAttribute('style', `transform: rotate(${-1*(90+marker.location.bearing)}deg)`);
        icon.appendChild(alerts);

        const mapMarker = new mapbox.Marker(el);
        mapMarker.setLngLat([marker.location.longitude, marker.location.latitude]);
        mapMarker.addTo(this.map);

        return mapMarker;
      });

      this.resizeMarkers();
    },

    resizeMarkers () {
      const zoom = this.map.getZoom();
      this.mapMarkers.forEach(marker => {
        const element = marker.getElement();
        element.style.width = `${5 * zoom}px`;
        element.style.height = `${2.47 * zoom}px`;
      });
    }
  },
  watch: {
    // vehicles () {
    //   // this.renderMarkers();
    // }
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
}

</style>
