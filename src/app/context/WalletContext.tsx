import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ConnectionStatus = 'online' | 'offline' | 'syncing';

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  type: 'payment' | 'top-up' | 'auto-top-up';
  mode: 'online' | 'offline';
  timestamp: Date;
  status: 'completed' | 'pending';
}

interface AutoReplenishmentConfig {
  enabled: boolean;
  minThreshold: number;
  targetBalance: number;
}

interface WalletContextType {
  onlineBalance: number;
  offlineBalance: number;
  totalBalance: number;
  connectionStatus: ConnectionStatus;
  autoReplenishment: AutoReplenishmentConfig;
  transactions: Transaction[];
  updateAutoReplenishment: (config: AutoReplenishmentConfig) => void;
  makePayment: (amount: number, description: string) => Promise<boolean>;
  transferToOfflineWallet: (amount: number) => void;
  setConnectionStatus: (status: ConnectionStatus) => void;
  lastAutoTopUp: { id: number; amount: number } | null;
  clearLastAutoTopUp: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [onlineBalance, setOnlineBalance] = useState(196.00);
  const [offlineBalance, setOfflineBalance] = useState(0.00);
  const [connectionStatus, setConnectionStatusRaw] = useState<ConnectionStatus>('online');
  const [lastAutoTopUp, setLastAutoTopUp] = useState<{ id: number; amount: number } | null>(null);
  const [autoReplenishment, setAutoReplenishment] = useState<AutoReplenishmentConfig>({
    enabled: false,
    minThreshold: 20,
    targetBalance: 20,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const totalBalance = onlineBalance + offlineBalance;

  useEffect(() => {
    if (autoReplenishment.enabled && connectionStatus === 'online') {
      if (offlineBalance < autoReplenishment.minThreshold) {
        const amountToAdd = autoReplenishment.targetBalance - offlineBalance;
        // Guard: only proceed if there is actually something to add
        if (amountToAdd <= 0) return;
        if (onlineBalance >= amountToAdd) {
          const timer = setTimeout(() => {
            setOfflineBalance(autoReplenishment.targetBalance);
            setOnlineBalance(prev => prev - amountToAdd);
            setLastAutoTopUp({ id: Date.now(), amount: amountToAdd });
            const newTransaction: Transaction = {
              id: Date.now().toString(),
              amount: amountToAdd,
              description: 'Auto top-up',
              type: 'auto-top-up',
              mode: 'online',
              timestamp: new Date(),
              status: 'completed',
            };
            setTransactions(prev => [newTransaction, ...prev]);
          }, 2000);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [offlineBalance, autoReplenishment, connectionStatus, onlineBalance]);

  const makePayment = async (amount: number, description: string): Promise<boolean> => {
    const paymentAmount = Math.abs(amount);
    if (connectionStatus === 'offline') {
      if (offlineBalance >= paymentAmount) {
        setOfflineBalance(prev => prev - paymentAmount);
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          amount: -paymentAmount,
          description,
          type: 'payment',
          mode: 'offline',
          timestamp: new Date(),
          status: 'completed',
        };
        setTransactions(prev => [newTransaction, ...prev]);
        return true;
      }
      return false;
    } else {
      if (onlineBalance >= paymentAmount) {
        setOnlineBalance(prev => prev - paymentAmount);
        const newTransaction: Transaction = {
          id: Date.now().toString(),
          amount: -paymentAmount,
          description,
          type: 'payment',
          mode: 'online',
          timestamp: new Date(),
          status: 'completed',
        };
        setTransactions(prev => [newTransaction, ...prev]);
        return true;
      }
      return false;
    }
  };

  const updateAutoReplenishment = (config: AutoReplenishmentConfig) => {
    setAutoReplenishment(config);
  };

  const transferToOfflineWallet = (amount: number) => {
    setOnlineBalance(prev => prev - amount);
    setOfflineBalance(prev => prev + amount);
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      amount: amount,
      description: 'Manual transfer',
      type: 'top-up',
      mode: 'online',
      timestamp: new Date(),
      status: 'completed',
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const handleSetConnectionStatus = (status: ConnectionStatus) => {
    if (status === 'online' && connectionStatus === 'offline') {
      setConnectionStatusRaw('syncing');
      setTimeout(() => {
        setConnectionStatusRaw('online');
      }, 2500);
    } else {
      setConnectionStatusRaw(status);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        onlineBalance,
        offlineBalance,
        totalBalance,
        connectionStatus,
        autoReplenishment,
        transactions,
        updateAutoReplenishment,
        makePayment,
        transferToOfflineWallet,
        setConnectionStatus: handleSetConnectionStatus,
        lastAutoTopUp,
        clearLastAutoTopUp: () => setLastAutoTopUp(null),
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
