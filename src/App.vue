<template>
  <BackgroundDecor />
  <CuteContextMenu />
  <CuteClickText />
  <router-view />
</template>

<script setup lang="ts">
import BackgroundDecor from './components/BackgroundDecor.vue'
import CuteClickText from './components/CuteClickText.vue'
import CuteContextMenu from './components/CuteContextMenu.vue'
</script>

