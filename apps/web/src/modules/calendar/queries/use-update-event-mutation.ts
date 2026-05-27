import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { UpdateEventInput } from '@proyecto-daw/shared'

import { updateEvent } from '@/modules/calendar/server/api'

import { eventsKeys } from './events-keys'

type UpdateEventArgs = {
  id: string
  input: UpdateEventInput
}

export function useUpdateEventMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: UpdateEventArgs) => updateEvent(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: eventsKeys.all })
    },
  })
}
