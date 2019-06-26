<template>
  <div class="fleet-map-menu">
    <div class="sections">
      <button class="home btn btn-link" title="Home" :class="{ active: config.menuSection === 'home' }" @click="setSection('home')">
        <i class="fas fa-home"></i>
      </button>
      <button class="stats btn btn-link" title="Statistics" :class="{ active: config.menuSection === 'stats' }" @click="setSection('stats')">
        <i class="fas fa-chart-line"></i>
      </button>
      <button class="config btn btn-link" title="Settings" :class="{ active: config.menuSection === 'config' }" @click="setSection('config')">
        <i class="fas fa-cog"></i>
      </button>
    </div>
    <div class="menu config" v-if="config.menuSection === 'config'">
      <div class="category topics">
        <meta-form :metadata="forms.topics"></meta-form>
      </div>
      <div class="category assets">
        <meta-form :metadata="forms.assetOnboarding"></meta-form>
      </div>
      <div class="category management">
        <h3 class="title">
          <i class="fas fa-cog"></i>
          Management
        </h3>
        <div class="content-wrapper">
          <button class="btn btn-link">
            <i class="fas fa-table"></i>
            My assets
          </button>
          <button class="btn btn-link">
            <i class="fas fa-users"></i>
            My users
          </button>
        </div>
      </div>
    </div>
    <div class="menu stats" v-else-if="config.menuSection === 'stats'">
      <div class="category assets">
        <h3 class="title">
          <i class="fas fa-microchip"></i>
          Asset statistics
        </h3>
        <div class="content-wrapper">
          <div class="asset" v-for="(asset, index) in assets" :key="index">
            <div class="title">
              {{ asset.$inventory.AssetId | shortify }}
            </div>
            <div class="metrics" v-if="asset.$metrics.successes.length || asset.$metrics.errors.length">
              <doughnut-chart :chart-data="asset | chartData"></doughnut-chart>
            </div>
            <div class="metrics no-metrics" v-else>
              No metrics available
            </div>
            <div class="last-message" :class="getAssetStyle(asset).class">
              <i :class="getAssetStyle(asset).icon"></i>
              {{ asset | lastUpdate | fromNow }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="menu home customizable-menu" v-else>
      <!-- Customize the menu here -->
    </div>
  </div>
</template>

<script>
import moment from 'moment';

import DoughnutChart from '@/components/DoughnutChart';
import MetaForm from '@/components/Form';

import AssetService from '@/services/AssetService';
import ConfigurationService from '@/services/ConfigurationService';
import DdbService from '@/services/DdbService';
import FrameworkService from '@/services/FrameworkService';
import IotService from '@/services/IotService';

export default {
  name: 'fleetMapMenu',
  components: {
    DoughnutChart,
    MetaForm
  },
  props: ['assets', '@onUpdate'],
  data () {
    return {
      config: {
        overlayMenu: this.enableOverlayMenu !== undefined ? this.enableOverlayMenu : false,
        menuSection: 'home'
      },
      forms: {
        assetOnboarding: {
          title: 'Asset onboarding',
          icon: 'fas fa-rocket',
          fields: [
            {
              id: 'thingName',
              type: 'text',
              label: 'Thing name',
              placeholder: 'MyAsset1',
              hint: 'The thing name in AWS IoT',
              // action: {
              //   icon: 'fas fa-plug',
              //   style: 'btn-link',
              //   handler: async (data) => {
              //     this.connectThing(data.thingName)
              //   }
              // }
            },
            {
              id: 'locationField',
              type: 'text',
              label: 'Location variable',
              placeholder: 'systems.gps.location',
              hint: 'Path to the location variable'
            }
          ],
          model: {
            thingName: '',
            locationField: ''

          },
          actions: [
            {
              label: 'Onboard',
              icon: 'fas fa-rocket',
              style: 'btn-success',
              handler: async (data) => {
                const ret = await this.onboardDevice(data);
                this.forms.assetOnboarding.model = {
                  thingName: '',
                  locationField: ''
                }
              }
            }
          ]
        },
        topics: {
          title: 'Topic information',
          icon: 'far fa-comments',
          fields: [
            {
              id: 'telemetryPrefix',
              placeholder: 'Telemetry prefix',
              type: 'text',
              hint: 'e.g. myfleet/telemetry/'
            }
          ],
          model: {
            telemetryPrefix: ''
          },
          actions: [
            {
              label: 'Save',
              icon: 'fas fa-save',
              style: 'btn-success'
            }
          ]
        }
      }
    }
  },
  created () {
    this.assetService = AssetService.getInstance();
    this.configService = ConfigurationService.getInstance();
    this.ddb = DdbService.getInstance();
    this.fwk = FrameworkService.getInstance();
    this.iot = IotService.getInstance();

    this.inventoryTableName = this.configService.get('INVENTORY_ASSETS_TABLE_NAME');
  },
  mounted () {
    // Configure auto-refresh
    setInterval(() => {
      this.$forceUpdate();
    }, 1000);
  },
  filters: {
    chartData (asset) {
      const ret = {
        datasets: [{
          data: [
            asset.$metrics.errors.length, 
            asset.$metrics.successes.length
          ],
          backgroundColor: ['#df3312', '#1e8900']
        }],

        labels: [
          'Error',
          'OK'
        ]
      };

      return ret;
    },

    fromNow (value) {
      return moment(value).fromNow();
    },

    lastUpdate (asset) {
      const location = this.assetService.getAssetLocation(asset);
      return location.$metadata.latitude.timestamp * 1000
    },

    shortify (value, maxLength = 20) {
      if (value.length < maxLength) return value;

      const prefixIndex = maxLength * .25 | 0;
      const suffixIndex = maxLength * .5 | 0;

      const diff = maxLength - (suffixIndex - prefixIndex);
      if (diff < 0) {
        return value; 
      }

      return `${value.substring(0, prefixIndex)}...${value.substring(suffixIndex)}`;
    }
  },
  methods: {
    getAssetStyle (asset) {
      const lastUpdate = this.filters.lastUpdate(asset);
      const now = new Date().getTime();

      const diff = now - lastUpdate;

      const retStr = diff < 60000 ? 'ok' : diff < 86400000 ? 'warning' : 'error';

      const ret = {
        class: retStr,
        icon: ''
      };

      switch (retStr) {
        case 'ok':
          ret.icon = 'far fa-check-circle'
        case 'warning':
          ret.icon = 'fas fa-exclamation-triangle'
        case 'error':
          ret.icon = 'fas fa-exclamation-circle';
      }
      
      return ret;
    },
    
    async onboardDevice (device) {
      const deviceStatus = await this.iot.getAssetStatus(device.thingName);

      const AssetId = device.thingName;
      const deviceData = {
        AssetId,
        LocationField: device.locationField
      };

      try {
        const result = await this.ddb.put(this.inventoryTableName, { AssetId }, deviceData);
        this.fwk.addAlert('success', `Successfully registered device ${AssetId}`);
        this.onUpdate();
      } catch (e) {
        this.fwk.addAlert('danger', `Failed to register device ${AssetId}`);
      }

    },

    setSection (section) {
      this.config.menuSection = section;
    }
  },
  watch: {
    asset: {
      handler: () => {
        debugger
        this.$forceUpdate()
      },
      deep: true
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.fleet-map-menu {
  .sections {
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    margin: 0;

    button {
      &.active {
        color: #444;
      }
    }
  }

  .menu {
    &.customizable-menu {
      &:empty {
          margin: 0 1em;
          min-height: 300px;
          border: 2px dashed #aaa;
          display: flex;
          justify-content: center;
          align-items: center;
          
          &::before {
            content: 'Customize this menu';
          }
      }
    }

    .category {
      margin: 1em .5em .5em .5em;

      .title {
        font-size: 1.2em;
        text-transform: uppercase;
        text-align: left;
      }

      .content-wrapper {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
      }
    }
    
    &.stats {
      
      .content-wrapper {
        justify-content: flex-start;
        flex-wrap: wrap;

        .asset {
          margin: .25em;
          padding: .5em;
          border-radius: 3px;
          text-align: left;
          background: rgba(255, 255, 255, .8);

          .title {
            font-size: .8em;
            font-weight: bold;
          }

          .metrics {
            margin: .5em 0;
            width: 225px;

            &.no-metrics {
              text-align: center;
              // margin: .5em;
              border: 2px dashed #ddd;
              padding: 7em 2em;
              border-radius: 100%;
              color: #aaa;
              font-size: .9em;
            }
          }

          .last-message {
            margin-top: .5em;
            font-size: .8em;
            text-align: center;

            &.ok {
              color: #1e8900;
            }

            &.warning {
              color: #eb5f07;
            }

            &.error {
              color: #df3312;
            }
          }
        }
      }
    }
  }
}

</style>
