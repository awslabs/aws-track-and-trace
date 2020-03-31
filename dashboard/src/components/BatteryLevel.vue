<template>
  <div class="visual battery-level">
    <div class="icon-container">
      <i class="icon-content" :class="{ full: level > 0.96, high: level > 0.4, mid: level > 0.11 && level <= 0.4, low: level <= 0.11 && level >= 0, unknown: level == -1  }" :style="{ width: batteryWidth + 'px' }">&nbsp;</i>
      <div class="label">{{batteryPercentLabel}}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'batteryLevel',
  props: ['level'],
  computed: {
    batteryWidth () {
      if (this.level === -1) {
        //if data hasn't loaded in yet, assume full
        return 130 * 1
      }
      return (130 * this.level)
    },
    batteryPercentLabel () {
      if (this.level === -1) {
        //if data hasn't loaded in yet
        return 'Retrieving...'
      }
      return Math.floor(this.level * 100) + '%'
    }
  },
  data () {
    return {
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

.visual.battery-level {
  position: relative;
  font-size: 1.5em;
  font-weight: 200;

  .icon-container {
    position: relative;
    display: inline-block;
    background: url('../assets/battery_outline.svg');
    background-position: left center;
    background-repeat: no-repeat;
    background-size: 100% 100%;
    margin-top: 0.2em;
    // margin-left: -15px;
    margin-bottom: 0.8em;
    width: 174px;
    height: 60px;

    .icon-content {
      position: absolute;
      top: 6px;
      left: 18px;
      width: 130px;
      bottom: 6px;
      background: #df3312;
      border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
      opacity: .75;

      &.full {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
      }

      &.low {
        background: #df3312;
      }

      &.mid {
        background: #ec7211;
      }

      &.high {
        background: #1e8900;
      }

      &.unknown {
        background: #545b64;
      }
    }

    .label {
      position: absolute;
      top: 50%;
      left: 0px;
      right: 0px;
      margin-top: -0.7em;
      text-align: center;

      font-size: 1.2em;
    }
  }

  h2.title {
    font-size: 1em;
    margin: 0;
  }

  .inline {
    position: absolute;
    right: 10pt;
    top: 10pt;
  }
}

</style>
