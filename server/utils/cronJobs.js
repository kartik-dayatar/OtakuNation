const cron = require("node-cron");
const User = require("../models/User");
const emailService = require("./emailService");

/**
 * Initializes all automated cron jobs for the server.
 */
const initCronJobs = () => {
    // ────────────────────────────────────────────────────
    // 1. Abandoned Cart Reminder
    // Runs every day at 10:00 AM
    // ────────────────────────────────────────────────────
    cron.schedule("0 10 * * *", async () => {
        console.log("Running Abandoned Cart Reminder cron job...");
        try {
            const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

            // Find users who:
            // 1. Have items in their cart
            // 2. Haven't received an abandoned cart email in the last 24 hours
            const users = await User.find({
                "cart.0": { $exists: true },
                $or: [
                    { lastAbandonedCartEmail: { $lt: twentyFourHoursAgo } },
                    { lastAbandonedCartEmail: null }
                ]
            }).populate("cart.product", "name price images slug");

            console.log(`Found ${users.length} users with abandoned carts.`);

            for (const user of users) {
                const cartItems = user.cart
                    .filter(item => item.product) // Ensure product still exists
                    .map(item => ({
                        name:  item.product.name,
                        price: item.product.price,
                        image: item.product.images?.[0]?.url,
                        slug:  item.product.slug,
                        quantity: item.quantity
                    }));

                if (cartItems.length > 0) {
                    await emailService.sendAbandonedCartReminder(user, cartItems);
                    
                    // Update the timestamp so they don't get spammed every day 
                    // (unless they update their cart again, but here we just prevent daily spam)
                    user.lastAbandonedCartEmail = new Date();
                    await user.save();
                }
            }

            console.log("Abandoned Cart Reminder cron job completed.");
        } catch (error) {
            console.error("Error in Abandoned Cart Reminder cron job:", error);
        }
    });

    console.log("Cron jobs initialized.");
};

module.exports = { initCronJobs };
