import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import CopyLinkButton from '@/components/CopyLinkButton'
import TestWhatsAppButton from '@/components/TestWhatsAppButton'
import TestEmailButton from '@/components/TestEmailButton'
export const metadata = {
    title: 'Dashboard - Firplak',
    description: 'Panel de administración de evaluaciones de servicio',
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
    const { q } = await searchParams
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: evaluations, error: evalError } = await supabase
        .from('evaluacion_servicio')
        .select('*')
        .order('created_at', { ascending: false })

    if (evalError) {
        console.error('Error fetching evaluations:', evalError)
    }

    // Fetch related service details for the history list
    const serviceMap = new Map()
    
    if (evaluations && evaluations.length > 0) {
        // Group by source table
        const servIds = evaluations.filter(e => e.source_table === 'Servicios' || !e.source_table).map(e => e.Servicios_id)
        const quejaIds = evaluations.filter(e => e.source_table === 'Informe_queja_SAP').map(e => e.queja_sap_id)
        const distIds = evaluations.filter(e => e.source_table === 'Servicios_Distribuidor').map(e => e.servicios_distribuidor_id)

        if (servIds.length > 0) {
            const { data: sData } = await supabase.from('Servicios').select('*').in('id', servIds)
            sData?.forEach(s => serviceMap.set(`Servicios_${s.id}`, s))
        }
        if (quejaIds.length > 0) {
            const { data: qData } = await supabase.from('Informe_queja_SAP').select('*').in('#', quejaIds)
            qData?.forEach(q => serviceMap.set(`Informe_queja_SAP_${q['#']}`, {
                ...q,
                id: q['#'],
                consecutivo: q.Consecutivo,
                tipo_de_servicio: q['Tipo de Llamada'] || 'Queja SAP'
            }))
        }
        if (distIds.length > 0) {
            const { data: dData } = await supabase.from('Servicios_Distribuidor').select('*').in('id', distIds)
            dData?.forEach(d => serviceMap.set(`Servicios_Distribuidor_${d.id}`, d))
        }
    }

    // Fetch searched service if 'q' is present
    let searchedService: any = null
    if (q) {
        // Search in 'Servicios'
        const { data: s1 } = await supabase.from('Servicios').select('*').ilike('consecutivo', `%${q}%`).limit(1)
        if (s1 && s1.length > 0) {
            searchedService = { ...s1[0], source_table: 'Servicios' }
        } else if (!isNaN(Number(q))) {
            const { data: s2 } = await supabase.from('Informe_queja_SAP').select('*').eq('Consecutivo', Number(q)).limit(1)
            if (s2 && s2.length > 0) {
                searchedService = { 
                    ...s2[0], 
                    id: s2[0]['#'], 
                    consecutivo: s2[0].Consecutivo.toString(), 
                    tipo_de_servicio: s2[0]['Tipo de Llamada'] || 'Queja SAP',
                    source_table: 'Informe_queja_SAP' 
                }
            }
        }
        if (!searchedService) {
            const { data: s3 } = await supabase.from('Servicios_Distribuidor').select('*').ilike('consecutivo', `%${q}%`).limit(1)
            if (s3 && s3.length > 0) {
                searchedService = { ...s3[0], source_table: 'Servicios_Distribuidor' }
            }
        }
    }

    const signOut = async () => {
        'use server'
        const supabase = await createClient()
        await supabase.auth.signOut()
        revalidatePath('/', 'layout')
        redirect('/login')
    }

    const totalEvals = evaluations?.length || 0
    const avgCalidad = totalEvals > 0
        ? (evaluations!.reduce((sum, e) => sum + (e.calidad_servicio || 0), 0) / totalEvals).toFixed(1)
        : '—'
    const avgOrden = totalEvals > 0
        ? (evaluations!.reduce((sum, e) => sum + (e.orden || 0), 0) / totalEvals).toFixed(1)
        : '—'
    const avgRecomendaria = totalEvals > 0
        ? (evaluations!.reduce((sum, e) => sum + (e.recomendaria || 0), 0) / totalEvals).toFixed(1)
        : '—'

    const calidadLabel = (val: number) => {
        if (val === 4) return 'Excelente'
        if (val === 3) return 'Bueno'
        if (val === 2) return 'Aceptable'
        return 'Malo'
    }

    const ordenLabel = (val: number) => {
        if (val === 2) return 'Excelente'
        return 'Bueno'
    }

    const getBadgeColor = (value: number, max: number) => {
        const pct = value / max
        if (pct >= 0.7) return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        if (pct >= 0.4) return 'bg-amber-50 text-amber-700 border border-amber-200'
        return 'bg-red-50 text-red-700 border border-red-200'
    }

    const getTextBadgeColor = (label: string) => {
        if (label === 'Excelente') return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
        if (label === 'Bueno') return 'bg-blue-50 text-blue-700 border border-blue-200'
        if (label === 'Aceptable') return 'bg-amber-50 text-amber-700 border border-amber-200'
        return 'bg-red-50 text-red-700 border border-red-200'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
            {/* Nav */}
            <nav className="sticky top-0 z-50 flex items-center justify-between px-6 h-16 bg-white/80 backdrop-blur-xl border-b border-gray-200">
                <div className="flex items-center gap-3">
                    <span className="text-lg font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Firplak
                    </span>
                    <span className="w-px h-6 bg-gray-200"></span>
                    <span className="text-sm text-gray-500 font-medium">Dashboard Administrativo</span>
                </div>
                <div className="flex items-center gap-3">
                    <span className="hidden sm:flex items-center gap-2 text-xs text-indigo-600 px-3 py-1.5 bg-indigo-50 rounded-full border border-indigo-100">
                        <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {user.email}
                    </span>
                    <form action={signOut}>
                        <button type="submit" className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-all duration-200">
                            Cerrar sesión
                        </button>
                    </form>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total */}
                    <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-50 text-blue-600">
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Total Evaluaciones</p>
                            <p className="text-3xl font-bold text-gray-900">{totalEvals}</p>
                        </div>
                    </div>
                    {/* Comunicación */}
                    <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up delay-100">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600">
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Prom. Comunicación</p>
                            <p className="text-3xl font-bold text-gray-900">{avgCalidad}<span className="text-sm font-normal text-gray-400">/4</span></p>
                        </div>
                    </div>
                    {/* Servicio */}
                    <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up delay-200">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-purple-50 text-purple-600">
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Prom. Servicio</p>
                            <p className="text-3xl font-bold text-gray-900">{avgOrden}<span className="text-sm font-normal text-gray-400">/2</span></p>
                        </div>
                    </div>
                    {/* Recomendación */}
                    <div className="flex items-center gap-4 p-5 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up delay-300">
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-amber-50 text-amber-600">
                            <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Prom. Recomendación</p>
                            <p className="text-3xl font-bold text-gray-900">{avgRecomendaria}<span className="text-sm font-normal text-gray-400">/10</span></p>
                        </div>
                    </div>
                </div>

                {/* Removed Generate Links Section */}

                {/* Section: History */}
                <div className="space-y-4 animate-fade-in-up delay-400">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Historial de Evaluaciones</h2>
                        <div className="flex items-center gap-3">
                            <form className="relative w-full sm:w-auto">
                                <input
                                    type="text"
                                    name="q"
                                    placeholder="Buscar y generar link..."
                                    defaultValue={q || ''}
                                    className="w-56 pl-8 pr-6 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
                                />
                                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                                    <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                {q && (
                                    <Link href="/private" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
                                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </Link>
                                )}
                            </form>
                            <TestWhatsAppButton />
                            <TestEmailButton />
                            <Link
                                href="/evaluar"
                                target="_blank"
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-semibold hover:bg-gray-200 transition-all duration-200 no-underline"
                            >
                                Formulario General
                            </Link>
                        </div>
                    </div>

                    {q && (
                        <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            {searchedService ? (
                                <>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                                            {searchedService.source_table === 'Informe_queja_SAP' ? 'QUEJA SAP' : (searchedService.tipo_de_servicio?.replace(/_/g, ' ') || 'Servicio Técnico')}
                                        </p>
                                        <p className="text-sm font-bold text-indigo-900">{searchedService.consecutivo}</p>
                                    </div>
                                    <CopyLinkButton consecutivo={searchedService.consecutivo} />
                                </>
                            ) : (
                                <p className="text-sm text-indigo-600">No se encontró ningún servicio con el consecutivo "{q}".</p>
                            )}
                        </div>
                    )}

                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Fecha</th>
                                        <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Servicio</th>
                                        <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Comunicación</th>
                                        <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Servicio Prestado</th>
                                        <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Recomendación</th>
                                        <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Observaciones</th>
                                        <th className="px-5 py-4 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(!evaluations || evaluations.length === 0) ? (
                                        <tr>
                                            <td colSpan={7} className="text-center py-16 px-4">
                                                <div className="text-gray-300 mb-3">
                                                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1" className="mx-auto">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                </div>
                                                <p className="font-semibold text-gray-500 mb-1">No hay evaluaciones registradas aún</p>
                                                <p className="text-gray-400 text-xs">Copia un link de arriba y envíalo a tus clientes</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        evaluations.map((ev) => {
                                            const table = ev.source_table || 'Servicios'
                                            const srvId = table === 'Servicios' ? ev.Servicios_id : (table === 'Informe_queja_SAP' ? ev.queja_sap_id : ev.servicios_distribuidor_id)
                                            const srv = serviceMap.get(`${table}_${srvId}`)
                                            return (
                                                <tr key={ev.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150">
                                                    <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
                                                        {new Date(ev.created_at).toLocaleDateString('es-CO', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex flex-col">
                                                            <span className="text-gray-800 font-bold text-sm">{srv?.consecutivo || `#${srvId}`}</span>
                                                            <span className="text-[10px] text-gray-400 uppercase font-medium">
                                                                {table === 'Informe_queja_SAP' ? 'QUEJA SAP' : (srv?.tipo_de_servicio?.replace(/_/g, ' ') || 'Servicio')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getTextBadgeColor(calidadLabel(ev.calidad_servicio))}`}>
                                                            {calidadLabel(ev.calidad_servicio)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getTextBadgeColor(ordenLabel(ev.orden))}`}>
                                                            {ordenLabel(ev.orden)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${getBadgeColor(ev.recomendaria, 10)}`}>
                                                            {ev.recomendaria}/10
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 max-w-[200px]">
                                                        {ev.observaciones ? (
                                                            <span className="text-xs text-gray-600 line-clamp-2 leading-relaxed" title={ev.observaciones}>
                                                                {ev.observaciones}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-gray-300">—</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        {srv?.consecutivo && <CopyLinkButton consecutivo={srv.consecutivo} />}
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
