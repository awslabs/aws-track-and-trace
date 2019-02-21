<template>
  <div class="tyre-pressure">
    <div class="vehicle-container" :class="vehicle.VehicleType">
      <!-- <div class="recommended-pressure rear">
        {{ tyres.rearLeft }} Bar
      </div>
      <div class="recommended-pressure front">
        {{ tyres.frontLeft }} Bar
      </div> -->
      <div class="wheel front left" :data-pressure="parsedTyres.frontLeft.pressure" :class="parsedTyres.frontLeft.health"></div>
      <div class="wheel front right" :data-pressure="parsedTyres.frontRight.pressure" :class="parsedTyres.frontRight.health"></div>
      <div class="wheel rear left" :data-pressure="parsedTyres.rearLeft.pressure" :class="parsedTyres.rearLeft.health"></div>
      <div class="wheel rear right" :data-pressure="parsedTyres.rearRight.pressure" :class="parsedTyres.rearRight.health"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'tyrePressure',
  props: ['vehicle'],
  data () {
    return {
    }
  },
  computed: {
    parsedTyres () {
      const ret = {};
      for (let param in this.vehicle.systems.tyres) {
        const pressure = Math.round(this.vehicle.systems.tyres[param] * 100) / 100;
        ret[param] = {
          pressure,
          health: pressure < 29 || pressure > 37 ? 'error' : pressure < 32 || pressure > 35 ? 'warning' : 'healthy'
        }
      }
      return ret
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import '../assets/colors.scss';

.tyre-pressure {
  width: 100%;
  height: 100%;
  display: block;

  .vehicle-container {
    position: relative;
    width: 80%;
    margin: 0em auto;
    max-width: 400px;
    min-height: 200px;

    .recommended-pressure {
      position: absolute;
      top: 50%;
      margin-top: -1em;
      text-align: center;
      color: $tyre-pressure-recommended-text-color;
      transform: rotate(90deg);
      white-space: nowrap;

      &::after {
        content: 'recommended';
      }

      &.front {
        left: 100%;
        margin-left: -4em;
      }

      &.rear {
        right: 100%;
        margin-right: -4em;
      }
    }

    .wheel {
      position: absolute;
      width: 50px;
      height: 16px;
      border-radius: 3px;

      &::before {
        position: absolute;
        left: 0px;
        width: 100%;
        text-align: center;
        font-size: 1.2em;
        content: attr(data-pressure)'psi';
      }

      &.rear {
        right: 10%;
      }

      &.front {
        left: 15%;
      }

      &.right {
        top: 3px;

        &::before {
          top: -1.5em;
        }
      }

      &.left {
        bottom: 3px;

        &::before {
          bottom: -1.5em;
        }
      }

      &.error {
        background: url('../assets/tyres_red.png') center center no-repeat;
        background-size: 100% auto;
      }

      &.warning {
        background: url('../assets/tyres_yellow.png') center center no-repeat;
        background-size: 100% auto;
      }

      &.healthy {
        background: url('../assets/tyres_green.png') center center no-repeat;
        background-size: 100% auto;
      }
    }
  }
}

</style>
