import { ListItemStatus } from '@/types/lists'
import { CheckCircle, Eye, LucideIcon, XCircle } from 'lucide-react'

type StatusBadgeProps = { status: ListItemStatus }

export const Status = ({ status }: StatusBadgeProps) => {
  const iconByStatus: Record<ListItemStatus, LucideIcon> = {
    PENDING: XCircle,
    WATCHED: CheckCircle,
    WATCHING: Eye,
  }

  const Icon = iconByStatus[status]

  return (
    <div className="flex items-center gap-1 text-sm capitalize">
      <Icon className="mr-1 h-4 w-4 text-muted-foreground" />
      {status.toLowerCase()}
    </div>
  )
}
