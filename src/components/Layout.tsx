
import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-[#0d1117] flex">
      <Sidebar />
      <main className="flex-1 transition-all duration-300 ml-16 lg:ml-64">
        <div className="min-h-screen overflow-x-auto">
          <div className="min-w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
