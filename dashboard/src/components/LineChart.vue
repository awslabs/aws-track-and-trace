<script>
import { Line, mixins } from 'vue-chartjs';

export default {
  extends: Line,
  props: ['options'],
  mixins: [mixins.reactiveProp],
  mounted () {
    this.renderChart(this.chartData, this.options)
  }
}
</script>
