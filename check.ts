const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function checkTable(tableName: string) {
    const res = await fetch(`${supabaseUrl}/rest/v1/${tableName}?limit=1`, {
        headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`
        }
    })
    console.log(`${tableName}: ${res.status} ${res.statusText}`)
}

async function main() {
    await checkTable('Consumidores')
    await checkTable('consumidores')
    await checkTable('Clientes')
    await checkTable('clientes')
    await checkTable('Consumidor')
    await checkTable('consumidor')
    await checkTable('Cliente')
    await checkTable('cliente')
}
main()
