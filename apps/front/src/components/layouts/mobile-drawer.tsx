import { Sheet } from '../ui/sheet';
import { Sidebar } from './sidebar';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  return (
    <Sheet isOpen={isOpen} onClose={onClose} side="left">
      <Sidebar onNavigate={onClose} />
    </Sheet>
  );
}
