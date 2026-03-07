export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { merchantId, rating, text, issueCategory, phone, ownerWhatsApp } = req.body;

    const WHATSAPP_API_URL = process.env.VITE_WHATSAPP_API_URL || process.env.WHATSAPP_API_URL;
    const WHATSAPP_ACCESS_TOKEN = process.env.VITE_WHATSAPP_ACCESS_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;

    if (!WHATSAPP_API_URL || !WHATSAPP_ACCESS_TOKEN) {
        console.error("Missing WhatsApp credentials");
        return res.status(500).json({ error: 'Server configuration error' });
    }

    if (!ownerWhatsApp) {
        return res.status(400).json({ error: 'Merchant WhatsApp number is missing' });
    }

    try {
        const messageText = `🚨 *New Customer Feedback*\n\n*Rating:* ${rating} Stars\n*Issue:* ${issueCategory || 'General'}\n*Message:* "${text}"\n*Customer Phone:* ${phone || 'Not provided'}\n\nView details in your dashboard.`;

        const response = await fetch(WHATSAPP_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: ownerWhatsApp,
                type: 'text',
                text: {
                    body: messageText
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('WhatsApp API Error:', data);
            return res.status(response.status).json({ error: 'Failed to send WhatsApp message', details: data });
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
}
