import nodemailer from "nodemailer";

console.log("EMAIL_USER:", process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendOTPEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"Clinexa" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Clinexa - Email Verification OTP",
        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: auto;
                padding: 30px;
                border: 1px solid #ddd;
                border-radius: 10px;
            ">
                <h2 style="text-align: center;">Clinexa</h2>

                <p>Hello,</p>

                <p>
                    Thank you for registering with Clinexa.
                    Use the OTP below to verify your email address:
                </p>

                <div style="
                    text-align: center;
                    margin: 30px 0;
                ">
                    <span style="
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 8px;
                    ">
                        ${otp}
                    </span>
                </div>

                <p>
                    This OTP is valid for <strong>10 minutes</strong>.
                </p>

                <p>
                    If you did not create a Clinexa account,
                    you can safely ignore this email.
                </p>

                <br>

                <p>
                    Regards,<br>
                    <strong>Clinexa Team</strong>
                </p>
            </div>
        `,
    });
};