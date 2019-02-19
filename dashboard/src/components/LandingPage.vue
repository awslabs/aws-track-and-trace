<template>
  <div class="landing-page">
    <div class="bg-image intro" style="background-image: url('/static/background.jpg');">
      <div class="logo"></div>
      <div class="title">
        <h1>Connected vehicles of the future. Now. </h1>
        <h2>See how your next-generation connected vehicles platform could look like. Today.</h2>
      </div>
      <div class="actions">
        <button class="btn btn-success px-4 py-2" @click="startRegistration()">
          <i class="fa fa-fw fa-unlock mr-1"></i> Access
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import AuthService from '@/services/AuthService';

export default {
  name: 'landingPage',
  data () {
    return {
    }
  },
  created () {
    this.authService = AuthService.getInstance();
  },
  methods: {
    startRegistration () {
      this.authService.login();
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
.landing-page {
  height: 100%;

  .intro {
    display: flex;
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: flex-end;
    padding-bottom: 5em;
    flex-wrap: wrap;

    .logo {
      justify-self: stretch;
      // align-self: center;
      width: 100%;
      height: 200px;
      background: url('../assets/logo.png') center center no-repeat;
      background-size: auto 200px;
      margin: .5em auto;
    }

    .title {
      margin: .5em auto;
      width: 100%;

      h1 {
        font-size: 2em;
        color: #444;
      }

      h2 {
        font-size: 1.6em;
        color: #666;
      }
    }
  }
}

</style>
