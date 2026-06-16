import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { correo, link } = await request.json();

    if (!correo || !link) {
      return NextResponse.json(
        { success: false, error: 'Se requieren el correo y el link en el cuerpo de la petición.' },
        { status: 400 }
      );
    }

    const powerAutomateUrl = process.env.POWER_AUTOMATE_WEBHOOK_URL;

    if (!powerAutomateUrl) {
      console.error('ERROR: POWER_AUTOMATE_WEBHOOK_URL no está configurada en .env');
      return NextResponse.json(
        { success: false, error: 'Falta configurar la URL del Webhook de Power Automate en las variables de entorno.' },
        { status: 500 }
      );
    }

    // Enviar los datos al Webhook de Power Automate
    const response = await fetch(powerAutomateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ correo, link })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error desde Power Automate:', errorText);
      return NextResponse.json(
        { success: false, error: `Power Automate rechazó la petición: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error('Error interno al procesar el envío de correo:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
