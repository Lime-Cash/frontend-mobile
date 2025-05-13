export interface Transaction {
  id: string;
  message: string;
  date: string;
  price: number;
}

export const transactionService = {
  getTransactions: async (): Promise<Transaction[]> => {
    console.log("TransactionService: Fetching transactions");

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock transactions data that would normally come from an API
    const mockTransactions: Transaction[] = [
      {
        id: "1",
        message: "Transfer to Mike Johnson",
        date: "4/25/2025",
        price: -1000.0,
      },
      {
        id: "2",
        message: "Card Deposit",
        date: "4/25/2025",
        price: 200.0,
      },
      {
        id: "3",
        message: "Monthly Subscription",
        date: "4/20/2025",
        price: -15.99,
      },
      {
        id: "4",
        message: "Refund from Amazon",
        date: "4/18/2025",
        price: 45.67,
      },
      {
        id: "5",
        message: "Grocery Store",
        date: "4/15/2025",
        price: -78.35,
      },
      {
        id: "6",
        message: "Salary Deposit",
        date: "4/10/2025",
        price: 2500.0,
      },
    ];

    return mockTransactions;
  },

  getTransactionById: async (id: string): Promise<Transaction | null> => {
    console.log(`TransactionService: Fetching transaction with id: ${id}`);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    const transactions = await transactionService.getTransactions();
    return transactions.find((transaction) => transaction.id === id) || null;
  },
};
