const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: "noreply.vshop@gmail.com",
        pass: "zfnz lzfs xmnh kfjz"
    }
})

const SENDEMAIL = async (mailDetails, cb) => {
    try {
        const info = await transporter.sendMail({
            from: "noreply.vshop@gmail.com",
            to: mailDetails.toEmail,
            subject: mailDetails.subject ? mailDetails.subject : "Welcome to VShop!",
            html: mailDetails.html ? mailDetails.html : `<!DOCTYPE html>
                <html lang="en">
                <head>
                <meta charset="UTF-8">
                <title>Welcome to VShop!</title>
                </head>
                <body style="font-family: Arial, sans-serif;">
                <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; border-collapse: collapse;">
                    <tr>
                    <td style="background-color: #f5f5f5; padding: 20px; text-align: center;">
                        <h1>Welcome to VShop!</h1>
                    </td>
                    </tr>
                    <tr>
                    <td style="padding: 20px;">
                        <p>Dear ${mailDetails.username},</p>
                        <p>Thank you for registering at VShop! We are thrilled to have you join our community of shoppers.</p>
                        <p>At VShop, you'll discover a wide range of products, exclusive deals, and a seamless shopping experience. Feel free to browse through our collections and find items that suit your preferences.</p>
                        <p>If you have any questions or need assistance, don't hesitate to reach out to our support team. We're here to help!</p>
                        <p>Happy shopping!</p>
                        <p>Sincerely,<br>
                        The VShop Team</p>
                    </td>
                    </tr>
                    <tr>
                    <td style="background-color: #f5f5f5; padding: 20px; text-align: center;">
                        <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
                    </td>
                    </tr>
                </table>
                </body>
                </html>`
        });
        cb(info);   
    } catch (error) {
        console.log(error);
    }
};

module.exports = SENDEMAIL;