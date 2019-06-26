<template>
  <div class="sensor">
    <div class="title">{{ sensor.SensorName }}</div>
    <div class="stats">
      <line-chart :chart-data="chartData" :options="chartOptions"></line-chart>
    </div>
  </div>
</template>

<script>
import LineChart from '@/components/LineChart';

export default {
  name: 'sensorHistory',
  props: ['asset', 'sensor'],
  components: {
    LineChart
  },
  data () {
    return {
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        styles: {
          height: '100px',
          background: 'red'
        }
      }
    }
  },
  computed: {
    chartData () {
      const ret = {
        datasets: [{
          data: [
            1, 2, 3, 4, 3, 2, 1,

          ],
          lineColor: ['#df3312', '#1e8900'],
          fill: false
        }],

        labels: [
          1,
          2
        ]
      };

      return ret;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.sensor {
  position: relative;
  margin: 1em;

  .title {
    text-align: left;
    font-size: .9em;
    font-weight: bold;
  }

  .stats {
    position: relative;
    width: 100%;
    max-height: 300px;
  }
}

</style>
