import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useWallet } from '../../context/WalletContext';
import { ArrowLeft, Check, Fingerprint } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { toast } from 'sonner';

export const AutoReplenishmentSetup = () => {
  const navigate = useNavigate();
  const { autoReplenishment, updateAutoReplenishment } = useWallet();

  const isOnboarding = new URLSearchParams(window.location.search).get('onboarding') === 'true';

  const [enabled, setEnabled] = useState(autoReplenishment.enabled);
  const [minThreshold, setMinThreshold] = useState(autoReplenishment.minThreshold);
  const [showBiometric, setShowBiometric] = useState(false);
  const [biometricProcessing, setBiometricProcessing] = useState(false);

  const handleConfirm = () => {
    setShowBiometric(true);
  };

  const handleBiometricConfirm = () => {
    setBiometricProcessing(true);
    setTimeout(() => {
      updateAutoReplenishment({
        enabled,
        minThreshold,
        targetBalance: minThreshold,
      });
      toast.success(enabled ? 'Auto Top-Up enabled' : 'Auto Top-Up disabled', {
        description: enabled
          ? `Your offline wallet will maintain a minimum of €${minThreshold}`
          : 'You can re-enable auto top-up anytime',
      });
      setBiometricProcessing(false);
      setShowBiometric(false);
      navigate('/');
    }, 1200);
  };

  return (
    <div className="h-full flex flex-col bg-white relative">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 border-b">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2"
          onClick={() => navigate(isOnboarding ? '/onboarding' : '/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {isOnboarding ? 'Back' : 'Back'}
        </Button>
        <h2 className="mb-2">One-Time Setup</h2>
        <p className="text-sm text-muted-foreground">
          Configure auto top-up once and never worry about offline payments again
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Toggle */}
        <motion.div
          className={`flex items-center justify-between p-5 rounded-2xl mb-8 transition-colors ${
            enabled ? 'bg-green-50 border-2 border-green-200' : 'bg-muted border-2 border-transparent'
          }`}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex-1 flex items-center gap-3">
            {enabled && (
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                <Check className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <h4 className={enabled ? 'text-green-900' : ''}>Auto Top-Up {enabled ? 'ON' : 'OFF'}</h4>
              <p className={`text-sm ${enabled ? 'text-green-700' : 'text-muted-foreground'}`}>
                {enabled ? 'Your offline wallet stays ready' : 'Enable automatic top-up'}
              </p>
            </div>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} className="scale-125" />
        </motion.div>

        {/* Minimum Balance Slider */}
        <AnimatePresence>
          {enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="block mb-3">Minimum Offline Balance</label>
                  <div className="text-center mb-6">
                    <div className="text-5xl tracking-tight">€{minThreshold.toFixed(0)}</div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Keep at least this much offline
                    </p>
                  </div>

                  <Slider
                    value={[minThreshold]}
                    onValueChange={(value) => setMinThreshold(value[0])}
                    min={10}
                    max={100}
                    step={5}
                    className="w-full"
                  />

                  <div className="flex justify-between text-xs text-muted-foreground mt-3">
                    <span>€10</span>
                    <span>€50</span>
                    <span>€100</span>
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="p-5 rounded-2xl bg-blue-50 border border-blue-200">
                <div className="space-y-3 text-sm text-blue-900">
                  <p><strong>How it works:</strong></p>
                  <p>
                    When your offline balance drops below €{minThreshold.toFixed(0)}, Filia
                    automatically transfers funds from your main balance to keep you ready
                    for offline payments.
                  </p>
                  <p className="text-xs text-blue-700">
                    This happens in the background whenever you're connected. You'll never
                    have to think about it.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirm Button */}
      <div className="px-6 py-6 border-t bg-white">
        <Button
          size="lg"
          className="w-full h-14 rounded-2xl"
          onClick={handleConfirm}
        >
          Confirm
        </Button>
      </div>

      {/* Biometric Auth Modal */}
      <AnimatePresence>
        {showBiometric && (
          <motion.div
            className="absolute inset-0 bg-black/50 flex items-end z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full bg-white rounded-t-3xl p-6 pb-10"
              initial={{ y: 200 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="text-center mb-6">
                <motion.div
                  className="w-16 h-16 mx-auto rounded-full bg-blue-50 flex items-center justify-center mb-4"
                  animate={biometricProcessing ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 0.8 }}
                >
                  {biometricProcessing ? (
                    <motion.div
                      className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
                    />
                  ) : (
                    <Fingerprint className="w-8 h-8 text-blue-600" />
                  )}
                </motion.div>
                <h3 className="mb-2">
                  {biometricProcessing ? 'Confirming...' : 'Confirm with biometrics'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {biometricProcessing
                    ? 'Signing your auto top-up rule on the Secure Element'
                    : 'This cryptographically signs your auto top-up rule on your device\'s Secure Element'}
                </p>
              </div>

              {!biometricProcessing && (
                <>
                  <Button
                    size="lg"
                    className="w-full h-14 rounded-2xl mb-3"
                    onClick={handleBiometricConfirm}
                  >
                    Confirm with Face ID
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setShowBiometric(false)}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
