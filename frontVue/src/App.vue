<template>
  <div>
    <template v-if="!$route.meta.allowAnonymous">
      <v-app id="inspire">

        <div class="app-container">
          <navigation :toggle="drawer"/>
          <toolbar @toggleNavigationBar="drawer = !drawer"/>

          <v-content>
            <breadcrumbs />
            <router-view />
            <page-footer id="footer" />
          </v-content>

        </div>

      </v-app>

    </template>

    <template v-else>
      <transition>
        <keep-alive>
          <router-view></router-view>
        </keep-alive>
      </transition>
    </template>

  </div>

</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      drawer: true
    }
  }
}
</script>

<style>
#footer {
position: absolute;
top: calc(100vh - 100px);
width: 100%;
}
</style>
