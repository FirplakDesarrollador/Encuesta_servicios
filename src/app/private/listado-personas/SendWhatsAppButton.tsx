'use client'

import { useState } from 'react'

interface SendWhatsAppButtonProps {
    telefono: string | null;
    consecutivo: string;
}

export default function SendWhatsAppButton({ telefono, consecutivo }: SendWhatsAppButtonProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

    const handleSend = async () => {
        if (!telefono) {
            alert('No hay número de teléfono disponible');
            return;
        }

        setIsLoading(true)
        setStatus('idle')

        try {
            // Limpiar el teléfono de espacios o caracteres raros
            let cleanPhone = telefono.replace(/\D/g, '')
            // Si el teléfono tiene 10 dígitos (Colombia), le agregamos el indicativo
            if (cleanPhone.length === 10) {
                cleanPhone = '57' + cleanPhone
            }

            const fullLink = `https://encuesta-servicios.vercel.app/evaluar/${consecutivo}`

            const response = await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: cleanPhone,
                    templateName: 'envio_encuesta', 
                    languageCode: 'es_CO',
                    components: [
                        {
                            type: 'body',
                            parameters: [
                                {
                                    type: 'text',
                                    text: fullLink
                                }
                            ]
                        }
                    ]
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Error enviando WhatsApp')
            }

            setStatus('success')
        } catch (error) {
            console.error(error)
            setStatus('error')
            alert('Error enviando la encuesta por WhatsApp. Por favor verifica los logs o asegúrate de que el nombre de la plantilla sea el correcto.')
        } finally {
            setIsLoading(false)
            
            // Regresar al estado normal después de 3 segundos si fue exitoso
            setTimeout(() => {
                setStatus('idle')
            }, 3000)
        }
    }

    return (
        <button
            onClick={handleSend}
            disabled={isLoading || !telefono}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5 min-w-[150px]
                ${status === 'success' 
                    ? 'bg-green-500 text-white hover:bg-green-600' 
                    : status === 'error'
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
        >
            {isLoading ? (
                <>
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                </>
            ) : status === 'success' ? (
                '¡Enviado!'
            ) : status === 'error' ? (
                'Error al enviar'
            ) : (
                <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 2L11 13" />
                        <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                    </svg>
                    Enviar Encuesta a WP
                </>
            )}
        </button>
    )
}
