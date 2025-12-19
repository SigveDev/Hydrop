import * as React from 'react'
import { UseFormReturn, FieldValues, DefaultValues } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Loader2 } from 'lucide-react'

interface AuthFormProps<T extends FieldValues> {
  schema: z.ZodSchema<T>
  defaultValues: DefaultValues<T>
  onSubmit: (data: T, form: UseFormReturn<T>) => void
  children: (form: UseFormReturn<T>) => React.ReactNode
  submitText: string
  loadingText: string
  isLoading?: boolean
  className?: string
  form: UseFormReturn<T>
}

export function AuthForm<T extends FieldValues>({
  onSubmit,
  children,
  submitText,
  loadingText,
  isLoading = false,
  className = 'space-y-5',
  form,
}: AuthFormProps<T>) {
  const handleSubmit = (data: T) => {
    onSubmit(data, form)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className={className}>
        {children(form)}

        {form.formState.errors.root && (
          <div className="text-sm font-medium text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 p-3 rounded-xl">
            {form.formState.errors.root.message}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-[#0EA5E9] to-[#8B5CF6] hover:opacity-90 text-white font-semibold rounded-xl shadow-lg shadow-[#0EA5E9]/30 transition-all duration-200 hover:shadow-[#0EA5E9]/50"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              {loadingText}
            </div>
          ) : (
            submitText
          )}
        </Button>
      </form>
    </Form>
  )
}
