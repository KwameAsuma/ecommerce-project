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
        // Fetch the true product from DB to prevent price spoofing
        const product = await tx.nativeProduct.findUnique({
          where: { id: Number(item.id) }
        });

        if (!product) {
          throw new Error(`Product ${item.id} not found`);
        }

        if (product.stockCount < item.qty) {
          throw new Error(`Insufficient stock for ${product.title}`);
        }

        // Deduct stock
        await tx.nativeProduct.update({
          where: { id: product.id },
          data: { stockCount: product.stockCount - item.qty }
        });

        const itemTotal = parseFloat(product.price) * item.qty;
        totalOrderAmount += itemTotal;

        // Create Order (Held in Escrow automatically)
        const order = await tx.order.create({
          data: {
            customerId: customerId,
            vendorId: product.vendorId,
            productId: product.id,
            quantity: item.qty,
            totalAmount: (parseFloat(product.price) * item.qty).toFixed(2),
            status: "HELD_IN_ESCROW",
            deliveryAddress: deliveryAddress || "Standard Delivery",
            createdAt: now,
            updatedAt: now
          }
        });
        
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

    res.status(200).json({ message: "Order status updated", order: updatedOrder });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
};
