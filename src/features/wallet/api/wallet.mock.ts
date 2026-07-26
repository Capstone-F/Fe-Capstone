import type { Wallet, WalletTransaction } from "../types/wallet.types";

const mockWallet: Wallet = {
  id: "wallet_demo_01",
  userId: "user_customer_demo",
  balanceVnd: 1000000, // Default 1,000,000 VND
  isActive: true,
  updatedAt: new Date().toISOString(),
};

const mockTransactions: WalletTransaction[] = [
  {
    id: "tx_01",
    walletId: "wallet_demo_01",
    amountVnd: 1000000,
    type: "TOP_UP",
    status: "COMPLETED",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const walletMock = {
  getWallet: async (): Promise<Wallet> => {
    return { ...mockWallet };
  },

  getTransactions: async (): Promise<WalletTransaction[]> => {
    return [...mockTransactions];
  },

  topUp: async (amountVnd: number): Promise<Wallet> => {
    mockWallet.balanceVnd += amountVnd;
    mockWallet.updatedAt = new Date().toISOString();

    mockTransactions.unshift({
      id: `tx_${Date.now()}`,
      walletId: mockWallet.id,
      amountVnd,
      type: "TOP_UP",
      status: "COMPLETED",
      createdAt: new Date().toISOString(),
    });

    return { ...mockWallet };
  },

  payConsultation: async (
    consultationId: string,
    amountVnd: number,
  ): Promise<Wallet> => {
    if (mockWallet.balanceVnd < amountVnd) {
      throw new Error(
        `Số dư ví không đủ (${mockWallet.balanceVnd.toLocaleString(
          "vi-VN",
        )}đ). Vui lòng nạp thêm tiền vào ví để hoàn tất đặt lịch.`,
      );
    }

    mockWallet.balanceVnd -= amountVnd;
    mockWallet.updatedAt = new Date().toISOString();

    mockTransactions.unshift({
      id: `tx_${Date.now()}`,
      walletId: mockWallet.id,
      amountVnd,
      type: "CONSULTATION_PAYMENT",
      status: "COMPLETED",
      consultationId,
      createdAt: new Date().toISOString(),
    });

    return { ...mockWallet };
  },
};
