
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { TimerView } from "./TimerView";

interface TimerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TimerDialog = ({ open, onOpenChange }: TimerDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Minuteur</DialogTitle>
          <DialogDescription>Réglez votre temps de repos.</DialogDescription>
        </DialogHeader>
        <div className="p-4 pt-0">
          <TimerView />
        </div>
      </DialogContent>
    </Dialog>
  );
};
