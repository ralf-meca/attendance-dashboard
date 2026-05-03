export interface IDoInnAttendanceRecord {
  id: string
  cliente: string
  ambito: string | null
  progetto: string | null
  tipologia_attivita: string | null
  nota: string | null
  data: string
  ore: string
  stato_dipendenza: string | null
}

export interface IDoInnAttendanceResponse {
  results: {
    success: string
    data: IDoInnAttendanceRecord[]
    total: number
  }
}

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
