import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { useUIStore, NotificationType } from '../store/uiStore';
import { cn } from '../lib/utils';

const ICON_MAP: Record<NotificationType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
  error: <AlertCircle className="w-5 h-5 text-rose-500" />,
  info: <Info className="w-5 h-5 text-blue-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
};

const BG_MAP: Record<NotificationType, string> = {
  success: 'bg-emerald-50 border-emerald-100',
  error: 'bg-rose-50 border-rose-100',
  info: 'bg-blue-50 border-blue-100',
  warning: 'bg-amber-50 border-amber-100',
};

export const Snackbar: React.FC = () => {
  const { notifications, removeNotification } = useUIStore();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            layout
            className={cn(
              "pointer-events-auto flex items-center gap-4 px-5 py-4 min-w-[320px] max-w-md bg-white border rounded-2xl shadow-xl overflow-hidden",
              BG_MAP[notification.type]
            )}
          >
            <div className="flex-shrink-0">
              {ICON_MAP[notification.type]}
            </div>
            <div className="flex-grow">
              <p className="text-sm font-bold text-on-surface leading-tight">
                {notification.message}
              </p>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              className="flex-shrink-0 p-1 hover:bg-black/5 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-outline" />
            </button>
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 5, ease: "linear" }}
              className={cn(
                "absolute bottom-0 left-0 right-0 h-1 origin-left",
                notification.type === 'success' && "bg-emerald-500",
                notification.type === 'error' && "bg-rose-500",
                notification.type === 'info' && "bg-blue-500",
                notification.type === 'warning' && "bg-amber-500"
              )}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
