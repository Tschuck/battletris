import { Line, mixins } from 'vue-chartjs';
const { reactiveProp } = mixins;

export default {
  extends: Line,
  mixins: [reactiveProp],
  props: ['options'],
  mounted () {
    // handle click event
    this.options.onClick = this.handleClick;

    // this.chartData is created in the mixin.
    // If you want to pass options please create a local options object
    this.renderChart(this.chartData, this.options)
  },
  methods: {
    handleClick (point, event) {
      const item = event[0];

      this.$emit('click', {
        label: this.chartData.labels[item._index],
        value: this.chartData.datasets[item._datasetIndex].data[item._index],
      })
    }
  }
}
