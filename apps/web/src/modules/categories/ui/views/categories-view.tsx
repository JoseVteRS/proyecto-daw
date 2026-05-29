import { CategoryCard } from '@/modules/categories/ui/components/category-card'
import { CreateCategoryDrawer } from '@/modules/categories/ui/components/create-category-drawer'
import { useCategoriesQuery } from '@/modules/categories/queries/use-categories-query'

export function CategoriesView() {
  const categoriesQuery = useCategoriesQuery()
  const categories = categoriesQuery.data ?? []

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col text-foreground">
      <div className="flex min-h-0 flex-1 flex-col px-4 py-4">
        <h2 className="text-lg font-semibold">Categorías</h2>
        <p className="mt-1 text-sm text-muted-foreground">Gestiona tus categorías personales.</p>

        {categoriesQuery.isError ? <p className="mt-4 text-sm text-red-600">No se pudieron cargar las categorías.</p> : null}

        {categoriesQuery.isLoading ? (
          <div className="mt-4 space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-lg border border-border bg-muted/60" />
            ))}
          </div>
        ) : null}

        {!categoriesQuery.isLoading && !categoriesQuery.isError && categories.length === 0 ? (
          <div className="mt-6 rounded-lg border border-dashed border-border px-4 py-6 text-center">
            <p className="text-sm text-muted-foreground">Aun no tienes categorías creadas.</p>
            <p className="mt-1 text-xs text-muted-foreground">Pulsa el botón + para crear la primera.</p>
          </div>
        ) : null}

        {!categoriesQuery.isLoading && !categoriesQuery.isError && categories.length > 0 ? (
          <div className="mt-4 space-y-3 overflow-y-auto pb-24">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : null}
      </div>

      <CreateCategoryDrawer />
    </div>
  )
}
