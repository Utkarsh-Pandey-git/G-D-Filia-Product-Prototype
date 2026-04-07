import { RouterProvider, useNavigate } from 'react-router';
import { WalletProvider, useWallet } from './context/WalletContext';
import { Toaster } from './components/ui/sonner';
import { useEffect } from 'react';
import { createHashRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Home } from './components/screens/Home';
import { Onboarding } from './components/screens/Onboarding';
import { AutoReplenishmentSetup } from './components/screens/AutoReplenishmentSetup';
import { PaymentConfirmation } from './components/screens/PaymentConfirmation';
import { TransactionHistory } from './components/screens/TransactionHistory';
import { ManualTransfer } from './components/screens/ManualTransfer';

// Redirect to onboarding when wallet has never been set up.
// Uses wallet state - not localStorage, so it works on any host, any browser.
function OnboardingGuard() {
  const navigate = useNavigate();
  const { autoReplenishment, offlineBalance } = useWallet();

  useEffect(() => {
    const notSetUp = !autoReplenishment.enabled && offlineBalance === 0;
    const skipped = localStorage.getItem('filia_onboarding_skipped') === 'true';
    if (notSetUp && !skipped) {
      navigate('/onboarding');
    }
  }, [autoReplenishment.enabled, offlineBalance, navigate]);

  return null;
}

const appRouter = createHashRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      {
        index: true,
        Component: () => (
          <>
            <OnboardingGuard />
            <Home />
          </>
        ),
      },
      { path: 'onboarding', Component: Onboarding },
      { path: 'auto-replenishment', Component: AutoReplenishmentSetup },
      { path: 'manual-transfer', Component: ManualTransfer },
      { path: 'payment-confirmation', Component: PaymentConfirmation },
      { path: 'history', Component: TransactionHistory },
    ],
  },
]);

export default function App() {
  return (
    <WalletProvider>
      <RouterProvider router={appRouter} />
      <Toaster position="top-center" />
    </WalletProvider>
  );
}
