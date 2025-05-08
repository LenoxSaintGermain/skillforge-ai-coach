
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import CoachChatPanel from "./CoachChatPanel";
import { Toaster } from "@/components/ui/toaster";

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1">
        <Suspense fallback={<div className="container py-8">Loading...</div>}>
          <Outlet />
        </Suspense>
      </main>
      
      <CoachChatPanel initialExpanded={false} />
      <Toaster />
    </div>
  );
};

export default AppLayout;
