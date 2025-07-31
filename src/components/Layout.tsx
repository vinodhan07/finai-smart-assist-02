import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center border-b border-border bg-card shadow-card px-6">
            <SidebarTrigger className="mr-4" />
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold gradient-primary bg-clip-text text-transparent">
                FinAI
              </div>
              <span className="text-sm text-muted-foreground">Your Smart Finance Partner</span>
            </div>
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}