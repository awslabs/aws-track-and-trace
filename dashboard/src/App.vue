<template>
  <div id="app">
    <router-view v-on:state="statusChange" />
  </div>
</template>

<script>
import AuthService from '@/services/AuthService'

export default {
  name: 'App',
  created () {
    this.authService = AuthService.getInstance()
    this.verifyRoute()
  },
  data () {
    return {
      status: 'load'
    }
  },
  methods: {
    statusChange (st) {
      this.status = st
    },
    verifyRoute () {
      const creds = this.authService.getCredentials()
      if (creds) {
        this.statusChange('run')
        this.$forceUpdate()

        // Manage credential expiration
        const accessToken = this.authService.getAccessToken()
        const expiration = accessToken.exp * 1000
        const diff = expiration - (new Date().getTime())
        setTimeout(() => {
          this.authService.login()
        }, diff)
      } else if (!this.$route.meta.public) {
        this.authService.login()
      } 
    }
  },
  watch: {
    $route (to, from) {
      this.verifyRoute()
    }
  }
}
</script>

<style lang="scss">
body {
  position: fixed;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0px;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  overflow: auto;


  .btn.btn-success {
    color: white !important;
  }

  .bg-image {
    background-size: cover;
  }

  #map {
    canvas {
      left: 0px;
    }

    .marker {
      position: relative;
      min-width: 10px;
      min-height: 4.94px;

      max-width: 30px;
      max-height: 14.52px;

      cursor: pointer;

      .icon {
        .alerts {
          position: absolute;
          bottom: -15px;
          left: -15px;
          width: 20px;
          height: 20px;
          font-family: 'Font Awesome 5 Free';
          font-weight: 900;

          &.warnings {
            color: orange;

            &::before {
              content: '\f071';
            }
          }

          &.errors {
            color: red;

            &::before {
              content: '\f06a';
            }
          }
        }

        position: absolute;
        top: 0px;
        left: 0px;
        width: 100%;
        height: 100%;
      }

      &.suv .icon {
        background: url('assets/rr-top.png') center center no-repeat;
        background-size: 100% auto;
      }

      &.sport .icon {
        background: url('assets/jf-top.png') center center no-repeat;
        background-size: 100% auto;
      }

      &.amazon .icon {
        background: url('assets/amz-top.png') center center no-repeat;
        background-size: 100% auto;
      }
    }
  }
}
</style>
