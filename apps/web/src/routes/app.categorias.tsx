import { createFileRoute } from '@tanstack/react-router'

import { CategoriesView } from '@/modules/categories/ui/views/categories-view'

export const Route = createFileRoute('/app/categorias')({
  component: CategoriesView,
})
