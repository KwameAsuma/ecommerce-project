const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createOrder = async (req, res) => {
  try {
    const { cartItems, deliveryAddress, paymentMethod } = req.body;
    const customerId = req.userId;

    if (!cartItems || cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    // Process orders within a transaction to ensure all succeed or all fail
    const now = new Date();
    const orderResults = await prisma.$transaction(async (tx) => {
      let totalOrderAmount = 0;
      const createdOrders = [];
      
      for (const item of cartItems) {
        let price = parseFloat(item.price) || 100.00;
        let vendorId = item.vendorId ? Number(item.vendorId) : null;
        let productId = !isNaN(Number(item.id)) ? Number(item.id) : null;

        // Attempt to fetch the true product from DB
        if (productId) {
          const product = await tx.nativeProduct.findUnique({
            where: { id: productId }
          });

          if (product) {
            price = parseFloat(product.price);
            vendorId = product.vendorId;
            // Gracefully deduct stock without throwing errors
            const newStock = Math.max(0, product.stockCount - (item.qty || 1));
            await tx.nativeProduct.update({
              where: { id: product.id },
              data: { stockCount: newStock }
            });
          }
        }

        // If vendorId is still missing (e.g. demo product), find default merchant
        if (!vendorId) {
          const firstVendor = await tx.user.findFirst({ where: { role: { in: ["MERCHANT", "merchant", "VENDOR", "vendor"] } } });
          vendorId = firstVendor ? firstVendor.id : customerId;
        }

        const itemTotal = price * (item.qty || 1);
        totalOrderAmount += itemTotal;

        // Generate random 4-digit OTP for delivery verification
        const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

        // Create Order (Held in Escrow automatically)
        const order = await tx.order.create({
          data: {
            customerId: customerId,
            vendorId: vendorId,
            productId: productId,
            quantity: item.qty || 1,
            totalAmount: (price * (item.qty || 1)).toFixed(2),
            status: "HELD_IN_ESCROW",
            deliveryAddress: deliveryAddress || "Standard Delivery",
            deliveryOtp: deliveryOtp,
            createdAt: now,
            updatedAt: now
          }
        });

        // Automatically record in merchant's Escrow account
        if (vendorId) {
          try {
            await tx.user.update({
              where: { id: Number(vendorId) },
              data: { pendingEscrow: { increment: price * (item.qty || 1) } }
            });
          } catch (e) {
            console.error("Could not increment vendor pendingEscrow:", e);
          }
        }
        
        // --- BACKEND SIMULATION ---
        // Automatically dispatch (mark as SHIPPED) 5 seconds after creation
        // This guarantees ALL orders move forward, even if the user leaves the page
        setTimeout(async () => {
          try {
            // Check if it was cancelled before auto-shipping
            const currentOrder = await prisma.order.findUnique({ where: { id: order.id } });
            if (currentOrder && currentOrder.status === "HELD_IN_ESCROW") {
              await prisma.order.update({
                where: { id: order.id },
                data: { status: "SHIPPED" }
              });
              console.log(`[Simulation] Order ${order.id} automatically SHIPPED.`);
            }
          } catch (e) {
            console.error("Backend auto-ship failed:", e);
          }
        }, 5000);

        createdOrders.push(order);
      }
      
      if (paymentMethod === "wallet") {
        const deliveryFee = createdOrders.length > 0 ? 45.00 : 0;
        const escrowFee = totalOrderAmount * 0.015;
        const totalToPay = totalOrderAmount + deliveryFee + escrowFee;

        const customer = await tx.user.findUnique({
          where: { id: customerId },
          select: { availableBalance: true }
        });
        if (!customer || Number(customer.availableBalance) < totalToPay) {
          throw new Error("Insufficient wallet balance for this purchase.");
        }

        // Deduct from wallet
        await tx.user.update({
          where: { id: customerId },
          data: { availableBalance: { decrement: totalToPay } }
        });
        
        // Log transaction
        await tx.transaction.create({
          data: {
            userId: customerId,
            type: 'Wallet Purchase',
            amount: -totalToPay,
            status: 'Completed'
          }
        });
      }
      
      return createdOrders;
    });

    res.status(201).json({ message: "Checkout successful. Funds securely held in Escrow.", orders: orderResults });
  } catch (error) {
    console.error("Checkout error:", error);
    res.status(400).json({ error: error.message || "Failed to process checkout" });
  }
};

exports.getCustomerOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { customerId: req.userId },
      include: {
        product: true,
        vendor: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching customer orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

exports.getVendorOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { vendorId: req.userId },
      include: {
        product: true,
        customer: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ orders });
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;
    
    // Validate order ownership
    const order = await prisma.order.findUnique({ where: { id: Number(orderId) }});
    if (!order) return res.status(404).json({ error: "Order not found" });

    // Enforce role-based status updates
    if (req.userRole === "merchant" && order.vendorId !== req.userId) {
      return res.status(403).json({ error: "Not authorized to update this order" });
    }
    if (req.userRole === "customer" && order.customerId !== req.userId) {
      return res.status(403).json({ error: "Not authorized to update this order" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: Number(orderId) },
      data: { status }
    });

    // When confirmed delivered, automatically transfer from Escrow to Merchant Virtual Wallet
    if ((status === "DELIVERED" || status === "RELEASED") && order.status !== "DELIVERED" && order.status !== "RELEASED") {
      try {
        const totalAmount = parseFloat(order.totalAmount || 0);
        const platformFee = totalAmount * 0.05;
        const merchantPayout = Math.max(0, totalAmount - platformFee);

        await prisma.$transaction(async (tx) => {
          const vendor = await tx.user.findUnique({ where: { id: order.vendorId } });
          if (vendor) {
            const currentEscrow = parseFloat(vendor.pendingEscrow || 0);
            const deductEscrow = Math.min(currentEscrow, totalAmount);
            
            await tx.user.update({
              where: { id: order.vendorId },
              data: {
                availableBalance: { increment: merchantPayout },
                lifetimeRevenue: { increment: merchantPayout },
                pendingEscrow: { decrement: deductEscrow }
              }
            });

            await tx.transaction.create({
              data: {
                userId: order.vendorId,
                type: 'Escrow to Virtual Wallet',
                amount: merchantPayout,
                status: 'Completed'
              }
            });
          }
        });
      } catch (err) {
        console.error("Error transferring escrow funds to virtual wallet on delivery:", err);
      }
    }

    res.status(200).json({ message: "Order status updated", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
};

exports.releaseEscrow = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    // Only the customer who placed the order can release escrow
    const order = await prisma.order.findUnique({ where: { id: Number(orderId) } });
    if (!order) return res.status(404).json({ error: "Order not found" });

    if (order.customerId !== req.userId) {
      return res.status(403).json({ error: "Not authorized to release escrow for this order" });
    }

    if (order.status === "DELIVERED") {
      return res.status(400).json({ error: "Escrow has already been released for this order" });
    }

    // Process escrow release in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update order status
      const updatedOrder = await tx.order.update({
        where: { id: order.id },
        data: { status: "DELIVERED" }
      });

      // 2. Transfer funds to merchant's availableBalance
      // Calculate platform fee (e.g., 5%)
      const totalAmount = parseFloat(order.totalAmount);
      const platformFee = totalAmount * 0.05;
      const merchantPayout = totalAmount - platformFee;

      const vendor = await tx.user.findUnique({ where: { id: order.vendorId } });
      const currentEscrow = vendor ? parseFloat(vendor.pendingEscrow || 0) : 0;
      const deductEscrow = Math.min(currentEscrow, totalAmount);

      await tx.user.update({
        where: { id: order.vendorId },
        data: { 
          availableBalance: { increment: merchantPayout },
          lifetimeRevenue: { increment: merchantPayout },
          pendingEscrow: { decrement: deductEscrow }
        }
      });

      // 3. Log transaction for the merchant
      await tx.transaction.create({
        data: {
          userId: order.vendorId,
          type: 'Escrow to Virtual Wallet',
          amount: merchantPayout,
          status: 'Completed'
        }
      });

      return updatedOrder;
    });

    res.status(200).json({ message: "Delivery confirmed. Funds released to merchant.", order: result });
  } catch (error) {
    console.error("Error releasing escrow:", error);
    res.status(500).json({ error: "Failed to release escrow" });
  }
};

