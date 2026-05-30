import type { ReactElement, ReactNode } from 'react'
import { cloneElement, isValidElement } from 'react'

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
import { cn } from '@/lib/utils'

type FieldOrientation = 'vertical' | 'horizontal' | 'responsive'

type FormFieldProps = {
  label?: string
  description?: string
  htmlFor?: string
  errors?: Array<unknown>
  orientation?: FieldOrientation
  className?: string
  hideLabel?: boolean
  children: ReactNode
}

function getErrorMessage(errors?: Array<unknown>): string | undefined {
  const message = errors?.find((fieldError) => typeof fieldError === 'string')
  return typeof message === 'string' ? message : undefined
}

export function FormField({
  label,
  description,
  htmlFor,
  errors,
  orientation = 'vertical',
  className,
  hideLabel = false,
  children,
}: FormFieldProps) {
  const message = getErrorMessage(errors)
  const invalid = Boolean(message)

  const control =
    invalid && isValidElement(children)
      ? cloneElement(children as ReactElement<{ 'aria-invalid'?: boolean }>, { 'aria-invalid': true })
      : children

  return (
    <Field data-invalid={invalid || undefined} orientation={orientation} className={className}>
      {label ? (
        <FieldLabel htmlFor={htmlFor} className={cn(hideLabel && 'sr-only')}>
          {label}
        </FieldLabel>
      ) : null}
      <FieldContent>
        {control}
        {description ? <FieldDescription>{description}</FieldDescription> : null}
        {message ? <FieldError>{message}</FieldError> : null}
      </FieldContent>
    </Field>
  )
}

import { Alert, AlertDescription } from '@/components/ui/alert'

export function FormAlert({ message }: { message: string }) {
  return (
    <Alert variant="destructive">
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  )
}
