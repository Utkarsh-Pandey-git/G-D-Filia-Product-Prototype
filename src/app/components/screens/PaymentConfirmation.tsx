import { useState, useRef } from 'react';
import { useNavigate } from 'react-router';
import { useWallet } from '../../context/WalletContext';
import { CheckCircle2, Smartphone, WifiOff, Wifi, Cpu, Plus, Minus } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';

export const PaymentConfirmation = () => {
  const navigate = useNavigate();
  const { makePayment, connectionStatus, offlineBalance, onlineBalance } = useWallet();

  const [phase, setPhase] = useState<'input' | 'processing' | 'complete' | 'failed'>('input');
  const [amount, setAmount] = useState(8.50);
  const hasRun = useRef(false);

  const isOffline = connectionStatus === 'offline';
  const availableBalance = isOffline ? offlineBalance : onlineBalance;
  const step = 0.50;

  const processPayment = async () => {
    if (hasRun.current) return;
    hasRun.current = true;
    setPhase('processing');
    await new Promise(resolve => setTimeout(resolve, 1800));
    const success = await makePayment(amount, 'Store Payment');
    if (success) {
      setPhase('complete');
      setTimeout(() => navigate('/'), 2500);
    } else {
      setPhase('failed');
    }
  };

  // INPUT PHASE
  if (phase === 'input') {
    return (
      <div className={`h-full flex flex-col transition-colors duration-500 ${
        isOffline ? 'bg-slate-900 text-slate-100' : 'bg-white'
      }`}>
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <p className={`text-sm mb-2 ${isOffline ? 'text-slate-400' : 'text-muted-foreground'}`}>
            {isOffline ? 'Offline Payment' : 'Payment Amount'}
          </p>

          <div className={`text-7xl tracking-tight mb-2 font-medium ${
            isOffline ? 'text-slate-100' : 'text-foreground'
          }`}>
            €{amount.toFixed(2)}
          </div>

          <p className={`text-sm mb-10 ${isOffline ? 'text-slate-500' : 'text-muted-foreground'}`}>
            {isOffline ? 'Offline' : 'Available'}: €{availableBalance.toFixed(2)}
          </p>

          {/* +/- controls with preset buttons */}
          <div className="flex items-center gap-5 mb-10">
            <Button
              variant="outline"
              size="lg"
              className={`w-14 h-14 rounded-full ${
                isOffline ? 'border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700' : ''
              }`}
              onClick={() => setAmount(prev => Math.max(0.50, parseFloat((prev - step).toFixed(2))))}
            >
              <Minus className="w-5 h-5" />
            </Button>

            <div className="flex gap-2">
              {[5, 10, 20].map(preset => (
                <button
                  key={preset}
                  onClick={() => setAmount(preset)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    amount === preset
                      ? isOffline
                        ? 'bg-slate-100 text-slate-900'
                        : 'bg-foreground text-background'
                      : isOffline
                        ? 'border border-slate-600 text-slate-400 hover:bg-slate-800'
                        : 'border border-border text-muted-foreground hover:bg-accent'
                  }`}
                >
                  €{preset}
                </button>
              ))}
            </div>

            <Button
              variant="outline"
              size="lg"
              className={`w-14 h-14 rounded-full ${
                isOffline ? 'border-slate-600 text-slate-300 bg-slate-800 hover:bg-slate-700' : ''
              }`}
              onClick={() => setAmount(prev => parseFloat((prev + step).toFixed(2)))}
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {/* Insufficient balance warning */}
          {amount > availableBalance && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-red-500 mb-4"
            >
              {isOffline
                ? 'Insufficient offline balance. Reconnect to top up'
                : 'Insufficient balance'}
            </motion.p>
          )}
        </div>

        <div className="px-6 pb-10 space-y-3">
          <Button
            size="lg"
            className={`w-full h-14 rounded-2xl ${
              isOffline ? 'bg-slate-100 text-slate-900 hover:bg-slate-200' : ''
            }`}
            onClick={processPayment}
            disabled={amount <= 0 || amount > availableBalance}
          >
            {isOffline ? 'Pay Offline' : 'Pay'} €{amount.toFixed(2)}
          </Button>
          <Button
            size="lg"
            variant="ghost"
            className={`w-full h-14 rounded-2xl ${isOffline ? 'text-slate-400' : ''}`}
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  // PROCESSING / COMPLETE / FAILED PHASES
  return (
    <div className={`h-full flex flex-col items-center justify-center px-6 relative overflow-hidden transition-colors duration-500 ${
      isOffline ? 'bg-slate-900' : 'bg-white'
    }`}>
      {phase === 'processing' && !isOffline && (
        <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
      )}
      {phase === 'complete' && !isOffline && (
        <motion.div className="absolute inset-0 bg-gradient-to-br from-green-50 to-emerald-50"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
      )}

      <div className="relative z-10 text-center">

        {/* Processing */}
        {phase === 'processing' && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                isOffline ? 'bg-slate-700' : 'bg-blue-100'
              }`}
            >
              {isOffline
                ? <Cpu className="w-12 h-12 text-slate-300" />
                : <Smartphone className="w-12 h-12 text-blue-600" />}
            </motion.div>

            <div>
              <h2 className={`mb-2 ${isOffline ? 'text-slate-100' : ''}`}>
                Processing €{amount.toFixed(2)}
              </h2>
              <p className={isOffline ? 'text-slate-400' : 'text-muted-foreground'}>
                {isOffline
                  ? 'NFC chip-to-chip handshake with POS terminal...'
                  : 'Please hold your device near the reader'}
              </p>
              {isOffline && (
                <motion.div
                  className="mt-4 px-4 py-3 rounded-xl bg-slate-800 text-sm text-slate-400 max-w-xs mx-auto"
                  initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                >
                  Exchanging tokens via Secure Element. No internet required
                </motion.div>
              )}
            </div>

            <div className="relative w-32 h-32 mx-auto">
              {[0, 1, 2].map(i => (
                <motion.div key={i}
                  className={`absolute inset-0 rounded-full border-2 ${isOffline ? 'border-slate-500' : 'border-blue-400'}`}
                  initial={{ scale: 0.8, opacity: 0.8 }}
                  animate={{ scale: [0.8, 1.5], opacity: [0.8, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Complete */}
        {phase === 'complete' && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
            <motion.div
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-24 h-24 mx-auto rounded-full bg-green-100 flex items-center justify-center"
            >
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </motion.div>
            <div>
              <h2 className={`mb-1 ${isOffline ? 'text-slate-100' : ''}`}>Payment Complete</h2>
              <p className={`text-2xl font-medium mb-3 ${isOffline ? 'text-slate-300' : 'text-foreground'}`}>
                €{amount.toFixed(2)}
              </p>
              <p className={`flex items-center justify-center gap-2 ${isOffline ? 'text-slate-400' : 'text-muted-foreground'}`}>
                {isOffline
                  ? <><WifiOff className="w-4 h-4" /> Processed offline via Secure Element</>
                  : <><Wifi className="w-4 h-4" /> Processed online</>}
              </p>
            </div>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
              className={`text-sm ${isOffline ? 'text-slate-500' : 'text-muted-foreground'}`}>
              Returning to home...
            </motion.div>
          </motion.div>
        )}

        {/* Failed */}
        {phase === 'failed' && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-6">
            <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${isOffline ? 'bg-red-900' : 'bg-red-100'}`}>
              <span className="text-4xl">⚠️</span>
            </div>
            <div>
              <h2 className={`mb-2 ${isOffline ? 'text-slate-100' : ''}`}>Payment Failed</h2>
              <p className={isOffline ? 'text-slate-400' : 'text-muted-foreground'}>
                {isOffline ? 'Insufficient offline balance' : 'Insufficient balance'}
              </p>
            </div>
            {isOffline && (
              <p className="text-sm text-slate-400 max-w-xs mx-auto">
                Please reconnect to the internet to top up your offline wallet
              </p>
            )}
            <Button size="lg" className="rounded-2xl" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};
