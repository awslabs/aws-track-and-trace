<template>
  <div class="landing-page">
    <div class="intro">
      <div class="intro-content">
        <div class="title">
          <h1>AWS Track &amp; Trace sample</h1>
          <h2>Track your moving assets and their status</h2>
        </div>
        <div class="actions">
          <button class="btn btn-success px-4 py-2" @click="startRegistration()">
            <i class="fa fa-fw fa-unlock mr-1"></i> Access
          </button>
        </div>
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
    justify-content: flex-end;
    align-items: flex-end;
    padding: 1em;
    flex-wrap: wrap;
    background: url('/static/background.jpg') top center no-repeat;
    background-size: cover;

    .intro-content {
      padding: 1em;
      background: rgba(255, 255, 255, .3);
      border-radius: .5em;

      .title {
        margin: .5em auto;
        width: 100%;
        text-align: right;
        justify-self: stretch;

        h1 {
          font-size: 2em;
          color: #444;
        }

        h2 {
          font-size: 1.6em;
          color: #444;
        }
      }

      .actions {
        text-align: right;
      } 
    }
  }
}

</style>
