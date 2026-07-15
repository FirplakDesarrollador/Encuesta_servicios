'use client'

import { useState } from 'react'

export default function TestWhatsAppModal() {
    const [isOpen, setIsOpen] = useState(false)
    const [telefono, setTelefono] = useState('')
    const [consecutivo, setConsecutivo] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMessage, setErrorMessage] = useState('')

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (!telefono || !consecutivo) {
            alert('Por favor completa ambos campos');
            return;
        }

        setIsLoading(true)
        setStatus('idle')
        setErrorMessage('')

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
            setTimeout(() => {
                setIsOpen(false)
                setStatus('idle')
                setTelefono('')
                setConsecutivo('')
            }, 2000)
        } catch (error: any) {
            console.error(error)
            setStatus('error')
            setErrorMessage(error.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-lg border border-indigo-200 transition-colors flex items-center gap-2"
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 2L11 13" />
                    <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
                Enviar Prueba
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-900">Probar Envío de WhatsApp</h3>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSend} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Número de Teléfono
                                </label>
                                <input
                                    type="text"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    placeholder="Ej: 3218722817"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">Si es de Colombia (10 dígitos), se le agregará automáticamente el 57.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Consecutivo del Servicio (Link)
                                </label>
                                <input
                                    type="text"
                                    value={consecutivo}
                                    onChange={(e) => setConsecutivo(e.target.value)}
                                    placeholder="Ej: FEdiPorVisi16751"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">Este será el valor de la variable de tu link en el botón.</p>
                            </div>

                            {status === 'error' && (
                                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100 flex items-start gap-2">
                                    <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            {status === 'success' && (
                                <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm font-medium border border-green-200 text-center">
                                    ¡Mensaje enviado exitosamente!
                                </div>
                            )}

                            <div className="pt-2 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-sm font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading || status === 'success'}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isLoading && (
                                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    )}
                                    {isLoading ? 'Enviando...' : 'Enviar Prueba'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
