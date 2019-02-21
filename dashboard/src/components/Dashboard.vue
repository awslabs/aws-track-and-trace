<template>
  <div class="dashboard">

    <div class="fixed-logo"></div>
    <!-- END Sidebar -->

    <!-- Header -->
    <!-- <page-header></page-header> -->
    <!-- END Header -->

    <!-- Main Container -->
    <main id="main-container" :class="{ sidebar: $route.meta.sidebar }">
      <!-- Page Content -->
      <div class="content">
        <fleet-map v-if="$route.meta.visual === 'fleet-map'" :enable-overlay-menu="true"></fleet-map>
        <vehicle-status v-if="$route.meta.visual === 'vehicle-status'"></vehicle-status>
      </div>
    </main>
    <footer></footer>
  </div>
</template>

<script>
import FleetMap from '@/components/FleetMap';
import Footer from '@/components/Footer';
import VehicleStatus from '@/components/VehicleStatus';

import IotService from '@/services/IotService';

export default {
  name: 'dashboard',
  components: {
    FleetMap,
    Footer,
    VehicleStatus
  },
  data () {
	  return {
      page: this.$route.params.page
	  }
  },
  created () {
    this.iotService = IotService.getInstance();
  },
  mounted () {
    this.prepareAccount();
  },
  methods: {
    async prepareAccount () {
      const status = await this.iotService.prepareAccount();
    },

    processMessage (topic, payload) {
      // debugger
    }
  },
  watch: {
    $route (to, from) {
      this.page = to.params.page;
      this.$forceUpdate();
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.dashboard {
  .fixed-logo {
    position: fixed;
    top: 10px;
    left: 0px;
    width: 300px;
    height: 70px;
    z-index: 10;
    background: rgba(255, 255, 255, 0.7) url('../assets/logo-w-text.png') 10px 5px no-repeat;
    background-size: 218px 60px;
    border-top-right-radius: 35px;
    border-bottom-right-radius: 35px;

    .back-button {
      position: absolute;
      top: 10px;
      left: 10px;
      font-size: 1.5em;
    }
  }

  #main-container {
    position: absolute;
    top: 0px;
    right: 0px;
    bottom: 0px;

    &.sidebar {
      left: 230px;
    }

    &:not(.sidebar) {
      left: 0px;
    }
  }


  .content {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    margin: 0px;
    padding: 0px;
  }
}

</style>
