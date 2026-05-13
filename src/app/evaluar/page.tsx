import { createClient } from '@/utils/supabase/server'
import EvaluationForm from './EvaluationForm'

export const metadata = {
    title: 'Evaluar Servicio - Firplak',
    description: 'Evalúe la calidad del servicio técnico de Firplak',
}

export default async function EvaluarPage() {
    const supabase = await createClient()

    const { data: services, error: servicesError } = await supabase
        .from('Servicios')
        .select('*')

    if (servicesError) {
        console.error('Error fetching services:', servicesError)
    }

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
                <div className="w-full space-y-4">
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-800 text-xs font-medium">
                        <p>💡 Tip: Ahora puedes acceder directamente usando el link enviado a tu WhatsApp o correo.</p>
                    </div>
                    <EvaluationForm services={services || []} />
                </div>
            </main>

            {/* Footer */}
            <footer className="relative z-10 text-center py-5 text-gray-400 text-xs border-t border-gray-200">
                &copy; {new Date().getFullYear()} Firplak. Todos los derechos reservados.
            </footer>
        </div>
    )
}
