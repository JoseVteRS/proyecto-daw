import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteEvent } from '@/modules/calendar/server/api'

import { eventsKeys } from './events-keys'

export function useDeleteEventMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteEvent(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: eventsKeys.all })
    },
  })
}
