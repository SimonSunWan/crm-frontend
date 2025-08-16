<template>
  <div class="card art-custom-card">
    <div class="card-header">
      <div class="title">
        <h4 class="box-title">活跃用户</h4>
        <p class="subtitle">今年增长<span class="text-success">+15%</span></p>
      </div>
    </div>
    <ArtBarChart
      class="chart"
      barWidth="50%"
      height="calc(100% - 40px)"
      :showAxisLine="false"
      :data="[160, 100, 150, 80, 190, 100, 175, 120, 160]"
      :xAxisData="['1', '2', '3', '4', '5', '6', '7', '8', '9']"
    />
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
  .card {
    box-sizing: border-box;
    width: 100%;
    height: 420px;
    padding: 20px 0 30px;

    .card-header {
      padding: 0 18px !important;
    }

    .chart {
      box-sizing: border-box;
      width: 100%;
      padding: 20px 20px 0;
    }
  }

  @media screen and (max-width: $device-phone) {
    .card {
      height: 280px;
    }
  }
</style>
