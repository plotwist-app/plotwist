import { Button } from '@plotwist/ui/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@plotwist/ui/components/ui/dialog'
import { Rating } from '@plotwist/ui/components/ui/ratings'
import { Textarea } from '@plotwist/ui/components/ui/textarea'

export function ItemReview() {
  return (
    <Dialog>
      <DialogTrigger>
        <Button size="sm" className="">
          Avaliar
        </Button>
      </DialogTrigger>

      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>O que você achou?</DialogTitle>
        </DialogHeader>

        <Rating />

        <Textarea placeholder="Deixe um comentário (opcional)" />

        <DialogFooter>
          <Button className="text">Cancelar</Button>
          <Button className="text">Avaliar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
