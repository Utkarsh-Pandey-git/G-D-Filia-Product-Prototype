import { useNavigate } from 'react-router';
import { useWallet } from '../../context/WalletContext';
import { ArrowLeft, Wifi, WifiOff, ArrowUpCircle, ArrowDownCircle, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { format } from 'date-fns';

export const TransactionHistory = () => {
  const navigate = useNavigate();
  const { transactions } = useWallet();

  const getTransactionIcon = (type: string, amount: number) => {
    if (type === 'auto-top-up') return RefreshCcw;
    if (amount < 0) return ArrowDownCircle;
    return ArrowUpCircle;
  };

  const getTransactionColor = (type: string, amount: number) => {
    if (type === 'auto-top-up') return 'text-blue-600 bg-blue-50';
    if (amount < 0) return 'text-red-600 bg-red-50';
    return 'text-green-600 bg-green-50';
  };

  return (
    <div className="h-full flex flex-col">
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
        <h2 className="mb-2">Transaction History</h2>
        <p className="text-sm text-muted-foreground">
          All your recent payments and top-ups
        </p>
      </div>

      {/* Transaction List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-3">
          {transactions.map((transaction, index) => {
            const Icon = getTransactionIcon(transaction.type, transaction.amount);
            const colorClass = getTransactionColor(transaction.type, transaction.amount);
            const isOffline = transaction.mode === 'offline';

            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-muted hover:bg-accent transition-colors"
              >
                <div className={`w-12 h-12 rounded-full ${colorClass} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="truncate">{transaction.description}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground">
                      {format(transaction.timestamp, 'MMM d, h:mm a')}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <div className="flex items-center gap-1">
                      {isOffline ? (
                        <WifiOff className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <Wifi className="w-3 h-3 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {isOffline ? 'Offline' : 'Online'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className={transaction.amount < 0 ? 'text-foreground' : 'text-green-600'}>
                    {transaction.amount < 0 ? '-' : '+'}€
                    {Math.abs(transaction.amount).toFixed(2)}
                  </div>
                  {transaction.type === 'auto-top-up' && (
                    <span className="text-xs text-blue-600">Auto</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {transactions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
