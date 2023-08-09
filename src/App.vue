<template>
  <div id="app">
    <treemap />
  </div>
</template>

<script>
import treemap from './components/treemap.vue'

export default {
  name: 'App',
  components: {
    treemap
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
