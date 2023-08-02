<template>
  <div id="app">
    <ObjectiveExplore />
  </div>
</template>

<script>
import ObjectiveExplore from './components/ObjectiveExplore.vue'

export default {
  name: 'App',
  components: {
    ObjectiveExplore
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
