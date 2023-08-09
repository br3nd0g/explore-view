import Vue from 'vue'
import App from './App.vue'
import Highcharts from 'highcharts'
import Treemap from 'highcharts/modules/treemap'
import Heatmap from 'highcharts/modules/heatmap'
import Drilldown from 'highcharts/modules/drilldown'

Treemap(Highcharts);
Heatmap(Highcharts);
Drilldown(Highcharts);

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
