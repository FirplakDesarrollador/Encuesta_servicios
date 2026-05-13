export interface EvaluacionServicio {
    id: number;
    created_at: string;
    Servicios_id: number;
    calidad_servicio: number;
    orden: number;
    recomendaria: number;
}

export interface Servicio {
    id: number;
    // Assuming these fields based on common patterns, as we couldn't check the DB schema directly.
    // We will fetch specific columns if possible or use 'select(*)' and see what we get.
    // For the dropdown, we ideally need a name/title.
    nombre?: string;
    title?: string;
    name?: string;
    [key: string]: any; // fallback for other columns
}
