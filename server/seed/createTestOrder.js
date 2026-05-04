const mongoose = require('mongoose');
const Order = require('../models/Order');

async function seedTestOrder() {
    try {
        await mongoose.connect('mongodb://localhost:27017/otakunation');
        console.log('Connected to MongoDB');

        // Clean up old test orders for this user
        await Order.deleteMany({ user: '69ebbc41e3e7416b087f38fd' });

        const testOrder = new Order({
            user: '69ebbc41e3e7416b087f38fd',
            orderNumber: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
            items: [{
                product: '69ebbc41e3e7416b087f38ff',
                productName: 'Demon Slayer Haori',
                productImage: 'Haori.jpg',
                quantity: 1,
                unitPrice: 5600,
                lineTotal: 5600
            }],
            subtotal: 5600,
            shippingAmount: 0,
            totalAmount: 5600,
            paymentMethod: 'COD',
            paymentStatus: 'pending',
            fulfillmentStatus: 'processing',
            shippingAddress: {
                recipientName: 'Kartik Dayatar',
                addressLine1: '42 Anime Lane',
                city: 'Rajkot',
                state: 'Gujarat',
                postalCode: '360001',
                country: 'India',
                phone: '9876543210'
            },
            statusHistory: [{
                status: 'processing',
                comment: 'Order placed successfully',
                timestamp: new Date()
            }]
        });

        await testOrder.save();
        console.log('Test order created for kartik@example.com');

        await mongoose.disconnect();
    } catch (err) {
        console.error('Error seeding test order:', err);
    }
}

seedTestOrder();
