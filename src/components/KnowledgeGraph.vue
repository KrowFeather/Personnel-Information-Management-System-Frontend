<template>
  <div ref="chartRef" class="kg-container"></div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { GraphChart } from 'echarts/charts'
import {
  TooltipComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import type { SeriesGraph } from 'echarts/charts'

echarts.use([GraphChart, TooltipComponent, LegendComponent, CanvasRenderer])

interface Node {
  id: string
  name: string
  category?: string
  symbolSize?: number
}

interface Link {
  source: string
  target: string
  label?: string
}

const props = defineProps<{
  nodes: Node[]
  links: Link[]
}>()

const chartRef = ref<HTMLDivElement | null>(null)
let chart: echarts.ECharts | null = null

const renderChart = () => {
  if (!chartRef.value) return

  if (!chart) {
    chart = echarts.init(chartRef.value)
    window.addEventListener('resize', handleResize)
  }

  const categories = Array.from(new Set(props.nodes.map(n => n.category ?? 'Default'))).map((name) => ({
    name,
  }))

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => params.data?.name || '',
    },
    legend: {
      data: categories.map(c => c.name),
      bottom: 2,
      textStyle: { color: '#6b7280', fontSize: 10 },
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: true,
        animationDuration: 800,
        animationEasing: 'quadraticOut',
        force: {
          repulsion: 120,
          edgeLength: 80,
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{b}',
          fontSize: 10,
        },
        lineStyle: {
          color: 'source',
          curveness: 0.2,
          width: 1.5,
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 3,
          },
        },
        categories,
        data: props.nodes.map((n) => ({
          ...n,
          symbolSize: n.symbolSize ?? (n.category === 'Org' ? 40 : 26),
        })) as SeriesGraph.DataItemOption[],
        edges: props.links.map((l) => ({
          source: l.source,
          target: l.target,
          label: l.label
            ? {
                show: true,
                formatter: l.label,
                fontSize: 9,
              }
            : undefined,
        })) as SeriesGraph.EdgeItemOption[],
      },
    ],
  }

  chart.setOption(option)
}

const handleResize = () => {
  chart?.resize()
}

onMounted(() => {
  renderChart()
})

watch(
  () => [props.nodes, props.links],
  () => {
    renderChart()
  },
  { deep: true },
)

onBeforeUnmount(() => {
  if (chart) {
    chart.dispose()
    chart = null
    window.removeEventListener('resize', handleResize)
  }
})
</script>

<style scoped>
.kg-container {
  width: 100%;
  height: 17rem;
}
</style>


