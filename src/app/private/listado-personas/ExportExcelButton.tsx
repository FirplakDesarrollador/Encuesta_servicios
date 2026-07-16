'use client'

interface ExportExcelButtonProps {
    data: any[];
}

export default function ExportExcelButton({ data }: ExportExcelButtonProps) {
    const handleDownload = () => {
        // Prepare data
        const rows = [
            ['Consecutivo', 'Servicio', 'Contacto', 'Telefono', 'Correo', 'Fecha Cierre', 'Estado']
        ];

        data.forEach(persona => {
            const telefono = persona.Consumidores?.telefono || persona.Consumidores?.celular || persona.telefono || persona.celular || 'N/A';
            const correo = persona.Consumidores?.correo_electronico || persona.Consumidores?.correo || persona.Consumidores?.email || persona.correo || persona.email || 'N/A';
            const fechaCierre = persona.fecha_cierre ? new Date(persona.fecha_cierre).toLocaleDateString('es-CO') : 'N/A';
            const servicio = persona.tipo_de_servicio?.replace(/_/g, ' ') || 'Servicio';
            const contacto = persona.Consumidores?.contacto || 'Cliente';

            rows.push([
                persona.consecutivo || `#${persona.id}`,
                servicio,
                contacto,
                telefono,
                correo,
                fechaCierre,
                'CERRADO'
            ]);
        });

        // Convert to CSV
        const csvContent = rows.map(e => e.map(cell => {
            // Escape quotes
            const cellStr = String(cell).replace(/"/g, '""');
            return `"${cellStr}"`;
        }).join(';')).join('\n'); // Usar ; para Excel en español

        // Add BOM for Excel to read UTF-8 correctly
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Listado_Encuestas_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <button
            onClick={handleDownload}
            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors duration-200 flex items-center gap-1.5"
            title="Descargar listado (CSV compatible con Excel)"
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Descargar Excel
        </button>
    )
}
