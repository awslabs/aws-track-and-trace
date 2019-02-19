<template>
  <div class="usage-plan">
    <div class="block block-rounded block-themed">
      <div class="block-header" :class="plan.headerStyle">
        <h3 class="block-title">{{ plan.name }}</h3>
      </div>            
      <div class="block-content bg-body-light">
        <div class="py-3">
          <p class="h1 font-w700 mb-2">
            {{ plan.price }}
          </p>
          <p class="h6 text-muted">{{ plan.period }}</p>
        </div>
      </div>
      <div class="block-content">
        <div class="py-2 font-size-sm">
          <p v-for="(c, i) in plan.characteristics" :key="i" v-html="c"></p>
        </div>
      </div>
      <div class="block-footer">
        <div class="py-3">
          <button class="btn" :class="plan.action.style">
            <i :class="plan.action.icon"></i>
            {{ plan.action.text }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'usagePlan',
  props: ['plan'],
  data () {
    return {
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.usage-plan {
}

</style>
