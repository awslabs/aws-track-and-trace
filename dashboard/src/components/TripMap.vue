<template>
  <div class="trip-map" ref="mapContainer">
    <div id="map" :style="mapStyle"></div>
  </div>
</template>

<script>
import mapbox from 'mapbox-gl';

import ConfigurationService from '@/services/ConfigurationService';
import IotService from '@/services/IotService';
import VehicleService from '@/services/VehicleService';

export default {
  name: 'ComponentCamelName',
  data () {
    return {
      zoom: 12,
      center: [-1.4776583, 52.1837845],
      url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      marker: [-1.219482, 47.413220],
      mapStyle: {
        width: '2000px',
        height: '2000px'
      },
      mapMarkers: [],
      vehicles: []
    }
  },
  created () {
    this.configurationService = ConfigurationService.getInstance();
    mapbox.accessToken = this.configurationService.get('MAPBOX_API_TOKEN');
    this.mapboxStyle = this.configurationService.get('MAPBOX_STYLE');

    this.iotService = IotService.getInstance();
    this.vehicleService = VehicleService.getInstance();
  },
  mounted () {
    this.fetchData();
    this.configureMap();
  },
  methods: {
    clickVehicle (vehicle) {
      this.$router.push(`/dashboard/vehicle-status/${vehicle.vin}`);
    },

    configureMap () {
      this.container = this.$refs.mapContainer;
      const { offsetWidth, offsetHeight } = this.container;

      this.mapStyle = {
        width: `${offsetWidth}px`,
        height: `${offsetHeight}px`
      };

      this.map = new mapbox.Map({
        zoom: this.zoom,
        center: this.center,
        container: 'map',
        style: 'mapbox://styles/mapbox/light-v9'
      });

      this.map.on('zoomend', () => {
        this.resizeMarkers();
      });

      this.container.addEventListener('resize', () => {
        this.map.resize();
      });

      setTimeout(() => {
        this.map.resize();
        this.renderMarkers();
      }, 1000)
    },

    async fetchData () {
      const allVehicles = await this.vehicleService.listMyVehicles();
      const vehicles = allVehicles.filter(vehicle => vehicle.VehicleStatus === 'deployed');
      const status = await this.iotService.getAllVehicleStatus(vehicles);
      this.vehicles = status;
    },

    renderMarkers () {
      this.mapMarkers.forEach(marker => {
        marker.remove();
      });

      this.mapMarkers = this.vehicles.map(marker => {
        const el = document.createElement('div')
        el.setAttribute('class', `marker ${marker.VehicleType}`);

        const icon = document.createElement('div');
        icon.setAttribute('class', 'icon');
        icon.setAttribute('style', `transform: rotate(${marker.location.bearing}deg)`);
        icon.addEventListener('click', event => {
          this.clickVehicle(marker);
        });
        el.appendChild(icon);

        const alerts = document.createElement('div');
        alerts.setAttribute('class', `alerts ${marker.errors ? 'errors' : marker.warnings ? 'warnings' : ''}`);
        alerts.setAttribute('style', `transform: rotate(${-1*marker.location.bearing}deg)`);
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
    vehicles () {
      this.renderMarkers();
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">

.trip-map {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;

  #trip-map {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;

    #map {
      position: absolute;
      top: 0px;
      left: 0px;
      bottom: 0px;
      right: 0px;
      text-align: left;
    }
  }
}

</style>