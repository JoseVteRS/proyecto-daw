import { createContext, useContext, useState, type ReactNode } from 'react'

type CalendarSelectedDateContextValue = {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
}

const CalendarSelectedDateContext = createContext<CalendarSelectedDateContextValue | null>(null)

type CalendarSelectedDateProviderProps = {
  children: ReactNode
}

export function CalendarSelectedDateProvider({ children }: CalendarSelectedDateProviderProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date())

  return (
    <CalendarSelectedDateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </CalendarSelectedDateContext.Provider>
  )
}

export function useCalendarSelectedDate() {
  const context = useContext(CalendarSelectedDateContext)

  if (!context) {
    throw new Error('useCalendarSelectedDate debe usarse dentro de CalendarSelectedDateProvider')
  }

  return context
}
