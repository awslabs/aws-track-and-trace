<template>
  <div class="hero">
    <div class="bg-body-light">
      <div class="content content-full">
        <div class="d-flex flex-column flex-sm-row justify-content-sm-between align-items-sm-center">
          <h1 class="flex-sm-fill h3 my-2">
            Sidebar <small class="font-size-base font-w400 text-muted">Dark</small>
          </h1>
          <nav class="flex-sm-00-auto ml-sm-3" aria-label="breadcrumb">
            <ol class="breadcrumb breadcrumb-alt">
              <li class="breadcrumb-item">Layout</li>
              <li class="breadcrumb-item">Sidebar</li>
              <li class="breadcrumb-item" aria-current="page">
                <a class="link-fx" href="">Dark</a>
              </li>
            </ol>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'hero',
  data () {
    return {
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.hero {
}

</style>
