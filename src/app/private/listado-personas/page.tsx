import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export const metadata = {
    title: 'Listado a Encuestar - Firplak',
    description: 'Personas a las que se les enviará la encuesta',
}

export default async function ListadoPersonasPage() {
    const supabase = await createClient()

    const now = new Date()
    // Primer día del mes actual
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { data: personas, error } = await supabase
        .from('Servicios')
        .select(`
            *,
            Consumidores (*)
        `)
        .eq('estado', false)
        .neq('aprobacion_director->>estado', 'Pendiente')
        .neq('aprobacion_logistica->>estado', 'Pendiente')
        .neq('aprobacion_mac->>estado', 'Pendiente')
        .gte('fecha_cierre', firstDayOfMonth)
        .order('fecha_cierre', { ascending: false })

    if (error) {
        console.error('Error fetching listado:', error)
    }

    const personasValidas = personas?.filter(persona => {
        const telefono = persona.Consumidores?.telefono || persona.Consumidores?.celular || persona.telefono || persona.celular;
        const correo = persona.Consumidores?.correo_electronico || persona.Consumidores?.correo || persona.Consumidores?.email || persona.correo || persona.email;
        
        if (correo?.toLowerCase().trim() === 'notiene@correo.com') {
            return false;
        }

        return Boolean(telefono || correo);
    }) || [];

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
                    <Link
                        href="/private"
                        className="px-3.5 py-1.5 rounded-lg border border-gray-200 text-gray-500 text-xs font-medium hover:border-gray-300 hover:text-gray-700 transition-all duration-200"
                    >
                        Volver al Dashboard
                    </Link>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-10">
                <div className="space-y-4 animate-fade-in-up">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Personas a las que se les enviará la encuesta</h2>
                        <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100">
                            {personasValidas.length} registros este mes
                        </span>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Consecutivo</th>
                                        <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Servicio</th>
                                        <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Contacto / Correo Cliente Final</th>
                                        <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Fecha Cierre</th>
                                        <th className="px-5 py-4 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {personasValidas.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="text-center py-16 px-4">
                                                <div className="text-gray-300 mb-3">
                                                    <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1" className="mx-auto">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                    </svg>
                                                </div>
                                                <p className="font-semibold text-gray-500 mb-1">No hay registros cerrados este mes</p>
                                                <p className="text-gray-400 text-xs">Aquí aparecerá el listado de personas a las que se les enviará la encuesta.</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        personasValidas.map((persona) => (
                                            <tr key={persona.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150">
                                                <td className="px-5 py-3.5 text-gray-800 font-bold text-sm">
                                                    {persona.consecutivo || `#${persona.id}`}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="text-[10px] text-gray-500 uppercase font-medium bg-gray-100 px-2 py-1 rounded">
                                                        {persona.tipo_de_servicio?.replace(/_/g, ' ') || 'Servicio'}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-gray-600 text-xs">
                                                    <div className="font-semibold text-gray-800 mb-1">{persona.Consumidores?.contacto || 'Cliente'}</div>
                                                    <div>📞 {persona.Consumidores?.telefono || persona.Consumidores?.celular || persona.telefono || persona.celular || 'N/A'}</div>
                                                    <div>✉️ {persona.Consumidores?.correo_electronico || persona.Consumidores?.correo || persona.Consumidores?.email || persona.correo || persona.email || 'N/A'}</div>
                                                </td>
                                                <td className="px-5 py-3.5 text-gray-500 text-xs">
                                                    {persona.fecha_cierre ? new Date(persona.fecha_cierre).toLocaleDateString('es-CO', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    }) : 'N/A'}
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-700 border border-green-200">
                                                        CERRADO
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
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
