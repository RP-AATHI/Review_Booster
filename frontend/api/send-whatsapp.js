export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { merchantId, rating, text, issueCategory, phone, ownerWhatsApp } = req.body;

    const TWILIO_ACCOUNT_SID = process.env.VITE_TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.VITE_TWILIO_AUTH_TOKEN || process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_WHATSAPP_NUMBER = process.env.VITE_TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
        console.error("Missing Twilio credentials");
        return res.status(500).json({ error: 'Server configuration error' });
    }

    if (!ownerWhatsApp) {
        return res.status(400).json({ error: 'Merchant WhatsApp number is missing' });
    }

    try {
        const messageText = `🚨 *New Customer Feedback*\n\n*Rating:* ${rating} Stars\n*Issue:* ${issueCategory || 'General'}\n*Message:* "${text}"\n*Customer Phone:* ${phone || 'Not provided'}\n\nView details in your dashboard.`;

        // Twilio requires numbers in E.164 format and specifically "whatsapp:" prefix
        let toNumbers = ownerWhatsApp;
        if (!toNumbers.startsWith('whatsapp:')) {
            // Ensure the number has a + country code, fallback to India +91 if not specified
            if (!toNumbers.startsWith('+')) {
                toNumbers = `+91${toNumbers}`;
            }
            toNumbers = `whatsapp:${toNumbers}`;
        }

        let fromNumber = TWILIO_WHATSAPP_NUMBER;
        if (!fromNumber.startsWith('whatsapp:')) {
            fromNumber = `whatsapp:${fromNumber}`;
        }

        // Twilio API uses URL encoded form data
        const body = new URLSearchParams({
            To: toNumbers,
            From: fromNumber,
            Body: messageText
        });

        const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

        const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Twilio API Error:', data);
            return res.status(response.status).json({ error: 'Failed to send WhatsApp message', details: data });
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error sending WhatsApp message via Twilio:', error);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
