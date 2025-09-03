<template>
  <ArtLayouts>
    <ArtHeaderBar />
    <ArtSidebarMenu />
    <ArtPageContent />
    <ArtSettingsPanel />
    <ArtGlobalSearch />
    <ArtWatermark />
  </ArtLayouts>
</template>

<script setup lang="ts">
  defineOptions({ name: 'IndexLayout' })
</script>

<style lang="scss" scoped>
  @use './style';
</style>
