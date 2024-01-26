import { Dictionary } from '@/utils/dictionaries'
import { CheckCircledIcon } from '@radix-ui/react-icons'
import { CircleIcon, EyeIcon } from 'lucide-react'

export const statuses = (dictionary: Dictionary) => [
  {
    value: 'PENDING',
    label: dictionary.statuses.pending,
    icon: CircleIcon,
  },
  {
    value: 'WATCHING',
    label: dictionary.statuses.watching,
    icon: EyeIcon,
  },
  {
    value: 'WATCHED',
    label: dictionary.statuses.watched,
    icon: CheckCircledIcon,
  },
]
