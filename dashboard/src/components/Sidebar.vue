<template>
  <div class="sidebar">
    <nav id="sidebar" aria-label="Main Navigation">
      <div class="content-header bg-white-5">
        <div class="logo"></div>
      </div>
      
      <div class="content-side content-side-full">
        <ul class="nav-main">
          <li class="nav-main-item">
            <router-link class="nav-main-link" to="/dashboard">
              <i class="nav-main-link-icon si si-speedometer"></i>
              <span class="nav-main-link-name">Dashboard</span>
            </router-link>
          </li>
          
          <li class="nav-main-heading">Fleet management</li>
          <li class="nav-main-item">
            <router-link to="/dashboard/fleet-table" class="nav-main-link">
              <i class="nav-main-link-icon fas fa-table"></i>
              <span class="nav-main-link-name">Vehicles table</span>
            </router-link>
          </li>

          <li class="nav-main-item">
            <router-link to="/dashboard/fleet-map" class="nav-main-link">
              <i class="nav-main-link-icon fas fa-map"></i>
              <span class="nav-main-link-name">Live geologistics</span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'sidebar',
  data () {
    return {
      page: this.$route.params.page
    }
  },
  mounted () {
    this.page = this.$route.params.page
  },
  watch: {
    page (to, from) {
      console.log('Change');
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.sidebar {
  .logo {
    width: 182px;
    height: 50px;

    background: url('../assets/logo-w-text.png') center center no-repeat;
    background-size: 100% 100%;
  }

  .nav-main-link {
    &.router-link-exact-active {
      color: #000;
      * {
        color: #000;
      }
    }
  }
}

</style>
