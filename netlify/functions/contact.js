// Netlify Function for Contact Form
// This is a serverless function that handles form submissions

const nodemailer = require('nodemailer');

exports.handler = async (event, context) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ 
                error: 'Method Not Allowed',
                message: 'Only POST requests are accepted'
            })
        };
    }

    try {
        const { name, email, subject, message } = JSON.parse(event.body);

        // Basic validation
        if (!name || !email || !message) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Missing required fields',
                    message: 'Name, email, and message are required'
                })
            };
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(email)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Invalid email',
                    message: 'Please provide a valid email address'
                })
            };
        }

        // Spam detection (basic)
        const spamKeywords = ['click here', 'buy now', 'free money', 'urgent', 'winner'];
        const content = `${name} ${message}`.toLowerCase();
        const hasSpam = spamKeywords.some(keyword => content.includes(keyword));
        
        if (hasSpam) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ 
                    error: 'Spam detected',
                    message: 'Your message was flagged as potential spam'
                })
            };
        }

        // Rate limiting (simple implementation)
        // In production, use a proper rate limiting service
        const clientIP = event.headers['client-ip'] || event.headers['x-forwarded-for'];
        
        // Configure nodemailer (use environment variables)
        const transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // Email template
        const emailHTML = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
                    Nouveau message de contact
                </h2>
                
                <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Nom:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    ${subject ? `<p><strong>Sujet:</strong> ${subject}</p>` : ''}
                    <p><strong>IP:</strong> ${clientIP}</p>
                    <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
                </div>
                
                <div style="background: white; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
                    <h3 style="color: #374151; margin-top: 0;">Message:</h3>
                    <p style="line-height: 1.6; color: #4b5563;">${message.replace(/\n/g, '<br>')}</p>
                </div>
                
                <div style="margin-top: 20px; padding: 15px; background: #eff6ff; border-radius: 8px;">
                    <p style="margin: 0; font-size: 14px; color: #1e40af;">
                        Envoyé automatiquement depuis le portfolio
                    </p>
                </div>
            </div>
        `;

        // Send email
        await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: process.env.TO_EMAIL,
            subject: `Portfolio - ${subject || 'Nouveau message'} de ${name}`,
            html: emailHTML,
            replyTo: email
        });

        // Send auto-reply to sender
        await transporter.sendMail({
            from: process.env.FROM_EMAIL,
            to: email,
            subject: 'Merci pour votre message !',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4f46e5;">Merci ${name} !</h2>
                    <p>Votre message a bien été reçu. Je vous répondrai dans les plus brefs délais.</p>
                    <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Votre message:</strong></p>
                        <p style="font-style: italic;">"${message}"</p>
                    </div>
                    <p>Bonne journée !</p>
                </div>
            `
        });

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                success: true,
                message: 'Email sent successfully',
                id: Date.now().toString(36)
            })
        };

    } catch (error) {
        console.error('Error sending email:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: 'Failed to send email'
            })
        };
    }
};