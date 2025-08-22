<template>
  <ArtLayouts>
    <ArtHeaderBar />
    <ArtSidebarMenu />
    <ArtPageContent />
    <ArtSettingsPanel />
    <ArtGlobalSearch />
    <ArtScreenLock />
    <ArtFireworksEffect />
    <ArtWatermark />
  </ArtLayouts>
</template>

<script setup lang="ts">
  defineOptions({ name: 'IndexLayout' })
</script>

<style lang="scss" scoped>
  @use './style';
</style>
