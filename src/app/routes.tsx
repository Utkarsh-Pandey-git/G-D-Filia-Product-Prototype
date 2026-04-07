import { createHashRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./components/screens/Home";
import { Onboarding } from "./components/screens/Onboarding";
import { AutoReplenishmentSetup } from "./components/screens/AutoReplenishmentSetup";
import { PaymentConfirmation } from "./components/screens/PaymentConfirmation";
import { TransactionHistory } from "./components/screens/TransactionHistory";
import { ManualTransfer } from "./components/screens/ManualTransfer";

export const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "onboarding", Component: Onboarding },
      { path: "auto-replenishment", Component: AutoReplenishmentSetup },
      { path: "manual-transfer", Component: ManualTransfer },
      { path: "payment-confirmation", Component: PaymentConfirmation },
      { path: "history", Component: TransactionHistory },
    ],
  },
]);
