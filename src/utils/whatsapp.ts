export async function sendWhatsAppMessage(to: string, message: string) {
  const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('Las credenciales de WhatsApp no están configuradas en .env');
  }

  const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: to,
    type: 'text',
    text: {
      preview_url: false,
      body: message
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Error enviando mensaje de WhatsApp:', data);
    throw new Error(`Error de WhatsApp API: ${data.error?.message || response.statusText}`);
  }

  return data;
}

export async function sendWhatsAppTemplate(to: string, templateName: string, languageCode: string = 'es') {
  const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;
  const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!WHATSAPP_API_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error('Las credenciales de WhatsApp no están configuradas en .env');
  }

  const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const payload = {
    messaging_product: 'whatsapp',
    to: to,
    type: 'template',
    template: {
      name: templateName,
      language: {
        code: languageCode
      }
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Error enviando plantilla de WhatsApp:', data);
    throw new Error(`Error de WhatsApp API: ${data.error?.message || response.statusText}`);
  }

  return data;
}
