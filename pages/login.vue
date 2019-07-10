<template>
  <div>
    <h1>Login Page</h1>
    <h2 v-if="$auth.$state.loggedIn">You are logged in as: {{ $auth.user.name }}</h2>
    <h2 v-else>NOT logged in. You will be redirected momentarily'.</h2>
  </div>
</template>

<script>
export default {
  options: {
    auth: false
  },
  created() {
    this.login();
  },
  methods: {
    async login() {
      return this.$auth.loginWith("okta").catch(e => {
        console.error("login error:", e);
      });
    }
  }
};
</script>