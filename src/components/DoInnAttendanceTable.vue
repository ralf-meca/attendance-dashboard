<template>
  <div class="attendance-table-wrapper">
    <DataTable
      :value="groupedData"
      v-model:expandedRows="expandedRows"
      dataKey="date"
      :paginator="paginator"
      :rows="rowsPerPage"
      :rowsPerPageOptions="rowsPerPageOptions"
      :stripedRows="stripedRows"
      :rowClass="getRowClass"
      tableStyle="min-width: 50rem"
    >
      <Column style="width: 3rem">
        <template #body="slotProps">
          <button
            v-if="slotProps.data.children.length > 1"
            type="button"
            class="expand-btn"
            :class="{ expanded: expandedRows[slotProps.data.date] }"
            @click="toggleRow(slotProps.data.date)"
          >
            <span class="pi pi-chevron-right expand-icon" />
          </button>
        </template>
      </Column>
      <Column field="date" header="Date" :sortable="true">
        <template #body="slotProps">
          {{ formatDate(slotProps.data.date) }}
        </template>
      </Column>
      <Column field="checkIn" header="Check In">
        <template #body="slotProps">
          {{ extractTime(slotProps.data.checkIn) }}
        </template>
      </Column>
      <Column field="checkOut" header="Check Out">
        <template #body="slotProps">
          {{ extractTime(slotProps.data.checkOut) }}
        </template>
      </Column>
      <Column field="totalOre" header="Total Hours">
        <template #body="slotProps">
          <span
            v-if="isRounded(slotProps.data.totalOre)"
            class="ore-rounded"
            :data-tooltip="`Actual: ${slotProps.data.totalOre} h`"
          >{{ displayOre(slotProps.data.totalOre) }} h</span>
          <span v-else>{{ slotProps.data.totalOre }} h</span>
        </template>
      </Column>
      <Column field="tipologia_attivita" header="Working Type">
        <template #body="slotProps">
          <span
            v-for="type in slotProps.data.workingTypes"
            :key="type"
            class="working-type-badge"
          >
            {{ type }}
          </span>
        </template>
      </Column>

      <template #expansion="slotProps">
        <div class="child-table-wrapper">
          <DataTable :value="slotProps.data.children" :stripedRows="true">
            <Column field="nota" header="Note">
              <template #body="childSlot">
                {{ childSlot.data.nota ?? '-' }}
              </template>
            </Column>
            <Column field="created_at" header="Check In">
              <template #body="childSlot">
                {{ extractTime(childSlot.data.created_at) }}
              </template>
            </Column>
            <Column field="updated_at" header="Check Out">
              <template #body="childSlot">
                {{ extractTime(childSlot.data.updated_at) }}
              </template>
            </Column>
            <Column field="ore" header="Hours">
              <template #body="childSlot">
                <span
                  v-if="isRounded(childSlot.data.ore)"
                  class="ore-rounded"
                  :data-tooltip="`Actual: ${childSlot.data.ore} h`"
                >{{ displayOre(childSlot.data.ore) }} h</span>
                <span v-else>{{ childSlot.data.ore }} h</span>
              </template>
            </Column>
            <Column field="tipologia_attivita" header="Working Type">
              <template #body="childSlot">
                <span class="working-type-badge">
                  {{ childSlot.data.tipologia_attivita ?? '-' }}
                </span>
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import type { IDoInnAttendanceRecord } from '@/types/attendance.types.ts'
import dayjs from 'dayjs'

interface IGroupedRow {
  date: string
  checkIn: string | null
  checkOut: string | null
  totalOre: string
  workingTypes: string[]
  children: IDoInnAttendanceRecord[]
}

interface IDoInnAttendanceTableProps {
  data?: IDoInnAttendanceRecord[]
  paginator?: boolean
  rowsPerPage?: number
  rowsPerPageOptions?: number[]
  stripedRows?: boolean
}

const props = withDefaults(defineProps<IDoInnAttendanceTableProps>(), {
  data: () => [],
  paginator: false,
  rowsPerPage: 50,
  rowsPerPageOptions: () => [5, 10, 20, 50],
  stripedRows: true,
})

const expandedRows = ref<Record<string, boolean>>({})

