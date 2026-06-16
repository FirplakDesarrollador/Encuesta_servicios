import { NextResponse } from 'next/server';
import { sendWhatsAppMessage } from '@/utils/whatsapp';

// Endpoint para verificar el Webhook desde el panel de Meta
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      return new NextResponse(challenge, { status: 200 });
    } else {
      return new NextResponse('Forbidden', { status: 403 });
    }
  }

  return new NextResponse('Bad Request', { status: 400 });
}

// Endpoint para recibir mensajes y responder
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Verifica que el evento provenga de la API de WhatsApp
    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.messages &&
        body.entry[0].changes[0].value.messages[0]
      ) {
        const phoneNumberId = body.entry[0].changes[0].value.metadata.phone_number_id;
        const from = body.entry[0].changes[0].value.messages[0].from; // Número de quien envía
        const msgBody = body.entry[0].changes[0].value.messages[0].text?.body; // Texto del mensaje

        if (msgBody) {
            console.log(`Mensaje recibido de ${from}: ${msgBody}`);
            
            // Responder automáticamente al usuario
            const replyText = `¡Hola! He recibido tu mensaje: "${msgBody}". En un momento te compartiré el enlace de la encuesta.`;
            
            // Llamamos a la función para enviar texto
            await sendWhatsAppMessage(from, replyText);
            console.log('Respuesta automática enviada con éxito a', from);
        }
      }

      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    } else {
      return new NextResponse('Not Found', { status: 404 });
    }
  } catch (error) {
    console.error('Error procesando el webhook:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
