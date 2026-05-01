<template>
  <!-- Loading state -->
  <div style="display: flex; justify-content: center; margin-top: 20px" v-if="isLoadingAttendance">
    <ProgressSpinner animationDuration="1s" style="color: black" />
  </div>

  <!-- Error state -->
  <div v-if="attendanceError" class="error-message">
    {{ attendanceError }}
  </div>

  <!-- Attendance data -->
  <div v-if="attendanceResponse">
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      "
    >
      <div class="rate-selector">
        <label for="month">Month</label>
        <DatePicker
          v-model="selectedDate"
          view="month"
          dateFormat="mm/yy"
          placeholder="Select a month"
        />
      </div>
      <div class="rate-section">
        <div class="rate-selector">
          <label for="rate-select">Rates</label>
          <Select id="rate-select" v-model="selectedRate" :options="dayRates" />
        </div>
        <div class="total-amount">
          <span class="total-label">Total to invoice:</span>
          <strong class="total-value">{{ totalAmount }} €</strong>
        </div>
      </div>
    </div>

    <!-- Stats Widgets -->
    <StatsWidgets
      :attendanceData="attendanceResponse"
      :selectedDate="selectedDate"
      :hoursWorkedThisMonth="hoursWorkedThisMonth"
    />

    <!-- Attendance Table -->
    <div class="welcome-card">
      <AttendanceTable
        :data="formattedAttendance"
        :isLoading="isLoadingAttendance"
        :error="attendanceError"
        :stripedRows="false"
        :paginator="!!formattedAttendance.length"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import type { AttendanceRecord } from '@/types/attendance.types.ts'
import ProgressSpinner from 'primevue/progressspinner'
import dayjs from 'dayjs'
import AttendanceTable from '@/components/AttendanceTable.vue'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import StatsWidgets from '@/components/StatsWidgets.vue'

const authStore = useAuthStore()
const userContact = computed(() => authStore.userContact)

const userRates = computed(() => {
  switch (userContact?.value?.email) {
    case 'devis.kapaj@chweb.it':
      return 50
    case 'francesko.dhima@chweb.it':
      return 100
    case 'ralf.meca@chweb.it':
      return 75

    default:
      return 75
  }
})

// Attendance state
const attendanceResponse = ref<AttendanceRecord[] | null>(null)
const isLoadingAttendance = ref(false)
const attendanceError = ref<string | null>(null)
const selectedDate = ref<Date>(new Date())

// Fetch attendance data
const fetchAttendance = async () => {
  if (!userContact.value?.id || !authStore.token) {
    attendanceError.value = 'Missing user contact ID or token'
    return
  }

  isLoadingAttendance.value = true
  attendanceError.value = null

  try {
    const response = await fetch(
      `https://crm.chweb.it/api/Attendance/GetAttendanceByContactId?contactId=${userContact.value.id}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authStore.token}`,
        },
      },
    )

    if (!response.ok) {
      attendanceError.value = `Failed to fetch attendance: ${response.statusText}`
    }

    attendanceResponse.value = (await response.json()) as AttendanceRecord[]
  } catch (error) {
    attendanceError.value = error instanceof Error ? error.message : 'Failed to fetch attendance'
    console.error('Error fetching attendance:', error)
  } finally {
    isLoadingAttendance.value = false
  }
}

const formattedAttendance = computed(() => {
  if (!attendanceResponse.value) return []
  const selectedMonth = dayjs(selectedDate.value).format('MM/YYYY')

  return attendanceResponse.value
    .filter((entry) => {
      // Filter by selected month/year
      const entryMonth = dayjs(entry.date, 'DD/MM/YYYY').format('MM/YYYY')
      return entryMonth === selectedMonth
    })
    .map((entry) => ({
      id: entry.id,
      date: dayjs(entry.date).format('DD/MM/YYYY'),
      checkIn: entry.checkInTime,
      checkOut: entry.checkOutTime,
      totalHours: entry.totalHours,
      workingType: entry.workingType,
    }))
    .sort((a, b) => a.date > b.date ? 1 : -1)
})

const hoursWorkedThisMonth = computed(() => {
  if (!formattedAttendance?.value) return 0

  const totalHours = formattedAttendance.value.reduce((sum, entry) => {
    return sum + (Number(entry.totalHours) || 0)
  }, 0)

  console.log('totalHours', totalHours)

  return totalHours
})

const dayRates = [20, 30, 40, 50, 60, 75, 80, 100]
const selectedRate = ref<number>(userRates.value)

const totalAmount = computed(() => {
  const amount = (hoursWorkedThisMonth.value / 8) * (selectedRate?.value ?? 0)
  return new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
})
// Fetch on the component mount
onMounted(() => {
  fetchAttendance()
})
</script>

<style scoped src="./DashboardPage.css"></style>
