import { CheckCircledIcon } from '@radix-ui/react-icons'
import { CircleIcon, EyeIcon } from 'lucide-react'

export const statuses = [
  {
    value: 'PENDING',
    label: 'Pending',
    icon: CircleIcon,
  },
  {
    value: 'WATCHING',
    label: 'Watching',
    icon: EyeIcon,
  },
  {
    value: 'WATCHED',
    label: 'Watched',
    icon: CheckCircledIcon,
  },
]
