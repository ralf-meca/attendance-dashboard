export interface AttendanceRecord {
  id: number
  contactId: number
  checkInTime: string | null
  checkOutTime: string | null
  date: string
  isDeleted: boolean
  lunchStart: string | null
  lunchEnd: string | null
  onPermission: boolean | null
  absence: boolean
  totalHours: number | null
  workingMode: string | null
  workingType: string | null
}
