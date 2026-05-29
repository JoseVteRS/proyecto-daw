import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createCategory } from '@/modules/categories/server/api'

import { categoriesKeys } from './categories-keys'

export function useCreateCategoryMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createCategory,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: categoriesKeys.all })
    },
  })
}
