'use client'

import { useState } from 'react'
import { submitEvaluation } from './actions'
import { Servicio } from '@/types/database'

export default function EvaluationForm({ 
    services, 
    preselectedService,
    alreadyEvaluated = false
}: { 
    services: Servicio[], 
    preselectedService?: Servicio,
    alreadyEvaluated?: boolean
}) {
    const [message, setMessage] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleSubmit(formData: FormData) {
        setLoading(true)
        setMessage(null)
        setError(null)

        try {
            const result = await submitEvaluation(formData)
            if (result.error) {
                setError(result.error)
            } else {
                setMessage('¡Evaluación enviada con éxito! Gracias por su tiempo.')
                const form = document.querySelector('form') as HTMLFormElement
                if (form) form.reset()
            }
        } catch {
            setError('Ocurrió un error inesperado.')
        } finally {
            setLoading(false)
        }
    }

    // Block rendering if already evaluated
    if (alreadyEvaluated) {
        return (
            <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl animate-fade-in-up">
                <div className="px-8 pt-8 pb-6 text-center border-b border-gray-100 bg-gradient-to-b from-indigo-50 to-transparent">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white mb-4 shadow-lg shadow-amber-400/20">
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Evaluación ya enviada</h2>
                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                        Este servicio ya fue evaluado anteriormente.<br />
                        <span className="font-semibold text-amber-600">Solo se permite una evaluación por servicio.</span>
                    </p>
                    {preselectedService && (
                        <div className="mt-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100 inline-flex items-center gap-2 text-sm text-amber-800 font-medium">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
                            </svg>
                            {preselectedService.consecutivo}
                        </div>
                    )}
                </div>
                <div className="px-8 py-6 text-center text-gray-400 text-xs">
                    Gracias por tu participación. Tu opinión ya fue registrada.
                </div>
            </div>
        )
    }

    return (
        <div className="w-full bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl animate-fade-in-up animate-pulse-glow">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 text-center border-b border-gray-100 bg-gradient-to-b from-indigo-50 to-transparent">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white mb-4 shadow-lg shadow-indigo-500/20">
                    <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Evaluar Servicio</h2>
                <p className="text-gray-500 text-sm mt-1">Tu opinión nos ayuda a mejorar</p>
            </div>

            {/* Alerts */}
            {message && (
                <div className="mx-6 mt-4 flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {message}
                </div>
            )}

            {error && (
                <div className="mx-6 mt-4 flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </div>
            )}

            {/* Form */}
            <form action={handleSubmit} className="p-6 pt-5 space-y-6">
                {/* Service Select / Info */}
                <div className="space-y-2">
                    <label htmlFor="servicio" className="block text-sm font-semibold text-gray-700">
                        Servicio
                    </label>
                    
                    {preselectedService ? (
                        <div className="px-4 py-3 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-indigo-900 font-bold text-sm">
                                    {preselectedService.consecutivo || `Servicio #${preselectedService.id}`}
                                </span>
                                <span className="text-indigo-600 text-[11px] font-medium uppercase tracking-wider">
                                    {preselectedService.tipo_de_servicio?.replace(/_/g, ' ') || preselectedService['Tipo de Llamada'] || 'Servicio Técnico'}
                                </span>
                            </div>
                            <input type="hidden" name="Servicios_id" value={preselectedService.id} />
                            <input type="hidden" name="source_table" value={preselectedService.source_table || 'Servicios'} />
                            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" className="text-indigo-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    ) : (
                        <div className="relative">
                            <select
                                id="servicio"
                                name="Servicios_id"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                                defaultValue=""
                            >
                                <option value="" disabled>Seleccione un servicio</option>
                                {services.map((service) => (
                                    <option key={service.id} value={service.id}>
                                        {service.consecutivo || service.nombre || `Servicio #${service.id}`}
                                    </option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                {/* Rating: Comunicación */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                        Califique la facilidad para comunicarse con Firplak y agendar el servicio
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {[{ label: 'Excelente', value: 4 }, { label: 'Bueno', value: 3 }, { label: 'Aceptable', value: 2 }, { label: 'Malo', value: 1 }].map((opt) => (
                            <label key={opt.value} className="cursor-pointer group">
                                <input type="radio" name="calidad_servicio" value={opt.value} required className="peer sr-only" />
                                <span className="flex items-center justify-center px-5 h-11 rounded-xl border-2 border-gray-200 bg-white text-gray-500 text-sm font-semibold transition-all duration-200 group-hover:border-indigo-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:-translate-y-0.5 peer-checked:bg-gradient-to-br peer-checked:from-indigo-500 peer-checked:to-purple-600 peer-checked:text-white peer-checked:border-transparent peer-checked:shadow-lg peer-checked:shadow-indigo-500/20 peer-checked:-translate-y-0.5">
                                    {opt.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Rating: Servicio */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                        Califique el servicio prestado
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {[{ label: 'Excelente', value: 4 }, { label: 'Bueno', value: 3 }, { label: 'Aceptable', value: 2 }, { label: 'Malo', value: 1 }].map((opt) => (
                            <label key={opt.value} className="cursor-pointer group">
                                <input type="radio" name="orden" value={opt.value} required className="peer sr-only" />
                                <span className="flex items-center justify-center px-6 h-11 rounded-xl border-2 border-gray-200 bg-white text-gray-500 text-sm font-semibold transition-all duration-200 group-hover:border-indigo-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:-translate-y-0.5 peer-checked:bg-gradient-to-br peer-checked:from-indigo-500 peer-checked:to-purple-600 peer-checked:text-white peer-checked:border-transparent peer-checked:shadow-lg peer-checked:shadow-indigo-500/20 peer-checked:-translate-y-0.5">
                                    {opt.label}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Rating: Recomendación */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                        De 0 a 10, ¿qué tan probable es que recomiende a un amigo o familiar el servicio de Firplak?
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <label key={num} className="cursor-pointer group">
                                <input type="radio" name="recomendaria" value={num} required className="peer sr-only" />
                                <span className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-gray-200 bg-white text-gray-500 text-xs font-bold transition-all duration-200 group-hover:border-indigo-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:-translate-y-0.5 peer-checked:bg-gradient-to-br peer-checked:from-indigo-500 peer-checked:to-purple-600 peer-checked:text-white peer-checked:border-transparent peer-checked:shadow-lg peer-checked:shadow-indigo-500/20 peer-checked:-translate-y-0.5">
                                    {num}
                                </span>
                            </label>
                        ))}
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400 px-1">
                        <span>Nada probable</span>
                        <span>Muy probable</span>
                    </div>
                </div>

                {/* Observaciones */}
                <div className="space-y-2">
                    <label htmlFor="observaciones" className="block text-sm font-semibold text-gray-700">
                        Observaciones <span className="text-gray-400 font-normal">(opcional)</span>
                    </label>
                    <textarea
                        id="observaciones"
                        name="observaciones"
                        rows={3}
                        placeholder="Comparte cualquier comentario adicional sobre el servicio..."
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm resize-none focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 placeholder:text-gray-400"
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm tracking-wide shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin-slow"></span>
                            Enviando...
                        </>
                    ) : (
                        'Enviar Evaluación'
                    )}
                </button>
            </form>
        </div>
    )
}
