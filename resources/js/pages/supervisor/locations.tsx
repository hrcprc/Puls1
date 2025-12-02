import AppLayout from '@/layouts/app-layout'
import { Head, useForm, router } from '@inertiajs/react'
import { useMemo, useState } from 'react'

type Location = {
    id:number
    name:string
    code:string|null
    active:boolean
    department_id:number
    department_name:string
    department_code:string
}

type Department = { id:number; name:string; code:string }

type PageProps = {
    locations: Location[]
    departments: Department[]
    flash?: string|null
}

export default function LocationsPage({ locations, departments, flash }: PageProps) {
    const [editingId, setEditingId] = useState<number|null>(null)
    const editing = useMemo(() => locations.find(l => l.id === editingId) ?? null, [editingId, locations])

    const create = useForm({ name:'', code:'', active:true, department_id: departments[0]?.id ?? '' })
    const editForm = useForm({
        name: editing?.name ?? '',
        code: editing?.code ?? '',
        active: editing?.active ?? true,
        department_id: editing?.department_id ?? departments[0]?.id ?? '',
    })

    function submitCreate(e: React.FormEvent) {
        e.preventDefault()
        create.post('/supervisor/locations', { onSuccess: () => create.reset('name','code','active') })
    }

    function startEdit(id:number, loc: Location) {
        setEditingId(id)
        editForm.setData({
            name: loc.name,
            code: loc.code ?? '',
            active: loc.active,
            department_id: loc.department_id,
        })
    }

    function saveEdit(id:number) {
        router.put(`/supervisor/locations/${id}`, editForm.data, {
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
        })
    }

    function remove(id:number) {
        if (!confirm('Delete location?')) return
        router.delete(`/supervisor/locations/${id}`, { preserveScroll: true })
    }

    return (
        <AppLayout breadcrumbs={[{ title:'Locations', href:'/supervisor/locations' }]}>
            <Head title="Locations • puls1" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {flash && <div className="rounded border border-green-200 bg-green-50 p-3 text-green-800">{flash}</div>}

                <form onSubmit={submitCreate} className="grid gap-4 rounded-xl border p-4">
                    <div className="grid gap-2 md:grid-cols-4">
                        <div>
                            <label className="block text-sm text-muted-foreground">Name</label>
                            <input className="mt-1 w-full rounded border p-2"
                                   value={create.data.name}
                                   onChange={e=>create.setData('name', e.target.value)} />
                            {create.errors.name && <p className="text-sm text-red-600 mt-1">{create.errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground">Code</label>
                            <input className="mt-1 w-full rounded border p-2"
                                   value={create.data.code}
                                   onChange={e=>create.setData('code', e.target.value)} />
                            {create.errors.code && <p className="text-sm text-red-600 mt-1">{create.errors.code}</p>}
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground">Department</label>
                            <select className="mt-1 w-full rounded border p-2"
                                    value={create.data.department_id}
                                    onChange={e=>create.setData('department_id', Number(e.target.value))}>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                            </select>
                            {create.errors.department_id && <p className="text-sm text-red-600 mt-1">{create.errors.department_id}</p>}
                        </div>
                        <label className="mt-6 inline-flex items-center gap-2">
                            <input type="checkbox" checked={!!create.data.active}
                                   onChange={e=>create.setData('active', e.target.checked)} />
                            <span>Active</span>
                        </label>
                    </div>
                    <button disabled={create.processing} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">Create</button>
                </form>

                <div className="rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Code</th>
                            <th className="p-2 text-left">Department</th>
                            <th className="p-2 text-left">Active</th>
                            <th className="p-2 text-left w-48">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {locations.map(loc => {
                            const isEditing = loc.id === editingId
                            return (
                                <tr key={loc.id} className="border-t">
                                    <td className="p-2">
                                        {isEditing ? (
                                            <input className="w-full rounded border p-1"
                                                   value={editForm.data.name}
                                                   onChange={e=>editForm.setData('name', e.target.value)} />
                                        ) : loc.name}
                                        {isEditing && editForm.errors.name && <p className="text-sm text-red-600">{editForm.errors.name}</p>}
                                    </td>
                                    <td className="p-2">
                                        {isEditing ? (
                                            <input className="w-full rounded border p-1"
                                                   value={editForm.data.code ?? ''}
                                                   onChange={e=>editForm.setData('code', e.target.value)} />
                                        ) : (loc.code ?? '—')}
                                        {isEditing && editForm.errors.code && <p className="text-sm text-red-600">{editForm.errors.code}</p>}
                                    </td>
                                    <td className="p-2">
                                        {isEditing ? (
                                            <select className="w-full rounded border p-1"
                                                    value={editForm.data.department_id}
                                                    onChange={e=>editForm.setData('department_id', Number(e.target.value))}>
                                                {departments.map(d => <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                                            </select>
                                        ) : (
                                            <span>{loc.department_name} <span className="text-xs text-muted-foreground">({loc.department_code})</span></span>
                                        )}
                                        {isEditing && editForm.errors.department_id && <p className="text-sm text-red-600">{editForm.errors.department_id}</p>}
                                    </td>
                                    <td className="p-2">
                                        {isEditing ? (
                                            <input type="checkbox" checked={!!editForm.data.active}
                                                   onChange={e=>editForm.setData('active', e.target.checked)} />
                                        ) : (loc.active ? 'Yes' : 'No')}
                                    </td>
                                    <td className="p-2 space-x-2">
                                        {isEditing ? (
                                            <>
                                                <button onClick={()=>saveEdit(loc.id)} className="rounded bg-black px-3 py-1 text-white">Save</button>
                                                <button onClick={()=>setEditingId(null)} className="rounded px-3 py-1 border">Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={()=>startEdit(loc.id, loc)} className="rounded px-3 py-1 border">Edit</button>
                                                <button onClick={()=>remove(loc.id)} className="rounded px-3 py-1 border">Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                        {!locations.length && (
                            <tr><td className="p-3 text-gray-500" colSpan={5}>No locations yet.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    )
}
