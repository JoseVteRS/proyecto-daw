import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function ViewTabs() {
  return (
    <Tabs defaultValue="mes">
      <TabsList className="grid w-full grid-cols-3 rounded-full bg-muted/80">
        <TabsTrigger className="rounded-full text-xs" value="mes">
          Mes
        </TabsTrigger>
        <TabsTrigger className="rounded-full text-xs" value="semana">
          Semana
        </TabsTrigger>
        <TabsTrigger className="rounded-full text-xs" value="dia">
          Día
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
