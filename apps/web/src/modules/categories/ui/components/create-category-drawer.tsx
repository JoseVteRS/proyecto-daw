import { useForm } from '@tanstack/react-form'
import { Plus } from 'lucide-react'
import { useState } from 'react'

import { FormAlert, FormField } from '@/components/form-field'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { FieldGroup } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCreateCategoryMutation } from '@/modules/categories/queries/use-create-category-mutation'

type FormValues = {
  name: string
  description: string
  color: string
}

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/

export function CreateCategoryDrawer() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const createCategoryMutation = useCreateCategoryMutation()

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      color: '',
    } satisfies FormValues,
    onSubmit: async ({ value, formApi }) => {
      setError(null)
      try {
        await createCategoryMutation.mutateAsync({
          name: value.name.trim(),
          description: value.description.trim() ? value.description.trim() : undefined,
          color: value.color.trim() ? value.color.trim() : undefined,
        })
        formApi.reset()
        setOpen(false)
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : 'Ha ocurrido un error inesperado.')
      }
    },
  })

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (!nextOpen) {
      setError(null)
    }
  }

  return (
    <Drawer open={open} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild>
        <Button
          aria-label="Crear categoría"
          className="fixed right-5 bottom-20 z-30 size-12 rounded-mc shadow-lg"
          size="icon"
          variant="default"
        >
          <Plus className="size-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Nueva categoría</DrawerTitle>
          <DrawerDescription>Añade una categoría para organizar tus eventos.</DrawerDescription>
        </DrawerHeader>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            void form.handleSubmit()
          }}
          className="flex flex-col gap-4 overflow-y-auto px-5 pt-2 pb-4"
        >
          <FieldGroup>
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) => {
                  const trimmed = value.trim()
                  if (trimmed.length < 2) return 'El nombre debe tener al menos 2 caracteres.'
                  if (trimmed.length > 100) return 'El nombre no puede superar 100 caracteres.'
                  return undefined
                },
              }}
            >
              {(field) => (
                <FormField label="Nombre" htmlFor={field.name} errors={field.state.meta.errors}>
                  <Input
                    id={field.name}
                    name={field.name}
                    maxLength={100}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    required
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field
              name="description"
              validators={{
                onChange: ({ value }) =>
                  value.length > 1000 ? 'La descripción no puede superar 1000 caracteres.' : undefined,
              }}
            >
              {(field) => (
                <FormField label="Descripción" htmlFor={field.name} errors={field.state.meta.errors}>
                  <Textarea
                    id={field.name}
                    name={field.name}
                    maxLength={1000}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="Opcional"
                  />
                </FormField>
              )}
            </form.Field>

            <form.Field
              name="color"
              validators={{
                onChange: ({ value }) => {
                  const trimmed = value.trim()
                  if (!trimmed) return undefined
                  return hexColorRegex.test(trimmed) ? undefined : 'Usa formato hexadecimal: #RRGGBB.'
                },
              }}
            >
              {(field) => (
                <FormField label="Color" htmlFor={field.name} errors={field.state.meta.errors}>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="#3B82F6"
                  />
                </FormField>
              )}
            </form.Field>

            {error ? <FormAlert message={error} /> : null}
          </FieldGroup>

          <DrawerFooter className="px-0 pt-2 pb-0">
            <Button type="submit" variant="default" disabled={createCategoryMutation.isPending}>
              {createCategoryMutation.isPending ? 'Creando...' : 'Crear categoría'}
            </Button>
            <DrawerClose asChild>
              <Button type="button" variant="ghost">
                Cancelar
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  )
}
