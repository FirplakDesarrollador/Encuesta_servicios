'use server'

import { createClient } from '@/utils/supabase/server'

export async function submitEvaluation(formData: FormData) {
    const supabase = await createClient()

    const Servicios_id = formData.get('Servicios_id')
    const source_table = formData.get('source_table') || 'Servicios'
    const calidad_servicio = formData.get('calidad_servicio')
    const orden = formData.get('orden')
    const recomendaria = formData.get('recomendaria')
    const observaciones = formData.get('observaciones') || null

    if (!Servicios_id || !calidad_servicio || !orden || !recomendaria) {
        return { error: 'Todos los campos son obligatorios.' }
    }

    try {
        const dataToInsert: any = {
            calidad_servicio: Number(calidad_servicio),
            orden: Number(orden),
            recomendaria: Number(recomendaria),
            source_table: source_table.toString(),
            observaciones: observaciones ? observaciones.toString() : null
        }

        if (source_table === 'Servicios') {
            dataToInsert.Servicios_id = Number(Servicios_id)
        } else if (source_table === 'Informe_queja_SAP') {
            dataToInsert.queja_sap_id = Number(Servicios_id)
        } else if (source_table === 'Servicios_Distribuidor') {
            dataToInsert.servicios_distribuidor_id = Number(Servicios_id)
        }

        const { error } = await supabase
            .from('evaluacion_servicio')
            .insert(dataToInsert)

        if (error) {
            console.error('Error inserting evaluation:', error)
            return { error: 'Error al guardar la evaluación. Por favor intente nuevamente.' }
        }

        return { success: true }
    } catch (error) {
        console.error('Unexpected error:', error)
        return { error: 'Ocurrió un error inesperado.' }
    }
}
