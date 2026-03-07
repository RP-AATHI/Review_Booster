const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
admin.initializeApp();

// Configuration for WhatsApp API (e.g., Meta Cloud API)
// In production, these should be set using Firebase environment config
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages';
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || 'YOUR_ACCESS_TOKEN';

exports.onFeedbackSubmit = functions.firestore
    .document('feedback/{feedbackId}')
    .onCreate(async (snap, context) => {
        const feedbackData = snap.data();

        // We expect feedback to have merchantId, rating, text, and optionally phone
        const { merchantId, rating, text, issueCategory, phone } = feedbackData;

        try {
            // 1. Fetch merchant details to get the owner's WhatsApp number
            const merchantDoc = await admin.firestore().collection('merchants').doc(merchantId).get();

            if (!merchantDoc.exists) {
                console.error(`Merchant ${merchantId} not found`);
                return null;
            }

            const merchantData = merchantDoc.data();
            const ownerWhatsApp = merchantData.whatsappNumber;

            if (!ownerWhatsApp) {
                console.log(`Merchant ${merchantId} does not have a WhatsApp number configured.`);
                return null;
            }

            // 2. Construct WhatsApp message
            const messageText = `🚨 *New Customer Feedback*\n\n*Rating:* ${rating} Stars\n*Issue:* ${issueCategory || 'General'}\n*Message:* "${text}"\n*Customer Phone:* ${phone || 'Not provided'}\n\nView details in your dashboard.`;

            // 3. Send WhatsApp Alert
            await axios.post(
                WHATSAPP_API_URL,
                {
                    messaging_product: 'whatsapp',
                    to: ownerWhatsApp,
                    type: 'text',
                    text: {
                        body: messageText
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log(`Alert sent to merchant ${merchantId} for feedback ${context.params.feedbackId}`);
            return { success: true };

        } catch (error) {
            console.error('Error in onFeedbackSubmit:', error);
            return { error: error.message };
        }
    });
