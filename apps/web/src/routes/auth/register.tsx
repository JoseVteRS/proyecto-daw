import { createFileRoute } from '@tanstack/react-router'

import { RegisterView } from '@/modules/auth/ui/views/register-view'

export const Route = createFileRoute('/auth/register')({ component: RegisterView })
