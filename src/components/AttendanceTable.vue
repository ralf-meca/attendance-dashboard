<template>
  <div class="attendance-table-wrapper">
    <!-- Attendance table -->
    <div class="attendance-card">
      <DataTable
        :value="data"
        :paginator="paginator"
        :rows="rowsPerPage"
        :rowsPerPageOptions="rowsPerPageOptions"
        :stripedRows="stripedRows"
        :rowClass="getRowClass"
        tableStyle="min-width: 50rem"
      >
        <Column field="date" header="Date" :sortable="sortable"></Column>
        <Column field="checkIn" header="Check In">
          <template #body="slotProps">
            {{ formatDateToHourMinutes(slotProps.data.checkIn) }}
          </template>
        </Column>
        <Column field="checkOut" header="Check Out">
          <template #body="slotProps">
            {{ formatDateToHourMinutes(slotProps.data.checkOut) }}
          </template>
        </Column>
        <Column field="totalHours" header="Total Hours">
          <template #body="slotProps">
            {{ slotProps.data.totalHours }} {{ slotProps.data.totalHours ? 'h' : '-' }}
          </template>
        </Column>
        <Column
          field="workingType"
          header="Working Type"
          headerStyle="display: flex; justify-content: center"
          style="display: flex; justify-content: space-between; max-width: 200px"
        >
          <template #body="slotProps">
            <span
              :class="['badge', getBadge(slotProps?.data?.workingType).class]"
              :style="{ color: getBadge(slotProps?.data?.workingType).color }"
            >
              {{ slotProps?.data?.workingType }}
            </span>
            <i
              :class="getIconClass(slotProps?.data?.workingType)"
              :style="{ color: getBadge(slotProps?.data?.workingType).color }"
            ></i>
          </template>
        </Column>

        <!-- Optional actions column -->
        <Column v-if="$slots.rowActions" header="Actions" :exportable="false">
          <template #body="slotProps">
            <slot name="rowActions" :data="slotProps.data"></slot>
          </template>
        </Column>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import type { AttendanceRecord } from '@/types/attendance.types.ts'
import { formatDateToHourMinutes } from '@/utils/shared.utils.ts'

interface IAttendanceTableProps {
  data?: Partial<AttendanceRecord>[]
  emptyMessage?: string
  paginator?: boolean
  rowsPerPage?: number
  rowsPerPageOptions?: number[]
  stripedRows?: boolean
  sortable?: boolean
}

withDefaults(defineProps<IAttendanceTableProps>(), {
  data: () => [],
  emptyMessage: 'No attendance records found.',
  paginator: false,
  rowsPerPage: 50,
  rowsPerPageOptions: () => [5, 10, 20, 50],
  stripedRows: true,
  sortable: true,
})

const getRowClass = (row: Partial<AttendanceRecord>) => {
  const [dd, mm, yyyy] = (row.date as string).split('/')
  const day = new Date(`${yyyy}-${mm}-${dd}`).getDay()

  return day === 6 || day === 0 ? 'weekend-row' : ''
}

const getBadge = (workingType: string) => {
  return workingType === 'Remote'
    ? { class: 'remote-badge', color: '#23a15a' }
    : workingType === 'Office'
      ? { class: 'office-badge', color: 'black' }
      : { class: 'absent-badge', color: 'red' }
}

const getIconClass = (workingType: string) => {
  return workingType === 'Remote'
    ? 'pi pi-home'
    : workingType === 'Office'
      ? 'pi pi-building'
      : 'pi pi-minus-circle'
}
</script>

<style scoped>
.attendance-table-wrapper {
  width: 100%;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.table-header h3 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.no-data-card i {
  font-size: 48px;
  color: #ddd;
}

.badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}


i {
  font-size: 1rem;
}

:deep(.weekend-row) {
  background-color: #f3f4f6 !important;
}
</style>
