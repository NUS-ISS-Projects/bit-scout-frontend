import { TooltipProvider } from "@/components/ui/tooltip";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: DashboardLayoutProps) {
  return (
    <TooltipProvider>
      <div className='min-h-screen'>{children}</div>
    </TooltipProvider>
  );
}
