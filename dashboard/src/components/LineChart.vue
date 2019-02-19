<script>
import { Line } from 'vue-chartjs'

export default {
  extends: Line,
  props: ['chart-config'],
  data () {
    return {
      config: {}
    }
  },
  mounted () {
    this.chartOptions = {
      responsive: true, 
      maintainAspectRatio: false,
      scales: {
        yAxes: [{
          ticks: {
            suggestedMin: 0,
            suggestedMax: 10
          }
        }]
      }
    }

    this.renderChart(this.chartConfig, this.chartOptions)
  },
  watch: {
    chartConfig () {
      this.renderChart(this.chartConfig, this.chartOptions)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.line-chart {
}

</style>
