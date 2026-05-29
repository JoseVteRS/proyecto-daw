import type { CategoryListResponse } from '@proyecto-daw/shared'

type Category = CategoryListResponse['categories'][number]

type CategoryCardProps = {
  category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <article className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{category.name}</h3>
          {category.description ? <p className="mt-1 text-sm text-muted-foreground">{category.description}</p> : null}
        </div>
        <span
          className="mt-1 block size-3 rounded-full border border-border"
          style={{ backgroundColor: category.color ?? '#94A3B8' }}
          aria-label={`Color de ${category.name}`}
        />
      </div>
    </article>
  )
}
