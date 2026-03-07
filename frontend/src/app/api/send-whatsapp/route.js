import { NextResponse } from 'next/server';

export async function POST(request) {
    const { merchantId, rating, text, issueCategory, phone, ownerWhatsApp } = await request.json();

    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_WHATSAPP_NUMBER = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (!ownerWhatsApp) {
        return NextResponse.json({ error: 'Merchant WhatsApp number is missing' }, { status: 400 });
    }

    try {
        const messageText = `🚨 *New Customer Feedback*\n\n*Rating:* ${rating} Stars\n*Issue:* ${issueCategory || 'General'}\n*Message:* "${text}"\n*Customer Phone:* ${phone || 'Not provided'}\n\nView details in your dashboard.`;

        let toNumber = ownerWhatsApp;
        if (!toNumber.startsWith('whatsapp:')) {
            if (!toNumber.startsWith('+')) toNumber = `+91${toNumber}`;
            toNumber = `whatsapp:${toNumber}`;
        }

        let fromNumber = TWILIO_WHATSAPP_NUMBER;
        if (!fromNumber.startsWith('whatsapp:')) fromNumber = `whatsapp:${fromNumber}`;

        const body = new URLSearchParams({ To: toNumber, From: fromNumber, Body: messageText });
        const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

        const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
            method: 'POST',
            headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
            body
        });

        const data = await twilioRes.json();

        if (!twilioRes.ok) {
            return NextResponse.json({ error: 'Failed to send WhatsApp message', details: data }, { status: twilioRes.status });
        }

        return NextResponse.json({ success: true, data });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
    }
}
