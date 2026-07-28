const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user's financial dashboard data
const getFinances = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        availableBalance: true,
        pendingEscrow: true,
        lifetimeRevenue: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: parseInt(userId) },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    res.json({
      balances: user,
      transactions
    });
  } catch (error) {
    console.error('Error fetching finances:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Process MoMo Withdrawal
const withdrawFunds = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const withdrawalAmount = Number(amount);

    // Get current balance
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: { availableBalance: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (Number(user.availableBalance) < withdrawalAmount) {
      return res.status(400).json({ error: 'Insufficient funds' });
    }

    // Process withdrawal in a transaction
    const [updatedUser, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          availableBalance: {
            decrement: withdrawalAmount
          }
        }
      }),
      prisma.transaction.create({
        data: {
          userId: parseInt(userId),
          type: 'MoMo Withdrawal',
          amount: -withdrawalAmount,
          status: 'Completed'
        }
      })
    ]);

    res.json({
      message: 'Withdrawal successful',
      availableBalance: updatedUser.availableBalance,
      transaction
    });

  } catch (error) {
    console.error('Error processing withdrawal:', error);
    res.status(500).json({ error: 'Server error processing withdrawal' });
  }
};

// Process MoMo Deposit
const depositFunds = async (req, res) => {
  try {
    const { userId } = req.params;
    const { amount } = req.body;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const depositAmount = Number(amount);

    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [updatedUser, transaction] = await prisma.$transaction([
      prisma.user.update({
        where: { id: parseInt(userId) },
        data: {
          availableBalance: {
            increment: depositAmount
          }
        }
      }),
      prisma.transaction.create({
        data: {
          userId: parseInt(userId),
          type: 'Wallet Deposit',
          amount: depositAmount,
          status: 'Completed'
        }
      })
    ]);

    res.json({
      message: 'Deposit successful',
      availableBalance: updatedUser.availableBalance,
      transaction
    });

  } catch (error) {
    console.error('Error processing deposit:', error);
    res.status(500).json({ error: 'Server error processing deposit' });
  }
};

module.exports = {
  getFinances,
  withdrawFunds,
  depositFunds
};
