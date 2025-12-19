import { Control, FieldValues, Path } from 'react-hook-form'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'

interface AuthFieldProps<T extends FieldValues> {
  control: Control<T>
  name: Path<T>
  label: string
  placeholder: string
  type?: string
}

export function AuthField<T extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  type = 'text',
}: AuthFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-[#1A1F2C] dark:text-white font-medium">
            {label}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              className="h-12 rounded-xl border-[#E5DEFF] dark:border-white/10 bg-white/50 dark:bg-white/5 focus:border-[#0EA5E9] dark:focus:border-[#0EA5E9] focus:ring-[#0EA5E9]/20 transition-colors placeholder:text-[#8E9196]"
            />
          </FormControl>
          <FormMessage className="text-red-500 dark:text-red-400" />
        </FormItem>
      )}
    />
  )
}
