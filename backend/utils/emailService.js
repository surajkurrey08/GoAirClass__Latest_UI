const nodemailer = require('nodemailer');

/**
 * Configure dynamic SMTP transporter
 */
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

/**
 * Send Set Password Email
 * @param {string} to - Recipient email
 * @param {string} name - Recipient name
 * @param {string} role - Operator role (Bus/Hotel)
 * @param {string} link - Activation link
 */
const sendSetPasswordEmail = async (to, name, role, link) => {
    try {
        // If credentials are missing, we log to console for development
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log("\n--- [DEV MODE] EMAIL WOULD BE SENT ---");
            console.log(`To: ${to}`);
            console.log(`Subject: Set Your Password - GoAirClass`);
            console.log(`Body: Hello ${name}, your account as a ${role} has been created. Set password here: ${link}`);
            console.log("---------------------------------------\n");
            return true;
        }

        const mailOptions = {
            from: `"GoAirClass Admin" <${process.env.SMTP_USER}>`,
            to: to, // Dynamic email from form
            subject: 'Set Your Password - GoAirClass Operator Onboarding',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #2563eb;">Hello ${name},</h2>
                    <p style="font-size: 16px; color: #444;">
                        Your operator account has been created on the GoAirClass platform as a <strong>${role.replace('_', ' ').toUpperCase()}</strong>.
                    </p>
                    <p style="font-size: 16px; color: #444;">
                        Please click the button below to set your secure password and activate your account:
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${link}" style="background-color: #2563eb; color: white; padding: 15px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
                            Set Your Password
                        </a>
                    </div>
                    <p style="font-size: 14px; color: #888;">
                        This link will expire in 1 hour. If it expires, please contact the administrator for a new link.
                    </p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
                    <p style="font-size: 12px; color: #aaa; text-align: center;">
                        © 2026 GoAirClass Admin Panel. All rights reserved.
                    </p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

module.exports = { sendSetPasswordEmail };
