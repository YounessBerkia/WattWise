import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { MobileNav } from '@/components/layout/mobile-nav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-shell min-h-screen">
      <Header />
      <div className="flex w-full gap-6 px-4 pt-2 pb-6 sm:px-6 xl:px-8 2xl:px-10">
        <Sidebar />
        <main
          id="main-content"
          className="motion-enter min-w-0 flex-1 px-1 pt-2 pb-24 sm:px-2 lg:px-0 lg:pt-4 lg:pb-6"
        >
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
