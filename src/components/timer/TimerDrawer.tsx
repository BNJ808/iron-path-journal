
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { TimerView } from "./TimerView";

interface TimerDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TimerDrawer = ({ open, onOpenChange }: TimerDrawerProps) => {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Minuteur</DrawerTitle>
            <DrawerDescription>Réglez votre temps de repos.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <TimerView />
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
};
