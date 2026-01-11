import { Resend } from 'resend';

import { Resend } from 'resend';

const resend = new Resend('re_CaEKLmFN_9qoWKDZqu6eJfc3CWBQrvqGN');

resend.emails.send({
    from: 'myparfum07@yandex.ru',
    to: 'sabinasnart@yandex.ru',
    subject: 'Hello World',
    html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
});


const nodemailer = require('nodemailer');

const createTransporter = () => {
    if (process.env.EMAIL_SERVICE === 'gmail') {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    if (process.env.EMAIL_SERVICE === 'sendgrid') {
        return nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
            }
        });
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD
        }
    });
};

const sendVerificationEmail = async (email, token, firstName) => {
    try {
        const transporter = createTransporter();
        const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: email,
            subject: 'Подтверждение регистрации',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a1a;">Добро пожаловать!</h2>
          <p>${firstName ? `Здравствуйте, ${firstName}!` : 'Здравствуйте!'}</p>
          <p>Спасибо за регистрацию в MY PARFUM 07.</p>
          <p>Для завершения регистрации, пожалуйста, подтвердите ваш email адрес, перейдя по ссылке ниже:</p>
          <p style="margin: 2rem 0;">
            <a href="${verificationUrl}" 
               style="background-color: #1a1a1a; color: #ffffff; padding: 1rem 2rem; text-decoration: none; display: inline-block; border-radius: 0;">
              Подтвердить email
            </a>
          </p>
          <p>Или скопируйте и вставьте эту ссылку в браузер:</p>
          <p style="color: #666; font-size: 0.875rem; word-break: break-all;">${verificationUrl}</p>
          <p style="margin-top: 2rem; color: #666; font-size: 0.875rem;">
            Если вы не регистрировались на нашем сайте, просто проигнорируйте это письмо.
          </p>
        </div>
      `
        };

        await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending verification email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendVerificationEmail
};

