import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useWallet } from '../../context/WalletContext';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';
import { toast } from 'sonner';

export const ManualTransfer = () => {
  const navigate = useNavigate();
  const { onlineBalance, offlineBalance, autoReplenishment, transferToOfflineWallet } = useWallet();

  const [transferAmount, setTransferAmount] = useState(autoReplenishment.minThreshold);
  const maxTransfer = Math.min(onlineBalance, 200);

  const handleTransfer = () => {
    if (transferAmount > onlineBalance) {
      toast.error('Insufficient balance');
      return;
    }

    transferToOfflineWallet(transferAmount);

    toast.success('Transfer complete', {
      description: `€${transferAmount.toFixed(2)} added to offline wallet`,
    });

    setTimeout(() => {
      navigate('/');
    }, 1500);
  };

  const newOfflineBalance = offlineBalance + transferAmount;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-6 pt-12 pb-6 border-b">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h2 className="mb-2">Transfer to Offline Wallet</h2>
        <p className="text-sm text-muted-foreground">
          Add funds to your offline wallet for payments without internet
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 py-8 overflow-y-auto">
        {/* Current Balances */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="p-4 rounded-2xl bg-muted">
            <p className="text-xs text-muted-foreground mb-1">Main Balance</p>
            <div className="text-xl">€{onlineBalance.toFixed(2)}</div>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200">
            <p className="text-xs text-blue-700 mb-1">Offline Balance</p>
            <div className="text-xl text-blue-900">€{offlineBalance.toFixed(2)}</div>
          </div>
        </div>

        {/* Transfer Amount */}
        <div className="space-y-6 mb-8">
          <div>
            <label className="block mb-3">Transfer Amount</label>
            <div className="text-center mb-6">
              <div className="text-5xl tracking-tight">€{transferAmount.toFixed(0)}</div>
            </div>

            <Slider
              value={[transferAmount]}
              onValueChange={(value) => setTransferAmount(value[0])}
              min={10}
              max={maxTransfer}
              step={5}
              className="w-full"
            />

            <div className="flex justify-between text-xs text-muted-foreground mt-3">
              <span>€10</span>
              <span>€{maxTransfer.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Preview */}
        <motion.div
          className="p-5 rounded-2xl bg-green-50 border border-green-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-green-700">After transfer</span>
            <ArrowRight className="w-4 h-4 text-green-600" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Main Balance:</span>
              <span className="text-green-900">€{(onlineBalance - transferAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-green-700">Offline Balance:</span>
              <span className="text-green-900">€{newOfflineBalance.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Transfer Button */}
      <div className="px-6 py-6 border-t bg-white">
        <Button
          size="lg"
          className="w-full h-14 rounded-2xl"
          onClick={handleTransfer}
          disabled={transferAmount > onlineBalance}
        >
          Transfer €{transferAmount.toFixed(0)}
        </Button>
      </div>
    </div>
  );
};
