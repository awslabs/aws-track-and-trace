<template>
  <div class="tyre-pressure">
    <div class="vehicle-container">
      <div class="wheel front left" :data-pressure="parsedTyres.frontLeft.pressure" :data-units="units" :class="parsedTyres.frontLeft.health"></div>
      <div class="wheel front right" :data-pressure="parsedTyres.frontRight.pressure" :data-units="units" :class="parsedTyres.frontRight.health"></div>
      <div class="wheel rear left" :data-pressure="parsedTyres.rearLeft.pressure" :data-units="units" :class="parsedTyres.rearLeft.health"></div>
      <div class="wheel rear right" :data-pressure="parsedTyres.rearRight.pressure" :data-units="units" :class="parsedTyres.rearRight.health"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'tyrePressure',
  props: ['tyres', 'units'],
  data () {
    return {
    }
  },
  computed: {
    parsedTyres () {
      const ret = {};
      for (let param in this.tyres) {
        const pressure = Math.round(this.tyres[param] * 100) / 100;
        ret[param] = {
          pressure,
          health: pressure < 29 || pressure > 37 ? 'error' : pressure < 32 || pressure > 35 ? 'warning' : 'healthy'
        }
      }
      return ret
    }
  },
  methods: {
    getTyreHealth (value) {
      return 'healthy';
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
    margin: 1.2em auto;
    width: 174px;
    height: 87px;
    background: url('../assets/vehicle-top.png') center center no-repeat;
    background-size: 100% 100%;

    .recommended-pressure {
      position: absolute;
      top: 50%;
      margin-top: -1em;
      text-align: center;
      color: red;
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
      width: 28px;
      height: 15px;
      border-radius: 3px;

      background-position: center center;
      background-repeat: no-repeat;
      background-size: 100% 100%;

      &::before {
        position: absolute;
        left: -.25em;
        width: 100%;
        text-align: center;
        font-size: 0.9em;
        color: #879196;
        content: attr(data-pressure)attr(data-units);
      }

      &.rear {
        right: 10.3%;
      }

      &.front {
        left: 13.5%;
      }

      &.right {
        top: 10px;

        &::before {
          top: -1.5em;
        }
      }

      &.left {
        bottom: 10px;

        &::before {
          bottom: -1.5em;
        }
      }

      &.error {
        background-image: url('../assets/tyres_red.png');
      }

      &.warning {
        background-image: url('../assets/tyres_yellow.png');
      }

      &.healthy {
        background-image: url('../assets/tyres_green.png');
      }
    }
  }
}

</style>
