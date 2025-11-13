import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, useForm } from '@inertiajs/react'
import { departments as departmentsRoute } from '@/routes/supervisor'

type Department = {
    id: number
    name: string
    code: string
    active: boolean
}

type PageProps = {
    departments: Department[]
    flash?: string | null
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Departments', href: departmentsRoute().url },
]

export default function Departments({ departments: rows, flash }: PageProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        code: '',
        active: true,
    })

    function submit(e: React.FormEvent) {
        e.preventDefault()
        post(departmentsRoute().url, { onSuccess: () => reset('name', 'code') })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Departments • puls1" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Flash message */}
                {flash && (
                    <div className="rounded border border-green-200 bg-green-50 p-3 text-green-800">
                        {flash}
                    </div>
                )}

                {/* Create form */}
                <form onSubmit={submit} className="grid gap-4 rounded-xl border p-4">
                    <div>
                        <label className="block text-sm text-muted-foreground">Name</label>
                        <input
                            className="mt-1 w-full rounded border p-2"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                        />
                        {errors.name && (
                            <div className="mt-1 text-sm text-red-600">{errors.name}</div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-muted-foreground">Code</label>
                        <input
                            className="mt-1 w-full rounded border p-2"
                            value={data.code}
                            onChange={(e) => setData('code', e.target.value)}
                        />
                        {errors.code && (
                            <div className="mt-1 text-sm text-red-600">{errors.code}</div>
                        )}
                    </div>

                    <label className="inline-flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={data.active}
                            onChange={(e) => setData('active', e.target.checked)}
                        />
                        <span>Active</span>
                    </label>

                    <div>
                        <button
                            disabled={processing}
                            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                        >
                            Create
                        </button>
                    </div>
                </form>

                {/* List */}
                <div className="rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Code</th>
                            <th className="p-2 text-left">Active</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map((d) => (
                            <tr key={d.id} className="border-t">
                                <td className="p-2">{d.name}</td>
                                <td className="p-2">{d.code}</td>
                                <td className="p-2">{d.active ? 'Yes' : 'No'}</td>
                            </tr>
                        ))}
                        {!rows.length && (
                            <tr>
                                <td className="p-3 text-gray-500" colSpan={3}>
                                    No departments yet.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    )
}
