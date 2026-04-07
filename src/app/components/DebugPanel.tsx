import { useState } from 'react';
import { useWallet, type ConnectionStatus } from '../context/WalletContext';
import { Wifi, WifiOff, ChevronUp, ChevronDown, Settings2 } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';

export const DebugPanel = () => {
  const { connectionStatus, setConnectionStatus } = useWallet();
  const [isOpen, setIsOpen] = useState(false);

  const statuses: { value: ConnectionStatus; label: string; icon: typeof Wifi }[] = [
    { value: 'online', label: 'Online', icon: Wifi },
    { value: 'offline', label: 'Offline', icon: WifiOff },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="mb-2 bg-black/90 backdrop-blur-sm text-white rounded-2xl p-3 shadow-2xl min-w-[200px]"
          >
            <div className="text-xs mb-2 text-center opacity-60 uppercase tracking-widest">
              Demo Controls
            </div>
            <div className="flex gap-2">
              {statuses.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  size="sm"
                  variant={connectionStatus === value ? 'secondary' : 'ghost'}
                  className={`flex-1 h-8 ${
                    connectionStatus === value
                      ? 'bg-white text-black'
                      : 'text-white hover:bg-white/20'
                  }`}
                  onClick={() => setConnectionStatus(value)}
                >
                  <Icon className="w-3 h-3 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-center">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-black/80 backdrop-blur-sm text-white rounded-full text-xs shadow-lg hover:bg-black/90 transition-colors"
        >
          <Settings2 className="w-3 h-3 opacity-70" />
          <span className="opacity-70">Demo</span>
          {isOpen
            ? <ChevronDown className="w-3 h-3 opacity-70" />
            : <ChevronUp className="w-3 h-3 opacity-70" />
          }
        </button>
      </div>
    </div>
  );
};
