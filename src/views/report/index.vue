<template>
  <div class="report-page art-full-height">
    <!-- 统计卡片 -->
    <ElRow :gutter="20" class="stats-row">
      <ElCol :span="6" v-for="(item, index) in statsData" :key="index">
        <ElCard class="stats-card" shadow="never">
          <div class="stats-content">
            <div class="stats-icon" :style="{ backgroundColor: item.color }">
              <i class="iconfont-sys" v-html="item.icon"></i>
            </div>
            <div class="stats-info">
              <div class="stats-value">{{ item.value }}</div>
              <div class="stats-label">{{ item.label }}</div>
              <div class="stats-change" :class="item.trend">
                {{ item.change }}
                <i :class="item.trend === 'up' ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
              </div>
            </div>
          </div>
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 图表区域 -->
    <ElRow :gutter="20" class="charts-row">
      <ElCol :span="12">
        <ElCard class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>销售趋势</span>
              <ElSelect v-model="salesPeriod" size="small" style="width: 100px">
                <ElOption label="本周" value="week" />
                <ElOption label="本月" value="month" />
                <ElOption label="本季度" value="quarter" />
              </ElSelect>
            </div>
          </template>
          <ArtLineChart :data="salesChartData" :xAxisData="salesXAxisData" height="300px" />
        </ElCard>
      </ElCol>
      <ElCol :span="12">
        <ElCard class="chart-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>产品分类占比</span>
            </div>
          </template>
          <ArtBarChart :data="categoryChartData" :xAxisData="categoryXAxisData" height="300px" />
        </ElCard>
      </ElCol>
    </ElRow>

    <!-- 数据表格 -->
    <ElRow :gutter="20" class="table-row">
      <ElCol :span="24">
        <ElCard class="table-card" shadow="never">
          <template #header>
            <div class="card-header">
              <span>销售排行</span>
              <ElButton type="primary" size="small" @click="handleExport">导出报表</ElButton>
            </div>
          </template>
          <ElTable :data="rankingData" stripe>
            <ElTableColumn prop="rank" label="排名" width="80" />
            <ElTableColumn prop="productName" label="产品名称" />
            <ElTableColumn prop="salesCount" label="销售数量" width="120" />
            <ElTableColumn prop="salesAmount" label="销售金额" width="120">
              <template #default="scope"> ¥{{ scope.row.salesAmount.toLocaleString() }} </template>
            </ElTableColumn>
            <ElTableColumn prop="growth" label="增长率" width="120">
              <template #default="scope">
                <span :class="scope.row.growth >= 0 ? 'text-success' : 'text-danger'">
                  {{ scope.row.growth >= 0 ? '+' : '' }}{{ scope.row.growth }}%
                </span>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElCard>
      </ElCol>
    </ElRow>
  </div>
</template>

<script setup lang="ts">
  // 组件导入
  import ArtLineChart from '@/components/charts/art-line-chart/index.vue'
  import ArtBarChart from '@/components/charts/art-bar-chart/index.vue'

  // Element Plus 组件
  import { ElMessage } from 'element-plus'

  // Vue 工具函数
  import { ref, reactive, onMounted, watch } from 'vue'

  defineOptions({ name: 'Report' })

  // 响应式数据
  const salesPeriod = ref('month')

  // 统计数据
  const statsData = reactive([
    {
      label: '总销售额',
      value: '¥1,234,567',
      change: '+12.5%',
      trend: 'up',
      icon: '&#xe721;',
      color: '#409eff'
    },
    {
      label: '订单数量',
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: '&#xe724;',
      color: '#67c23a'
    },
    {
      label: '客户数量',
      value: '567',
      change: '+15.3%',
      trend: 'up',
      icon: '&#xe7aa;',
      color: '#e6a23c'
    },
    {
      label: '产品数量',
      value: '89',
      change: '+3.1%',
      trend: 'up',
      icon: '&#xe82a;',
      color: '#f56c6c'
    }
  ])

  // 销售趋势图表数据
  const salesChartData = ref([120000, 150000, 180000, 200000, 220000, 250000])
  const salesXAxisData = ref(['1月', '2月', '3月', '4月', '5月', '6月'])

  // 产品分类占比图表数据
  const categoryChartData = ref([450000, 320000, 280000, 184567])
  const categoryXAxisData = ref(['服务器', '网络设备', '软件产品', '配件'])

  // 销售排行数据
  const rankingData = reactive([
    {
      rank: 1,
      productName: '高性能服务器',
      salesCount: 45,
      salesAmount: 675000,
      growth: 25.6
    },
    {
      rank: 2,
      productName: '千兆交换机',
      salesCount: 120,
      salesAmount: 240000,
      growth: 18.3
    },
    {
      rank: 3,
      productName: '企业管理系统',
      salesCount: 28,
      salesAmount: 140000,
      growth: 12.7
    },
    {
      rank: 4,
      productName: '网络防火墙',
      salesCount: 35,
      salesAmount: 105000,
      growth: -5.2
    },
    {
      rank: 5,
      productName: '存储设备',
      salesCount: 22,
      salesAmount: 88000,
      growth: 8.9
    }
  ])

  // 导出报表
  const handleExport = () => {
    ElMessage.success('报表导出成功')
  }

  // 监听销售周期变化
  watch(salesPeriod, newPeriod => {
    // 这里可以根据选择的周期更新图表数据
    ElMessage.info(
      `切换到${newPeriod === 'week' ? '本周' : newPeriod === 'month' ? '本月' : '本季度'}数据`
    )
  })

  // 初始化
  onMounted(() => {
    // 可以在这里调用API获取数据
  })
</script>

<style lang="scss" scoped>
  @use './style';
</style>
