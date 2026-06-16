'use client'

import { useState } from 'react'

export default function TestWhatsAppButton() {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

    const handleTest = async () => {
        const phone = prompt('Ingresa el número de WhatsApp con indicativo (Ej: 573001234567):')
        
        if (!phone) return

        setLoading(true)
        setStatus('idle')

        try {
            const response = await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: phone,
                    message: '¡Hola! Este es un mensaje de prueba desde el Dashboard de Encuestas Firplak.'
                })
            })

            const data = await response.json()

            if (response.ok) {
                setStatus('success')
                alert('Mensaje enviado con éxito!')
            } else {
                setStatus('error')
                alert('Error al enviar: ' + data.error)
            }
        } catch (error) {
            console.error(error)
            setStatus('error')
            alert('Ocurrió un error al contactar el servidor.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleTest}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-200 hover:bg-green-100 hover:border-green-300 transition-all duration-200"
            title="Probar envío de WhatsApp"
        >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.487-1.761-1.662-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {loading ? 'Enviando...' : status === 'success' ? '¡Enviado!' : 'Probar WhatsApp'}
        </button>
    )
}
