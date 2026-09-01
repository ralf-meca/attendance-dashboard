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
          @update:modelValue="handleMonthChange"
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
      :doInnAttendanceData="doInnAttendanceResponse ?? []"
      :selectedDate="selectedDate"
      :hoursWorkedThisMonth="hoursWorkedThisMonth"
    />

    <!-- Attendance Tables -->
    <div class="welcome-card">
      <Tabs value="chweb">
        <TabList>
          <Tab value="chweb">Chweb</Tab>
          <Tab value="way4tech">Way4Tech</Tab>
        </TabList>
        <TabPanels>
          <TabPanel value="chweb">
            <AttendanceTable
              :data="formattedAttendance"
              :isLoading="isLoadingAttendance"
              :error="attendanceError"
              :stripedRows="false"
              :paginator="!!formattedAttendance.length"
            />
          </TabPanel>
          <TabPanel value="way4tech">
            <DoInnAttendanceTable
              :data="doInnAttendanceResponse ?? []"
              :stripedRows="false"
              :paginator="!!(doInnAttendanceResponse && doInnAttendanceResponse.length > 1)"
            />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import type {
  AttendanceRecord,
  IDoInnAttendanceRecord,
  IDoInnAttendanceResponse,
} from '@/types/attendance.types.ts'
import ProgressSpinner from 'primevue/progressspinner'
import dayjs from 'dayjs'
import AttendanceTable from '@/components/AttendanceTable.vue'
import DoInnAttendanceTable from '@/components/DoInnAttendanceTable.vue'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import StatsWidgets from '@/components/StatsWidgets.vue'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'

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
      return 100
  }
})

// Attendance state
const attendanceResponse = ref<AttendanceRecord[] | null>(null)
const doInnAttendanceResponse = ref<IDoInnAttendanceRecord[] | null>(null)
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
      `/api/Attendance/GetAttendanceByContactId?contactId=${userContact.value.id}`,
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

    await fetchDoInnAttendance()
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
    .sort((a, b) => (a.date > b.date ? 1 : -1))
})

const hoursWorkedThisMonth = computed(() => {
  if (!formattedAttendance?.value) return 0

  return formattedAttendance.value.reduce((sum, entry) => {
    return sum + (Number(entry.totalHours) || 0)
  }, 0)
})

const dayRates = [20, 30, 40, 50, 60, 75, 80, 100]
const selectedRate = ref<number>(userRates.value)

const totalAmount = computed(() => {
  const amount = (hoursWorkedThisMonth.value / 8) * (selectedRate?.value ?? 0)
  return new Intl.NumberFormat('de-CH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
})
const fetchDoInnAttendance = async () => {
  if (!authStore.doInnToken) return

  const payloadDate = dayjs(selectedDate.value)
  const doInnParams = new URLSearchParams({
    mese: (payloadDate.month() + 1).toString(),
    anno: payloadDate.year().toString(),
    page: '1',
    start: '0',
    limit: '300',
    _token: authStore.doInnToken ?? '',
  })
  const doInnResponse = await fetch(
    `https://intranet.doinnovation.it/backend/rest/RND/attivita?${doInnParams}`,
    { method: 'GET', credentials: 'include' },
  )
  const doInnData: IDoInnAttendanceResponse = await doInnResponse.json()
  doInnAttendanceResponse.value = doInnData?.results?.data
}

const handleMonthChange = () => {
  fetchDoInnAttendance()
}

// Fetch on the component mount
onMounted(() => {
  fetchAttendance()
})
</script>

<style scoped src="./DashboardPage.css"></style>
