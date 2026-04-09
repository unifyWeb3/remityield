// lib/store.ts
// Simple in-memory state shared across pages (resets on refresh — fine for demo)

let _balance = 0;
let _earned = 0;
let _depositTime = 0;
let _hasReceived = false;
let _transactions: Transaction[] = [];

export interface Transaction {
  id: string;
  type: "receive" | "withdraw" | "yield";
  amount: number;
  timestamp: number;
  status: "complete" | "pending";
}

export const store = {
  get balance() { return _balance; },
  set balance(v: number) { _balance = v; },

  get earned() { return _earned; },
  set earned(v: number) { _earned = v; },

  get depositTime() { return _depositTime; },
  set depositTime(v: number) { _depositTime = v; },

  get hasReceived() { return _hasReceived; },
  set hasReceived(v: boolean) { _hasReceived = v; },

  get transactions() { return _transactions; },

  addTransaction(tx: Omit<Transaction, "id">) {
    _transactions.unshift({
      ...tx,
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    });
  },

  withdraw(amount: number) {
    _balance -= amount;
    _transactions.unshift({
      id: `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      type: "withdraw",
      amount,
      timestamp: Date.now(),
      status: "complete",
    });
  },

  reset() {
    _balance = 0;
    _earned = 0;
    _depositTime = 0;
    _hasReceived = false;
    _transactions = [];
  },
};