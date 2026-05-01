import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import { Snackbar } from "./Snackbar";
import { useInitializeAppData } from "../hooks/useData";

export default function Layout() {
  useInitializeAppData();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col md:pl-64">
        <TopBar />
        <main className="flex-1 p-6 md:p-8">
          <Outlet />
        </main>
      </div>
      <Snackbar />
    </div>
  );
}
