<template>
  <div class="fleet-landing">
    <div class="block-header">
      <h2>Platform subscriptions</h2>
    </div>
    <div class="block-content block-content-full subscriptions">
      <div class="row">
        <div class="col" v-for="(plan, index) in usagePlans" :key="index">
          <usage-plan :plan="plan"></usage-plan>
        </div>
        
      </div>
    </div>

    <div class="block-header">
      <h2>Vehicle onboarding</h2>
    </div>
    <div class="block-content block-content-full">
      <div class="row">
        <div class="col-6">
          <meta-form :metadata="forms.virtualVehicle"></meta-form>
        </div>
        <div class="col-6">
          <meta-form :metadata="forms.realVehicle"></meta-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as vinGenerator from 'vin-generator';

import MetaForm from '@/components/Form';
import UsagePlan from '@/components/UsagePlan';

import VehicleService from '@/services/VehicleService';

export default {
  name: 'fleetLanding',
  components: {
    MetaForm,
    UsagePlan
  },
  data () {
    return {
      forms: {
        realVehicle: {
          title: 'Connect your vehicles',
          icon: 'fas fa-car',
          model: {
            vin: null,
            HomeAddress: null,
            WorkAddress: null,
            VehicleType: null
          },
          fields: [
            {
              id: 'rv-user',
              model: 'Username',
              type: 'text',
              label: 'Owner username',
              hint: 'The username in the current platform',
              placeholder: 'Username of the owner',
              required: true
            },
            {
              id: 'rv-pass',
              model: 'Password',
              type: 'password',
              label: 'Owner password',
              hint: 'The password in the current platform',
              placeholder: 'Password of the owner',
              required: true
            }
          ],
          actions: [
            {
              id: 'submit',
              type: 'submit',
              label: 'Connect',
              icon: 'fas fa-plug',
              style: 'btn-outline-primary'
            }
          ]
        },
        virtualVehicle: {
          title: 'Provision virtual vehicle',
          icon: 'fas fa-plus',
          fields: [
            {
              id: 'vv-vin',
              model: 'vin',
              type: 'text',
              label: 'Vehicle VIN',
              hint: 'Generate a VIN for your vehicle',
              placeholder: 'VIN of the vehicle',
              required: true,
              action: {
                icon: 'fas fa-cog',
                handler: model => {
                  return vinGenerator.generateVin()
                }
              }
            },
            {
              id: 'vv-type',
              model: 'VehicleType',
              type: 'select',
              label: 'Vehicle type',
              hint: 'Select the type of vehicle',
              required: true,
              options: [
                {
                  value: null,
                  label: 'Select a vehicle type'
                },
                {
                  value: 'suv',
                  label: 'SUV'
                },
                {
                  value: 'sport',
                  label: 'Sports car'
                }
              ]
            }
          ],
          model: {
            vin: null,
            HomeAddress: null,
            WorkAddress: null,
            VehicleType: null
          },
          actions: [
            {
              id: 'submit',
              type: 'submit',
              label: 'Provision',
              icon: 'fas fa-magic',
              style: 'btn-outline-primary',
              handler: (data) => {
                this.provisionVirtualVehicle(data);
              }
            }
          ]
        }
      },
      usagePlans: [
        {
          name: 'Developer plan',
          headerStyle: 'bg-danger',
          price: '$0.01',
          period: 'per month',
          characteristics: [
            '<strong>1</strong> Virtual vehicle',
            '<strong>$5</strong>/month each real vehicle',
            '<strong>$0.1</strong> per remote command',
            '<strong>$0.5</strong> per diagnostics',
            '<strong>2.5Gb</strong> analytics usage'
          ],
          action: {
            icon: 'fas fa-code',
            text: 'Buy',
            style: 'btn-outline-danger'
          }
        },
        {
          name: 'Standard plan',
          headerStyle: 'bg-primary',
          price: '$0.02',
          period: 'per month',
          characteristics: [
            '<strong>3</strong> Virtual vehicles',
            '<strong>1</strong> Real vehicle',
            '<strong>3</strong> remote commands',
            '<strong>$0.5</strong> per diagnostics',
            '<strong>2.5Gb</strong> analytics usage'
          ],
          action: {
            icon: 'fas fa-circle',
            text: 'Buy',
            style: 'btn-outline-primary'
          }
        },
        {
          name: 'Gold plan',
          headerStyle: 'bg-warning',
          price: '$0.03',
          period: 'per month',
          characteristics: [
            '<strong>10</strong> Virtual vehicles',
            '<strong>3</strong> Real vehicles',
            '<strong>10</strong> remote commands',
            '<strong>1</strong> diagnostics',
            '<strong>2.5Gb</strong> analytics usage'
          ],
          action: {
            icon: 'fas fa-check',
            text: 'Buy',
            style: 'btn-outline-warning'
          }
        },
        {
          name: 'Executive plan',
          headerStyle: 'bg-dark',
          price: '$0.04',
          period: 'per month',
          characteristics: [
            '<strong>Unlimited</strong> Virtual vehicles',
            '<strong>Unlimited</strong> Real vehicles',
            '<strong>Unlimited</strong> remote commands',
            '<strong>10</strong> diagnostics',
            '<strong>Unlimited</strong> analytics usage'
          ],
          action: {
            icon: 'far fa-gem',
            text: 'Buy',
            style: 'btn-outline-dark'
          }
        }
      ]
    }
  },
  created () {
    this.vehicleService = VehicleService.getInstance();
  },
  methods: {
    async provisionVirtualVehicle (data) {
      try {
        const result = await this.vehicleService.provisionVirtualVehicle(data);
      } catch (e) {
        console.error(e);
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.fleet-landing {
}

</style>
