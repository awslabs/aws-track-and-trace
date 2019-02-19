<template>
  <div class="fleet-table">
    <div class="block-header">
      <h2>My fleet</h2>
    </div>
    <div class="block-content block-content-full subscriptions">
      <table class="table table-bordered table-striped table-vcenter js-dataTable-full dataTable no-footer">
        <thead>
          <tr role="row">
            <th>Status</th>
            <th>VIN</th>
            <th>Type</th>
            <th>Fleet</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(vehicle, index) in vehicleList" :key="index">
            <td>
              <i class="fas fa-circle" :class="{ 'text-danger': vehicle.VehicleStatus === 'error', 'text-warning': vehicle.VehicleStatus === 'awaiting-deployment', 'text-success': vehicle.VehicleStatus === 'deployed' }"></i>
            </td>
            <td>{{ vehicle.vin }}</td>
            <td>
              <span class="badge" :class="{ 'badge-success': vehicle.VehicleType === 'compact', 'badge-danger': vehicle.VehicleType === 'sport', 'badge-primary': vehicle.VehicleType === 'suv' }">
                {{ vehicle.VehicleType }}
              </span>
            </td>
            <td>{{ vehicle.Fleet }}</td>
            <td>
              <button v-if="vehicle.VehicleStatus === 'awaiting-deployment'" @click="deployVirtualVehicle(vehicle)" class="btn btn-outline-success btn-sm">
                <i class="fas fa-magic"></i>
                Deploy
              </button>
              <router-link v-if="vehicle.VehicleStatus === 'deployed'" :to="`/dashboard/vehicle-status/${vehicle.vin}`" class="btn btn-outline-primary btn-sm">
                <i class="fas fa-tachometer-alt"></i>
              </router-link>
              <router-link v-if="vehicle.VehicleStatus === 'deployed'" :to="`/dashboard/vehicle-status/${vehicle.vin}`" class="btn btn-outline-warning btn-sm">
                <i class="fas fa-exclamation-triangle"></i>
              </router-link>
              <router-link v-if="vehicle.VehicleStatus === 'deployed'" :to="`/dashboard/vehicle-status/${vehicle.vin}`" class="btn btn-outline-danger btn-sm">
                <i class="fas fa-times"></i>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import VehicleService from '@/services/VehicleService';

export default {
  name: 'fleetTable',
  data () {
    return {
      vehicleList: []
    }
  },
  created () {
    this.vehicleService = VehicleService.getInstance();
  },
  mounted () {
    this.fetchData();
  },
  methods: {
    async fetchData () {
      this.vehicleList = await this.vehicleService.listMyVehicles();
    },

    async deployVirtualVehicle (vehicle) {
      await this.vehicleService.deployVirtualVehicle(vehicle);
      this.fetchData();
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.fleet-table {
}

</style>
