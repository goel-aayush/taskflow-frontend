import { Search, Bell, HelpCircle, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { useUserStore } from "../store/userStore";

export default function TopBar() {
  const currentUser = useUserStore((state) => state.currentUser);
  const isLoading = useUserStore((state) => state.isLoading);

  if (!currentUser && !isLoading) return null;

  return (
    <header className="w-full h-16 sticky top-0 z-40 bg-surface-container-lowest border-b border-outline-variant shadow-sm flex items-center justify-between px-6">
      <div className="flex items-center gap-4 flex-1">
        <button className="md:hidden p-2 text-secondary hover:bg-surface-container-low rounded-lg transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        <div className="flex items-center bg-surface-container-low rounded-full px-4 py-2 w-full max-w-md group focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search className="w-4 h-4 text-outline mr-2" />
          <input 
            className="bg-transparent border-none text-sm focus:ring-0 w-full text-on-surface placeholder-outline" 
            placeholder="Search tasks, teams, projects..." 
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center">
          <button className="p-2 text-secondary hover:bg-surface-container-low rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface-container-lowest"></span>
          </button>
          <button className="p-2 text-secondary hover:bg-surface-container-low rounded-full transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="h-8 w-px bg-outline-variant mx-2 hidden md:block"></div>

        {isLoading && !currentUser ? (
          <div className="flex items-center gap-3 pl-2">
            <div className="text-right hidden sm:block">
              <div className="w-24 h-4 bg-surface-container animate-pulse rounded"></div>
              <div className="w-16 h-3 bg-surface-container animate-pulse rounded mt-1 ml-auto"></div>
            </div>
            <div className="w-10 h-10 rounded-full bg-surface-container animate-pulse"></div>
          </div>
        ) : currentUser ? (
          <Link to="/settings" className="flex items-center gap-3 pl-2 hover:bg-surface-container-low p-1.5 rounded-xl transition-all group">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-on-surface leading-none group-hover:text-primary transition-colors">{currentUser.name}</p>
              <p className="text-xs text-secondary mt-1">{currentUser.role}</p>
            </div>
            <img 
              alt="User profile" 
              className="w-10 h-10 rounded-full border-2 border-primary-container/20 object-cover bg-surface-container shadow-sm group-hover:ring-2 group-hover:ring-primary group-hover:border-white transition-all" 
              src={currentUser.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=random`}
            />
          </Link>
        ) : null}
      </div>
    </header>
  );
}
