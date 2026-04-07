import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Wifi, ArrowRight, Cpu, ShieldCheck } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

export const Onboarding = () => {
  const navigate = useNavigate();
  const { onlineBalance, offlineBalance } = useWallet();

  return (
    <div className="h-full flex flex-col bg-white px-6 pt-10 pb-24">

      {/* Brand + title */}
      <div className="text-center mb-6 flex-shrink-0">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 mb-4">
          <ShieldCheck className="w-4 h-4 text-slate-600" />
          <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">
            G+D Filia
          </span>
        </div>
        <h2 className="mb-2">Two wallets,<br />one experience</h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Filia splits your funds so you can pay anywhere,<br />
          even with no internet.
        </p>
      </div>

      {/* Two-wallet visual */}
      <div className="flex items-stretch gap-3 mb-5 flex-shrink-0">
        <motion.div
          className="flex-1 p-4 rounded-2xl bg-blue-50 border-2 border-blue-200"
          initial={{ x: -16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.35 }}
        >
          <Wifi className="w-5 h-5 text-blue-600 mb-2" />
          <p className="text-xs text-blue-700 mb-1 font-medium uppercase tracking-wide">Online Wallet</p>
          <p className="text-xl font-medium text-blue-900 mb-1">€{onlineBalance.toFixed(2)}</p>
          <p className="text-xs text-blue-600">Main balance · needs internet</p>
        </motion.div>

        <div className="flex flex-col items-center justify-center gap-0.5">
          <ArrowRight className="w-5 h-5 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">fills</span>
        </div>

        <motion.div
          className="flex-1 p-4 rounded-2xl bg-green-50 border-2 border-green-200"
          initial={{ x: 16, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.35, delay: 0.1 }}
        >
          <Cpu className="w-5 h-5 text-green-600 mb-2" />
          <p className="text-xs text-green-700 mb-1 font-medium uppercase tracking-wide">Offline Wallet</p>
          <p className="text-xl font-medium text-green-900 mb-1">€{offlineBalance.toFixed(2)}</p>
          <p className="text-xs text-green-600">On device chip · works offline</p>
        </motion.div>
      </div>

      {/* Key callout */}
      <motion.div
        className="p-4 rounded-2xl bg-amber-50 border border-amber-200 mb-5 flex-shrink-0"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <p className="text-sm text-amber-900 leading-relaxed">
          <strong>The key rule:</strong> The offline wallet must be loaded
          while you're online. Set a minimum once. Filia fills it
          automatically from then on.
        </p>
      </motion.div>

      {/* CTA - pushed to bottom */}
      <div className="mt-auto flex-shrink-0">
        <Button
          size="lg"
          className="w-full h-14 rounded-2xl"
          onClick={() => navigate('/auto-replenishment?onboarding=true')}
        >
          Set up Auto Top-Up
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-3">
          Takes 30 seconds. Never think about it again.
        </p>
        <Button
          variant="ghost"
          className="w-full mt-2 text-muted-foreground text-sm h-10"
          onClick={() => {
            localStorage.setItem('filia_onboarding_skipped', 'true');
            navigate('/');
          }}
        >
          Skip for now
        </Button>
      </div>
    </div>
  );
};
