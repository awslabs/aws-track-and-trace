// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'

import App from './App'
import router from './router'
import ConfigurationService from '@/services/ConfigurationService';
import * as VueGoogleMaps from 'vue2-google-maps';

const configService = ConfigurationService.getInstance()
Vue.use(VueGoogleMaps, {
  load: {
    key: configService.get('GMAPS_API_KEY')
  }
})

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
