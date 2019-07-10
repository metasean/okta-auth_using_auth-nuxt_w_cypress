<template>
  <main>
    <h1 class="title">Okta configured nuxt-auth demo app</h1>
    <h2 class="subtitle">with Cypress tests</h2>

    <br>
    <h3 v-if="$auth.$state.loggedIn">You are logged in as: {{ $auth.user.name }}</h3>
    <h3 v-else>NOT logged in. You will be redirected momentarily'.</h3>

    <br>
    <button v-if="$auth.$state.loggedIn" @click="logout">logout</button>
  </main>
</template>

<script>
export default {
  components: {},
  methods: {
    logout() {
      this.$auth.logout();
    }
  }
};
</script>

<style>
button {
  font-size: 150%;
}
</style>
