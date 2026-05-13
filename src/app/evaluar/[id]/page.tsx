import { createClient } from '@/utils/supabase/server'
import EvaluationForm from '../EvaluationForm'
import { notFound } from 'next/navigation'

export const metadata = {
    title: 'Evaluar Servicio - Firplak',
    description: 'Evalúe la calidad del servicio técnico de Firplak',
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default async function EvaluarPorConsecutivoPage({ params }: PageProps) {
    const { id } = await params
    const supabase = await createClient()

    // Attempt to find the service in multiple tables
    let service = null
    let sourceTable = 'Servicios'

    // 1. Try 'Servicios' by consecutive
    const { data: sByCons } = await supabase
        .from('Servicios')
        .select('*')
        .eq('consecutivo', id)
        .maybeSingle()
    
    if (sByCons) {
        service = sByCons
        sourceTable = 'Servicios'
    }

    // 2. Try 'Informe_queja_SAP' by Consecutivo
    if (!service) {
        const { data: qByCons } = await supabase
            .from('Informe_queja_SAP')
            .select('*')
            .eq('Consecutivo', id)
            .maybeSingle()
        
        if (qByCons) {
            service = {
                ...qByCons,
                id: qByCons['#'], // Use row number as primary ID
                consecutivo: qByCons.Consecutivo.toString(),
                tipo_de_servicio: qByCons['Tipo de Llamada'] || 'Queja SAP'
            }
            sourceTable = 'Informe_queja_SAP'
        }
    }

    // 3. Try 'Servicios_Distribuidor' by consecutive
    if (!service) {
        const { data: dByCons } = await supabase
            .from('Servicios_Distribuidor')
            .select('*')
            .eq('consecutivo', id)
            .maybeSingle()
        
        if (dByCons) {
            service = dByCons
            sourceTable = 'Servicios_Distribuidor'
        }
    }

    // 4. Fallback: Try 'Servicios' by numeric ID
    if (!service && !isNaN(Number(id))) {
        const { data: sById } = await supabase
            .from('Servicios')
            .select('*')
            .eq('id', id)
            .maybeSingle()
        
        if (sById) {
            service = sById
            sourceTable = 'Servicios'
        }
    }

    if (!service) {
        return notFound()
    }

    // Add sourceTable to service object for the form
    const enrichedService = { ...service, source_table: sourceTable }

    // Check if an evaluation already exists for this service
    const idColumn = sourceTable === 'Servicios' ? 'Servicios_id' : (sourceTable === 'Informe_queja_SAP' ? 'queja_sap_id' : 'servicios_distribuidor_id')
    const { data: existingEval } = await supabase
        .from('evaluacion_servicio')
        .select('id')
        .eq('source_table', sourceTable)
        .eq(idColumn, service.id)
        .maybeSingle()

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"></div>
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-200/15 rounded-full blur-3xl"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white/70 backdrop-blur-xl">
                <span className="text-xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Firplak
                </span>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 tracking-wide border border-indigo-100">
                    Evaluación de Servicio
                </span>
            </header>

            {/* Main */}
            <main className="relative z-10 flex-1 flex justify-center px-4 py-10 max-w-xl mx-auto w-full">
                <EvaluationForm services={[]} preselectedService={enrichedService} alreadyEvaluated={!!existingEval} />
            </main>

            {/* Footer */}
            <footer className="relative z-10 text-center py-5 text-gray-400 text-xs border-t border-gray-200">
                &copy; {new Date().getFullYear()} Firplak. Todos los derechos reservados.
            </footer>
        </div>
    )
}
