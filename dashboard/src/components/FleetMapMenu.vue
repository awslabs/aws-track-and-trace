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
      TODO
    </div>
    <div class="menu home customizable-menu" v-else>
      <!-- Customize the menu here -->
    </div>
  </div>
</template>

<script>
import MetaForm from '@/components/Form';

import ConfigurationService from '@/services/ConfigurationService';
import DdbService from '@/services/DdbService';
import FrameworkService from '@/services/FrameworkService';
import IotService from '@/services/IotService';

export default {
  name: 'fleetMapMenu',
  components: {
    MetaForm
  },
  props: ['assets'],
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
    this.config = ConfigurationService.getInstance();
    this.ddb = DdbService.getInstance();
    this.fwk = FrameworkService.getInstance();
    this.iot = IotService.getInstance();

    this.inventoryTableName = this.config.get('INVENTORY_ASSETS_TABLE_NAME');
  },
  methods: {
    async onboardDevice (device) {
      const deviceStatus = await this.iot.getAssetStatus(device.thingName);

      const latitude = eval(`deviceStatus.${device.locationField}.latitude`);
      const longitude = eval(`deviceStatus.${device.locationField}.longitude`);
      this.assets.push({
        ...device,
        location: {
          latitude, longitude
        }
      });

      const AssetId = device.thingName;
      const deviceData = {
        AssetId,
        LocationField: device.locationField
      };

      try {
        const result = await this.ddb.put(this.inventoryTableName, { AssetId }, deviceData);
        this.fwk.addAlert('success', `Successfully registered device ${AssetId}`);
      } catch (e) {
        this.fwk.addAlert('danger', `Failed to register device ${AssetId}`);
      }

    },

    setSection (section) {
      this.config.menuSection = section;
      this.$forceUpdate();
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

    &.config {
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
    }
  }
}

</style>
