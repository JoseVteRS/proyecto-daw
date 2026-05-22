import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

export function Fab() {
  return (
    <Button
      aria-label="Crear evento"
      className="fixed right-5 bottom-20 z-30 size-14 rounded-full shadow-lg"
      size="icon"
      variant="default"
    >
      <Plus className="size-5" />
    </Button>
  )
}
