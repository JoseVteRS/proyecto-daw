import { Tabs as BaseTabs } from '@base-ui-components/react'
import * as React from 'react'

import { cn } from '@/lib/utils'

export const Tabs = BaseTabs.Root

export const TabsList = React.forwardRef<React.ElementRef<typeof BaseTabs.List>, React.ComponentPropsWithoutRef<typeof BaseTabs.List>>(
  ({ className, ...props }, ref) => (
    <BaseTabs.List
      className={cn('inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground', className)}
      ref={ref}
      {...props}
    />
  ),
)
TabsList.displayName = 'TabsList'

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof BaseTabs.Tab>,
  React.ComponentPropsWithoutRef<typeof BaseTabs.Tab>
>(({ className, ...props }, ref) => (
  <BaseTabs.Tab
    className={cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background data-[active]:bg-background data-[active]:text-foreground data-[active]:shadow-sm',
      className,
    )}
    ref={ref}
    {...props}
  />
))
TabsTrigger.displayName = 'TabsTrigger'

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof BaseTabs.Panel>,
  React.ComponentPropsWithoutRef<typeof BaseTabs.Panel>
>(({ className, ...props }, ref) => (
  <BaseTabs.Panel
    className={cn('mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', className)}
    ref={ref}
    {...props}
  />
))
TabsContent.displayName = 'TabsContent'
