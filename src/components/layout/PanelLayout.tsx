import { Outlet } from 'react-router-dom';
import { useSidebarStore } from '@/stores/sidebar-store';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';

export function PanelLayout() {
  const { isOpen, close } = useSidebarStore();

  return (
    <div className="flex h-svh overflow-hidden bg-background text-foreground">
      {/* Backdrop mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      <AppSidebar />

      <div className="flex flex-1 flex-col overflow-auto">
        <AppTopbar />
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
