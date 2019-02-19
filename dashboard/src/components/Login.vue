<template>
  <div class="login">
  </div>
</template>

<script>
import AuthService from '@/services/AuthService'

export default {
  name: 'login',
  created () {
    this.auth = AuthService.getInstance()
  },
  data () {
    return {
      token: ''
    }
  },
  mounted () {
    const hash = window.location.hash.substring(1).split('&').map(item => {
      const ret = {}
      const splitItem = item.split('=')
      ret[splitItem[0]] = splitItem[1]
      return ret
    }).reduce((total, item) => ({ ...total, ...item }))
    this.auth.postAuth(hash.id_token)
      .then(() => {
        this.$emit('state', 'run')
        this.$router.push('/dashboard')
      })
      .catch(err => {
        console.error(err)
      })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.login {
    height: 100%;
    display: block;
}

</style>
