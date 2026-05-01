<template>
  <div class="stats-container">
    <Chart type="pie" :data="chartData" :options="chartOptions" class="w-full md:w-[30rem]" />

    <div
      v-for="stat in computedStats"
      :key="stat.label"
      class="stat-card"
      :style="{ borderColor: stat.color }"
    >
      <div class="stat-icon" :style="{ backgroundColor: stat.color + '20', color: stat.color }">
        <i :class="stat.icon"></i>
      </div>
      <div class="stat-content">
        <p class="stat-label">{{ stat.label }}</p>
        <h3 class="stat-value">{{ stat.value }}</h3>
        <p v-if="stat.subtitle" class="stat-subtitle">{{ stat.subtitle }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import type { AttendanceRecord } from '@/types/attendance.types'
import Chart from 'primevue/chart'

interface Props {
  attendanceData: AttendanceRecord[] | null
  selectedDate: Date
  hoursWorkedThisMonth: number | null
}

const props = defineProps<Props>()

// Calculate working days in a month (excluding weekends)
const getWorkingDaysInMonth = (date: Date) => {
  const start = dayjs(date).startOf('month')
  const end = dayjs(date).endOf('month')
  let workingDays = 0

  for (let day = start; day.isBefore(end) || day.isSame(end, 'day'); day = day.add(1, 'day')) {
    const dayOfWeek = day.day()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      // Exclude Sunday (0) and Saturday (6)
      workingDays++
    }
  }
  return workingDays
}

// Working days in selected month
const workingDaysThisMonth = computed(() => {
  return getWorkingDaysInMonth(props.selectedDate)
})

const daysWorkedThisMonth = computed(() => {
  return props?.hoursWorkedThisMonth ? props.hoursWorkedThisMonth / 8 : 0
})

// Days worked previous month
const daysWorkedPreviousMonth = computed(() => {
  if (!props.attendanceData) return 0
  const previousMonth = dayjs(props.selectedDate).subtract(1, 'month')
  const previousMonthStr = previousMonth.format('MM/YYYY')

  return props.attendanceData.filter((entry) => {
    const entryMonth = dayjs(entry.date, 'DD/MM/YYYY').format('MM/YYYY')
    return entryMonth === previousMonthStr
  }).length
})

// Expected working days next month
const expectedWorkingDaysNextMonth = computed(() => {
  const nextMonth = dayjs(props.selectedDate).add(1, 'month').toDate()
  return getWorkingDaysInMonth(nextMonth)
})

// Calculate percentage change
const percentageChange = computed(() => {
  if (daysWorkedPreviousMonth.value === 0) return 0
  const change =
    ((daysWorkedThisMonth?.value - daysWorkedPreviousMonth.value) / daysWorkedPreviousMonth.value) *
    100
  return Math.round(change)
})

// Attendance rate percentage
const attendanceRate = computed(() => {
  if (workingDaysThisMonth.value === 0) return 0
  return Math.ceil((daysWorkedThisMonth?.value / workingDaysThisMonth.value) * 100)
})

// Computed stats data
const computedStats = computed(() => [
  {
    label: 'Days Worked',
    value: `${daysWorkedThisMonth?.value}/${workingDaysThisMonth.value}`,
    subtitle: `${attendanceRate.value}% attendance rate`,
    icon: 'pi pi-calendar-plus',
    color: '#667eea',
  },
  {
    label: 'vs Last Month',
    value: daysWorkedThisMonth?.value,
    subtitle:
      percentageChange.value >= 0
        ? `+${percentageChange.value}% from ${daysWorkedPreviousMonth.value} days`
        : `${percentageChange.value}% from ${daysWorkedPreviousMonth.value} days`,
    icon: percentageChange.value >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down',
    color: percentageChange.value >= 0 ? '#10b981' : '#ef4444',
  },
  {
    label: 'Next Month',
    value: `${expectedWorkingDaysNextMonth.value} days`,
    subtitle: dayjs(props.selectedDate).add(1, 'month').format('MMMM YYYY'),
    icon: 'pi pi-calendar',
    color: '#f59e0b',
  },
])

const chartData = computed(() => {
  const documentStyle = getComputedStyle(document.body)

  return {
    labels: ['A', 'B', 'C'],
    datasets: [
      {
        data: [540, 325, 702],
        backgroundColor: [
          documentStyle.getPropertyValue('--p-cyan-500'),
          documentStyle.getPropertyValue('--p-orange-500'),
          documentStyle.getPropertyValue('--p-gray-500'),
        ],
        hoverBackgroundColor: [
          documentStyle.getPropertyValue('--p-cyan-400'),
          documentStyle.getPropertyValue('--p-orange-400'),
          documentStyle.getPropertyValue('--p-gray-400'),
        ],
      },
    ],
  }
})

const chartOptions = computed(() => {
  const documentStyle = getComputedStyle(document.documentElement);
  const textColor = documentStyle.getPropertyValue('--p-text-color');

  return {
    plugins: {
      legend: {
        labels: {
          usePointStyle: true,
          color: textColor
        }
      }
    }
  };
})
</script>

<style scoped>
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-size: 13px;
  color: #666;
  margin: 0 0 4px 0;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #333;
  margin: 0;
  line-height: 1;
}

.stat-subtitle {
  font-size: 12px;
  color: #999;
  margin: 4px 0 0 0;
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
  }
}
</style>
