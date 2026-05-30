export type PriorityValue = '1' | '2' | '3'

export type EventFormValues = {
  name: string
  description: string
  eventDateStart: Date
  eventDateEnd: Date
  priorityId: PriorityValue
}

export const priorityOptions: Array<{ value: PriorityValue; label: string }> = [
  { value: '1', label: 'Baja' },
  { value: '2', label: 'Media' },
  { value: '3', label: 'Alta' },
]

export const eventNameValidator = ({ value }: { value: string }) => {
  const trimmed = value.trim()
  if (trimmed.length < 2) return 'El nombre debe tener al menos 2 caracteres.'
  if (trimmed.length > 150) return 'El nombre no puede superar 150 caracteres.'
  return undefined
}

export const eventDescriptionValidator = ({ value }: { value: string }) =>
  value.length > 2000 ? 'La descripción no puede superar 2000 caracteres.' : undefined

export const eventDateStartValidator = ({ value }: { value: Date }) =>
  !value ? 'Fecha de inicio obligatoria.' : undefined

export const eventDateEndValidator = ({
  value,
  fieldApi,
}: {
  value: Date
  fieldApi: { form: { getFieldValue: (name: 'eventDateStart') => Date } }
}) => {
  if (!value) return 'Fecha de fin obligatoria.'
  const start = fieldApi.form.getFieldValue('eventDateStart')
  if (start && value.getTime() <= start.getTime()) {
    return 'Debe ser posterior al inicio.'
  }
  return undefined
}
