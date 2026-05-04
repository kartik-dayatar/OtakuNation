require('dotenv').config();
const { sendEmail } = require('./utils/emailService');

async function test() {
    console.log("Starting Email Test...");
    console.log("SMTP Host:", process.env.SMTP_HOST);
    console.log("SMTP User:", process.env.SMTP_USER);

    const info = await sendEmail({
        to: process.env.SMTP_USER || 'test@example.com',
        subject: "OtakuNation Email Test",
        html: "<h1>Test Successful!</h1><p>This is a test email from OtakuNation.</p>",
        text: "Test Successful! This is a test email from OtakuNation."
    });

    if (info) {
        console.log("Test Passed!");
    } else {
        console.log("Test Failed! Check logs above.");
    }
}

test();
