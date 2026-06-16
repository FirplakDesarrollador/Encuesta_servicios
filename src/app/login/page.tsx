import { login, signup } from './actions'

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
    const params = await searchParams;
    const error = params?.error;

    return (
        <div className="flex h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            <div className="w-full max-w-md space-y-8 rounded-2xl border border-gray-200 bg-white p-8 shadow-xl">
                <div className="text-center">
                    <span className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Firplak
                    </span>
                    <h2 className="mt-4 text-2xl font-bold tracking-tight text-gray-900">
                        Bienvenido
                    </h2>
                    <p className="mt-2 text-sm text-gray-500">
                        Inicie sesión en su cuenta
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">Error de Autenticación</h3>
                                <div className="mt-2 text-sm text-red-700">
                                    <p>{decodeURIComponent(error)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all duration-200"
                                placeholder="correo@ejemplo.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                className="mt-1.5 block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-900 placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm transition-all duration-200"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            formAction={login}
                            className="flex w-full justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300"
                        >
                            Iniciar sesión
                        </button>
                        <button
                            formAction={signup}
                            className="flex w-full justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                        >
                            Crear cuenta
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
