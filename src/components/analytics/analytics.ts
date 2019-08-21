import Chart from 'chart.js';
import Component, { mixins } from 'vue-class-component';
import { promisify } from 'es6-promisify';
import { Vue, Prop } from 'vue-property-decorator';

import LineChart from './charts/linechart';
import * as battletris from '../../battletris';
import { promiseClient, } from '../../actionheroWrapper';

@Component({
  components: {
    'line-chart': LineChart
  },
})
export default class Analytics extends Vue {
  /**
   * status flags
   */
  loading = true;

  /**
   * Analytics data.
   */
  analytics = { };
  runningBattles = 0;
  todayBattles = 0;

  /**
   * Date range for displaying battle analytics
   */
  dateRange: any = { start: null, end: null, table: null, };

  /**
   * object for displaying date to battle correlations
   */
  dateToBattleData: any = { };

  /**
   * detailed data for one day
   */
  tableData: any = [ ];

  /**
   * Default options that will be passed to each chart js component.
   */
  chartJsOptions: any = {
    responsive: false,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        gridLines: { },
      }],
      yAxes: [{
        ticks: {
          stepSize: 10,
        },
        gridLines: { }
      }]
    }
  };

  /**
   * Load latest analytics
   */
  async created() {
    this.loading = true;

    // setup custom chartjs colors
    Chart.defaults.global.defaultFontColor = battletris.getCssVariable('card-color');
    this.chartJsOptions.scales.xAxes[0].gridLines.color = battletris.getCssVariable('border');
    this.chartJsOptions.scales.yAxes[0].gridLines.color = battletris.getCssVariable('border');

    // set initial utc dates
    this.dateRange.start = this.getUTC();
    this.dateRange.end = this.getUTC();
    this.dateRange.table = this.getUTC();

    // setup initial date ranges and transform to correct input values
    this.dateRange.start.setDate(this.dateRange.start.getDate() - 30);
    this.dateRange.start = this.getDateInputValue(this.dateRange.start);
    this.dateRange.end = this.getDateInputValue(this.dateRange.end);
    this.dateRange.table = this.getDateInputValue(this.dateRange.table);

    // load analytics data
    await this.loadAnalytics();

    this.loading = false;
  }

  /**
   * Load analytics data.
   */
  async loadAnalytics() {
    const datesToLoad = [ ];
    const startDate = this.getUTC(new Date(this.dateRange.start));
    const endDate = this.getUTC(new Date(this.dateRange.end));

    // until end date is reached, map all days that should be loaded to the dates to load array
    while (startDate <= endDate) {
      datesToLoad.push(`${ startDate.getFullYear() }:${ startDate.getMonth() }:${ startDate.getDate() }:*`);
      startDate.setDate(startDate.getDate() + 1);
    }

    // apply the patterns to the battletris analysis
    const { analytics, runningBattles, } = await promiseClient.action('battletris/analytics', {
      patterns: datesToLoad
    });
    this.analytics = analytics;
    this.runningBattles = runningBattles;

    // setup formatted report data
    this.setupDateToBattle();
    this.setupTodayBattles();
    this.setupTableBattle();
  }

  /**
   * Parse data to display a date to battle count chart.
   */
  setupDateToBattle() {
    this.dateToBattleData = {
      labels: [ ],
      datasets: [
        {
          label: this.$t('analytics.battles'),
          backgroundColor: battletris.getCssVariable('analytics-bg'),
          borderColor: battletris.getCssVariable('analytics-line'),
          data: [ ],
        },
      ]
    };

    // copy start and end date
    const startDate = this.getUTC(new Date(this.dateRange.start));
    const endDate = this.getUTC(new Date(this.dateRange.end));

    // iterate over all days and add them to the graph data
    while (startDate <= endDate) {
      const dateString = this.getOnlyDateKey(startDate);

      this.dateToBattleData.labels.push(this.getDateInputValue(startDate));
      this.dateToBattleData.datasets[0].data.push(
        this.analytics[dateString] ? this.analytics[dateString].length : 0
      );

      startDate.setDate(startDate.getDate() + 1);
    }
  }

  /**
   * Calculate battles that were runned today
   */
  setupTodayBattles() {
    const dateTime = this.getOnlyDateKey();
    this.todayBattles = this.analytics[dateTime] ? this.analytics[dateTime].length : 0;
  }

  /**
   * Setup data that should be displayed within tables for detailed analyze.
   */
  setupTableBattle() {
    const dateTime = this.getOnlyDateKey(new Date(this.dateRange.table));
    this.tableData = this.analytics[dateTime] ? this.analytics[dateTime] : [ ];
  }

  /**
   * Return a getTime number of a date without hours / minutes.
   *
   * @param      {number}  date    date time number
   */
  getOnlyDateKey(date = new Date()) {
    return this.getUTC(new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0)).getTime();
  }

  /**
   * Return html date input format string.
   *
   * @param      {Date}  date    date object
   */
  getDateInputValue(date: Date) {
    return [
      date.getFullYear(),
      (date.getMonth() + 1).toString().padStart(2, '0'),
      date.getDate().toString().padStart(2, '0'),
    ].join('-');
  }

  /**
   * Returns a utc date.
   *
   * @param      {<type>}  date    The date
   */
  getUTC(date = new Date()) {
    return new Date(date.toISOString());
  }
}
