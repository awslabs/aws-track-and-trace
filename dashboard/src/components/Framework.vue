<template>
  <div class="framework">
      <div class="alerts">
        <div class="alert alert-dismissable" :class="alert.type" v-for="(alert, index) in data.alerts" :key="index">
          {{ alert.message }}
          <button type="button" class="close" data-dismiss="alert" aria-hidden="true" @click="dismiss(alert, index)">×</button>
        </div>
      </div>
  </div>
</template>

<script>
import FrameworkService from '@/services/FrameworkService';

export default {
  name: 'framework',
  created () {
    this.fwk = FrameworkService.getInstance();
    this.data = this.fwk.getData();
  },
  data () {
    return {
      data: {
        alerts: []
      }
    }
  },
  methods: {
    dismiss (alert, index) {
      this.data.alerts.splice(index, 1);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
.framework {
  z-index: 10001;
  position: fixed;
  top: 0px;
  left: 0px;
  right: 0px;
  height: 0px;
  text-align: center;

  .alerts {
    margin: 3em auto;
    text-align: center;
    width: 30%;
  }
}

</style>