const toggleRow = (date: string) => {
  if (expandedRows.value[date]) {
    const { [date]: _, ...rest } = expandedRows.value
    expandedRows.value = rest
  } else {
    expandedRows.value = { ...expandedRows.value, [date]: true }
  }
}

const groupedData = computed<IGroupedRow[]>(() => {
  const records = props.data.slice(1) // skip the summary first element

  const groups = new Map<string, IDoInnAttendanceRecord[]>()
  for (const record of records) {
    const key = record.data
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(record)
  }

  return Array.from(groups.entries())
    .map(([date, children]) => {
      const totalMinutes = children.reduce((sum, r) => sum + oreToMinutes(r.ore || '0'), 0)
      const totalOre = minutesToOre(totalMinutes)

      const sortedCheckIns = children
        .map((r) => r.created_at)
        .filter(Boolean)
        .sort() as string[]
      const sortedCheckOuts = children
        .map((r) => r.updated_at)
        .filter(Boolean)
        .sort() as string[]

      const workingTypes = [
        ...new Set(children.map((r) => r.tipologia_attivita).filter(Boolean) as string[]),
      ]

      return {
        date,
        checkIn: sortedCheckIns[0] ?? null,
        checkOut: sortedCheckOuts[sortedCheckOuts.length - 1] ?? null,
        totalOre,
        workingTypes,
        children,
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date))
})

// ore field is in HH.MM format (e.g. "7.45" = 7h 45m, not decimal hours)
const oreToMinutes = (ore: string): number => {
  const [h, m] = ore.split('.')
  return parseInt(h || '0', 10) * 60 + parseInt((m || '0').padEnd(2, '0').slice(0, 2), 10)
}

const minutesToOre = (total: number): string => {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${h}.${m.toString().padStart(2, '0')}`
}

const EIGHT_HOURS_MINUTES = 480
const ROUND_THRESHOLD = 15

const isRounded = (ore: string): boolean =>
  Math.abs(oreToMinutes(ore) - EIGHT_HOURS_MINUTES) <= ROUND_THRESHOLD &&
  oreToMinutes(ore) !== EIGHT_HOURS_MINUTES

const displayOre = (ore: string): string =>
  Math.abs(oreToMinutes(ore) - EIGHT_HOURS_MINUTES) <= ROUND_THRESHOLD ? '8' : ore

const getRowClass = (row: IGroupedRow) => {
  if (row.children.length <= 1) return ''
  return expandedRows.value[row.date] ? 'summary-row summary-row-expanded' : 'summary-row'
}

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '-'
  return dayjs(dateStr).format('DD/MM/YYYY')
}

const extractTime = (dateTimeStr: string | null) => {
  if (!dateTimeStr) return '-'
  return dayjs(dateTimeStr).format('HH:mm')
}
</script>

<style scoped>
.attendance-table-wrapper {
  width: 100%;
}

.child-table-wrapper {
  padding: 0 1rem 1rem 3rem;
}

.working-type-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  background-color: #f0f4ff;
  color: #4a6cf7;
  margin-right: 4px;
}

.expand-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 1.5px solid #d1d5db;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s, box-shadow 0.15s;
  color: #6b7280;
}

.expand-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.expand-icon {
  font-size: 11px;
  transition: transform 0.2s ease;
}

.expand-btn.expanded .expand-icon {
  transform: rotate(90deg);
}

:deep(.summary-row) {
  background-color: #f8f9fb !important;
  font-weight: 500;
}

:deep(.summary-row-expanded > td) {
  border-top: 1px solid #9ca3af !important;
}
:deep(.summary-row-expanded > td:first-child) {
  border-left: 1px solid #9ca3af !important;
}
:deep(.summary-row-expanded > td:last-child) {
  border-right: 1px solid #9ca3af !important;
}
.ore-rounded {
  cursor: help;
  text-decoration: underline dotted #9ca3af;
  position: relative;
}

.ore-rounded::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: #1e293b;
  color: #fff;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 5px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
  z-index: 10;
}

.ore-rounded:hover::after {
  opacity: 1;
}

:deep(.summary-row-expanded + tr > td) {
  border-left: 1px solid #9ca3af !important;
  border-right: 1px solid #9ca3af !important;
  border-bottom: 1px solid #9ca3af !important;
}
</style>
