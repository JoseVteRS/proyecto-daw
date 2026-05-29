import { useQuery } from '@tanstack/react-query'

import { listCategories } from '@/modules/categories/server/api'

import { categoriesKeys } from './categories-keys'

export function useCategoriesQuery() {
  return useQuery({
    queryKey: categoriesKeys.list(),
    queryFn: listCategories,
    select: (data) => data.categories,
  })
}
