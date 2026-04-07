import { useNavigate } from 'react-router';
import { useWallet } from '../../context/WalletContext';
import { Wifi, WifiOff, RefreshCcw, History, Zap, Send, TriangleAlert, ArrowRight, Cpu, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

export const Home = () => {
  const navigate = useNavigate();
  const { totalBalance, offlineBalance, onlineBalance, connectionStatus, autoReplenishment, lastAutoTopUp, clearLastAutoTopUp } = useWallet();
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [seenZeroOfflineHelp, setSeenZeroOfflineHelp] = useState(
    () => localStorage.getItem('filia_seen_zero_offline') === 'true'
  );
  const [hasPreviouslyFundedOffline, setHasPreviouslyFundedOffline] = useState(
    () => localStorage.getItem('filia_ever_had_offline_balance') === 'true'
  );
  const lastToastedId = useRef<number | null>(null);

  const isOffline = connectionStatus === 'offline';
  const isSyncing = connectionStatus === 'syncing';
  const isPreOnboarding = !autoReplenishment.enabled && offlineBalance === 0;
  const isLowOfflineBalance = offlineBalance < autoReplenishment.minThreshold && !isOffline && !isSyncing && !autoReplenishment.enabled && !isPreOnboarding;
  const offlineReady = offlineBalance >= autoReplenishment.minThreshold;
  // Show contextual help only when: offline, zero balance, never seen before, AND never previously funded
  // If user has previously had offline balance they already understand the dual wallet system
  const showZeroOfflineHelp = isOffline && offlineBalance === 0 && !seenZeroOfflineHelp && !hasPreviouslyFundedOffline;
  // Show insufficient funds alert when auto top-up is on but online balance can't cover the top-up
  const amountNeededForTopUp = autoReplenishment.targetBalance - offlineBalance;
  const cannotAutoTopUp = autoReplenishment.enabled && !isOffline && !isSyncing
    && offlineBalance < autoReplenishment.minThreshold
    && onlineBalance < amountNeededForTopUp;

  useEffect(() => {
    if (offlineReady) setAlertDismissed(false);
  }, [offlineReady]);

  // Once the offline wallet ever has funds, record it so contextual help is never shown again
  useEffect(() => {
    if (offlineBalance > 0 && !hasPreviouslyFundedOffline) {
      localStorage.setItem('filia_ever_had_offline_balance', 'true');
      setHasPreviouslyFundedOffline(true);
    }
  }, [offlineBalance, hasPreviouslyFundedOffline]);

  // Toast once per auto top-up event, then clear so remounting Home doesn't re-fire
  useEffect(() => {
    if (lastAutoTopUp && lastAutoTopUp.id !== lastToastedId.current) {
      lastToastedId.current = lastAutoTopUp.id;
      toast.success(`Auto top-up: €${lastAutoTopUp.amount.toFixed(2)} transferred to offline wallet`, {
        duration: 4000,
      });
      clearLastAutoTopUp();
    }
  }, [lastAutoTopUp, clearLastAutoTopUp]);

  const getStatusInfo = () => {
    if (isSyncing) return { text: 'Syncing...', icon: RefreshCcw, color: 'text-blue-600' };
    if (isOffline) return { text: 'Offline Mode', icon: WifiOff, color: 'text-slate-400' };
    return { text: 'Connected', icon: Wifi, color: 'text-green-600' };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div
      className={`min-h-full flex flex-col transition-all duration-500 ${
        isOffline ? 'bg-slate-900 text-slate-100' : isSyncing ? 'bg-slate-800 text-slate-100' : 'bg-white'
      }`}
    >
      {/* HEADER - always at top */}
      <div className="px-6 pt-12 pb-3 flex items-center justify-between flex-shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 mb-0.5">
            <ShieldCheck className={`w-3 h-3 ${isOffline ? 'text-slate-500' : 'text-slate-400'}`} />
            <span className={`text-xs uppercase tracking-widest font-medium ${
              isOffline ? 'text-slate-500' : 'text-slate-400'
            }`}>G+D Filia</span>
          </div>
          <motion.div
            className="flex items-center gap-2"
            animate={{ opacity: isSyncing ? [0.5, 1, 0.5] : 1 }}
            transition={{ duration: 2, repeat: isSyncing ? Infinity : 0 }}
          >
            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
            <span className={`text-sm ${statusInfo.color}`}>{statusInfo.text}</span>
          </motion.div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className={`h-8 w-8 p-0 rounded-full ${isOffline ? 'text-slate-400 hover:text-slate-100' : ''}`}
          onClick={() => navigate('/history')}
        >
          <History className="w-4 h-4" />
        </Button>
      </div>

      {/* CENTRED BODY - alert + balance + buttons all grouped together */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-4 gap-5">

        {/* Alert - Screen 4, sits inside the centred section */}
        <AnimatePresence>
          {isLowOfflineBalance && !alertDismissed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full overflow-hidden"
            >
              <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-4">
                <div className="flex items-start gap-3 mb-3">
                  <TriangleAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-amber-900 mb-1">Filia Alert</h4>
                    <p className="text-sm text-amber-800">
                      Offline wallet: €{offlineBalance.toFixed(2)} - Top up now while online?
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white h-9 rounded-xl"
                    onClick={() => navigate('/manual-transfer')}
                  >
                    Top up <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="px-4 text-amber-900 hover:bg-amber-100 h-9 rounded-xl"
                    onClick={() => setAlertDismissed(true)}
                  >
                    Later
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Insufficient funds alert - auto top-up enabled but total balance too low */}
        <AnimatePresence>
          {cannotAutoTopUp && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full overflow-hidden"
            >
              <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <TriangleAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-red-900 mb-1">Cannot maintain offline wallet</h4>
                    <p className="text-sm text-red-800">
                      Your main balance (€{onlineBalance.toFixed(2)}) is too low to top up the
                      offline wallet to €{autoReplenishment.targetBalance.toFixed(0)}.
                      Add funds to restore offline payment capability.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center w-full"
        >
          {/* Syncing Mode - ledger reconciliation, balance hidden until resolved */}
          {isSyncing && (
            <>
              <p className="text-sm text-slate-400 mb-2">Reconciling with ledger...</p>
              <h1 className="text-6xl tracking-tight mb-4 text-slate-400">
                . . .
              </h1>
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-700 text-slate-300 border border-slate-600"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <RefreshCcw className="w-4 h-4 animate-spin" />
                <span className="text-sm">Syncing offline transactions...</span>
              </motion.div>
            </>
          )}

          {/* Online Mode - only show once fully synced */}
          {!isOffline && !isSyncing && (
            <>
              <p className="text-sm mb-2 text-muted-foreground">Total Balance</p>
              <h1 className="text-6xl tracking-tight mb-5">€{totalBalance.toFixed(2)}</h1>

              {offlineReady && (
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">Offline ready: €{offlineBalance.toFixed(2)}</span>
                </motion.div>
              )}

              {isLowOfflineBalance && (
                <motion.div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <TriangleAlert className="w-4 h-4" />
                  <span className="text-sm">Offline: €{offlineBalance.toFixed(2)} (low)</span>
                </motion.div>
              )}
            </>
          )}

          {/* Offline Mode */}
          {isOffline && !showZeroOfflineHelp && (
            <>
              <p className="text-sm text-slate-400 mb-2">Offline Balance</p>
              <h1 className="text-6xl tracking-tight mb-4">€{offlineBalance.toFixed(2)}</h1>

              {offlineBalance < 10 && (
                <p className="text-sm text-amber-400 mb-3">Low balance</p>
              )}

              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-700 text-slate-300 border border-slate-600"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15 }}
              >
                <Cpu className="w-4 h-4" />
                <span className="text-sm">Secure Element active</span>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Action buttons */}
        <div className="w-full space-y-3">
          {isSyncing && (
            <Button size="lg" className="w-full h-14 rounded-2xl bg-slate-700 text-slate-400 cursor-not-allowed" disabled>
              <RefreshCcw className="w-5 h-5 mr-2 animate-spin" />
              Syncing...
            </Button>
          )}

          {!isOffline && !isSyncing && (
            <>
              <Button
                size="lg"
                className="w-full h-14 rounded-2xl"
                onClick={() => navigate('/payment-confirmation')}
              >
                Tap to Pay
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="w-full h-14 rounded-2xl"
                onClick={() => navigate('/history')}
              >
                <History className="w-5 h-5 mr-2" />
                View History
              </Button>

              {isLowOfflineBalance && (
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full h-14 rounded-2xl border-blue-200 text-blue-600 hover:bg-blue-50"
                  onClick={() => navigate('/manual-transfer')}
                >
                  Transfer → Offline Wallet
                </Button>
              )}
            </>
          )}

          {isOffline && !showZeroOfflineHelp && (
            <>
              {/* Pay Offline with NFC ring animation */}
              <Button
                size="lg"
                className="w-full h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 relative overflow-hidden"
                onClick={() => navigate('/payment-confirmation')}
              >
                <motion.div
                  className="absolute inset-0 border-2 border-slate-400 rounded-2xl"
                  animate={{ scale: [1, 1.1, 1.2], opacity: [0.6, 0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
                />
                <motion.div
                  className="absolute inset-0 border-2 border-slate-400 rounded-2xl"
                  animate={{ scale: [1, 1.1, 1.2], opacity: [0.6, 0.3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
                />
                <span className="relative z-10">Pay Offline</span>
              </Button>

              <Button
                size="lg"
                variant="ghost"
                className="w-full h-14 rounded-2xl text-slate-600 opacity-40"
                disabled
              >
                <Send className="w-5 h-5 mr-2" />
                Send (online only)
              </Button>
            </>
          )}

          {/* Contextual zero-balance help - first time going offline with empty wallet */}
          {showZeroOfflineHelp && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-4"
            >
              {/* Two-wallet diagram */}
              <div className="flex items-stretch gap-3">
                <div className="flex-1 p-4 rounded-2xl bg-slate-800 border border-slate-600 flex flex-col">
                  <Wifi className="w-4 h-4 text-blue-400 mb-2" />
                  <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide">Online Wallet</p>
                  <p className="text-xl font-medium text-slate-200">€{totalBalance.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 mt-1">Needs internet</p>
                </div>
                <div className="flex items-center flex-shrink-0">
                  <ArrowRight className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1 p-4 rounded-2xl bg-red-950 border border-red-800 flex flex-col">
                  <Cpu className="w-4 h-4 text-red-400 mb-2" />
                  <p className="text-xs text-red-400 mb-1 uppercase tracking-wide">Offline Wallet</p>
                  <p className="text-xl font-medium text-red-300">€0.00</p>
                  <p className="text-xs text-red-600 mt-1">Empty - needs top-up</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-950 border border-amber-800">
                <p className="text-sm text-amber-300 leading-relaxed">
                  <strong>Why can't I pay?</strong> Filia uses two separate wallets.
                  Your main balance requires internet, but your offline wallet lives
                  on this device's chip and works without any connection.
                  To pay offline, you must transfer funds to the offline wallet
                  while connected first.
                </p>
              </div>

              <Button
                size="lg"
                className="w-full h-14 rounded-2xl bg-slate-100 text-slate-900 hover:bg-slate-200"
                onClick={() => {
                  localStorage.setItem('filia_seen_zero_offline', 'true');
                  setSeenZeroOfflineHelp(true);
                }}
              >
                Got it
              </Button>
              <p className="text-xs text-center text-slate-500">
                Reconnect to the internet to top up your offline wallet
              </p>
            </motion.div>
          )}
        </div>

        {/* Settings link */}
        {!isOffline && !isSyncing && (
          <Button
            variant="link"
            className="text-sm text-muted-foreground"
            onClick={() => navigate('/auto-replenishment')}
          >
            Auto Top-Up Settings
          </Button>
        )}
      </div>
    </div>
  );
};
