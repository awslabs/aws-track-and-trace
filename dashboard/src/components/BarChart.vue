<script>
import { Bar } from 'vue-chartjs'

export default {
  extends: Bar,
  props: ['chart-config'],
  mounted () {
    this.renderChart(this.chartConfig, { 
      legend: { 
        display: false 
      }, 
      responsive: true, 
      maintainAspectRatio: false 
    })

  },
  watch: {
    chartConfig () {
      this.renderChart(this.chartConfig, {
        legend: { 
          display: false
        }, 
        responsive: true, 
        maintainAspectRatio: false
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.bar-chart {
}

</style>