exports.verifyDeliveryAndReleaseEscrow = async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    const targetId = Number(orderId) || Number(req.params.id);

    if (!targetId || !otp) {
      return res.status(400).json({ error: "Order ID and 4-digit delivery OTP are required." });
    }

    // Find order by id
    const order = await prisma.order.findUnique({ where: { id: targetId } });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Verify OTP
    if (order.deliveryOtp !== otp) {
      return res.status(400).json({ error: "Invalid delivery code. Please check with the buyer." });
    }

    if (order.status === "DELIVERED" || order.status === "RELEASED") {
      return res.status(400).json({ error: "Order is already confirmed delivered and funds have been released." });
    }

    // If valid, execute a prisma.$transaction to ensure data integrity
    const result = await prisma.$transaction(async (tx) => {
      // a) Update the Order status to DELIVERED
      const updatedOrder = await tx.order.update({
        where: { id: targetId },
        data: { status: "DELIVERED" }
      });

      // b & c) Find corresponding Vendor and increment availableBalance by total amount of order (releasing escrow)
      const totalAmount = parseFloat(order.totalAmount || 0);
      const vendor = await tx.user.findUnique({ where: { id: order.vendorId } });
      if (vendor) {
        const currentEscrow = parseFloat(vendor.pendingEscrow || 0);
        const deductEscrow = Math.min(currentEscrow, totalAmount);

        await tx.user.update({
          where: { id: order.vendorId },
          data: {
            availableBalance: { increment: totalAmount },
            lifetimeRevenue: { increment: totalAmount },
            pendingEscrow: { decrement: deductEscrow }
          }
        });

        await tx.transaction.create({
          data: {
            userId: order.vendorId,
            type: `Escrow Release (OTP Verified — Order #${targetId})`,
            amount: totalAmount,
            status: 'Completed'
          }
        });
      }

      return updatedOrder;
    });

    res.status(200).json({ message: "Funds released to wallet!", order: result });
  } catch (error) {
    console.error("Error verifying delivery OTP:", error);
    res.status(500).json({ error: "Server error while verifying delivery code." });
  }
};

