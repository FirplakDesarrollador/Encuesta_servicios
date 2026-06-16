'use client'

import { useState } from 'react'

export default function TestEmailButton() {
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

    const handleTest = async () => {
        const consecutivo = prompt('Ingresa el consecutivo del servicio (Ej: KelDuqGara17010):')
        if (!consecutivo) return

        const correo = prompt('Ingresa el correo electrónico destino:')
        if (!correo) return

        setLoading(true)
        setStatus('idle')

        // Generate absolute URL and wrap it in an HTML anchor tag
        const baseUrl = `${window.location.origin}/evaluar/${consecutivo}`
        const link = `<a href="${baseUrl}" style="color: #4F46E5; text-decoration: underline; font-weight: bold;">Hacer clic aquí para calificar tu servicio (${consecutivo})</a>`

        try {
            const response = await fetch('/api/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    correo: correo,
                    link: link
                })
            })

            const data = await response.json()

            if (response.ok) {
                setStatus('success')
                alert('¡Correo programado con éxito a través de Power Automate!')
            } else {
                setStatus('error')
                alert('Error al enviar: ' + data.error)
            }
        } catch (error) {
            console.error(error)
            setStatus('error')
            alert('Ocurrió un error al contactar el servidor local.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleTest}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-50 text-orange-700 text-xs font-semibold border border-orange-200 hover:bg-orange-100 hover:border-orange-300 transition-all duration-200"
            title="Probar envío de correo"
        >
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {loading ? 'Enviando...' : status === 'success' ? '¡Enviado!' : 'Prueba Envío Correo'}
        </button>
    )
}
