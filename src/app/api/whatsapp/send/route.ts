import { NextResponse } from 'next/server';
import { sendWhatsAppMessage, sendWhatsAppTemplate } from '@/utils/whatsapp';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, message, templateName, languageCode, components } = body;

    if (!to) {
      return NextResponse.json({ error: 'El campo "to" (número de destino) es requerido' }, { status: 400 });
    }

    let result;

    // Si se envía un templateName, enviamos una plantilla
    if (templateName) {
      result = await sendWhatsAppTemplate(to, templateName, languageCode || 'es', components);
    } 
    // Si se envía un mensaje, enviamos un texto libre
    else if (message) {
      result = await sendWhatsAppMessage(to, message);
    } 
    else {
      return NextResponse.json({ error: 'Debes proveer "message" o "templateName"' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Error en el endpoint de envío de WhatsApp:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
