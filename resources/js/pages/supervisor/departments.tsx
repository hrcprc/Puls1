import AppLayout from '@/layouts/app-layout'
import { Head, useForm, router } from '@inertiajs/react'
import { departments as departmentsRoute } from '@/routes/supervisor'
import { useState } from 'react'

type Department = { id:number; name:string; code:string; active:boolean }
type PageProps = { departments: Department[]; flash?: string|null }

export default function Departments({ departments: rows, flash }: PageProps) {
    const [editingId, setEditingId] = useState<number|null>(null)
    const edit = rows.find(r => r.id === editingId) ?? null

    const create = useForm({ name:'', code:'', active:true })
    const editForm = useForm({ name: edit?.name ?? '', code: edit?.code ?? '', active: edit?.active ?? true })

    function submitCreate(e: React.FormEvent) {
        e.preventDefault()
        create.post(departmentsRoute().url, { onSuccess: () => create.reset('name','code') })
    }

    function startEdit(id:number, d:Department) {
        setEditingId(id)
        editForm.setData({ name:d.name, code:d.code, active:d.active })
    }
    function saveEdit(id:number) {
        router.put(`${departmentsRoute().url}/${id}`, editForm.data, {
            preserveScroll: true,
            onSuccess: () => setEditingId(null),
        })
    }
    function remove(id:number) {
        if (!confirm('Delete department?')) return
        router.delete(`${departmentsRoute().url}/${id}`, { preserveScroll: true })
    }

    return (
        <AppLayout breadcrumbs={[{ title:'Departments', href: departmentsRoute().url }]}>
            <Head title="Departments • puls1" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">

                {flash && <div className="rounded border border-green-200 bg-green-50 p-3 text-green-800">{flash}</div>}

                {/* Create */}
                <form onSubmit={submitCreate} className="grid gap-4 rounded-xl border p-4">
                    <div className="grid gap-2 md:grid-cols-3">
                        <div>
                            <label className="block text-sm text-muted-foreground">Name</label>
                            <input className="mt-1 w-full rounded border p-2"
                                   value={create.data.name} onChange={e=>create.setData('name', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground">Code</label>
                            <input className="mt-1 w-full rounded border p-2"
                                   value={create.data.code} onChange={e=>create.setData('code', e.target.value)} />
                        </div>
                        <label className="mt-6 inline-flex items-center gap-2">
                            <input type="checkbox" checked={create.data.active}
                                   onChange={e=>create.setData('active', e.target.checked)} />
                            <span>Active</span>
                        </label>
                    </div>
                    <button disabled={create.processing} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">Create</button>
                </form>

                {/* List + inline edit */}
                <div className="rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Code</th>
                            <th className="p-2 text-left">Active</th>
                            <th className="p-2 text-left w-40">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map(d => {
                            const isEditing = d.id === editingId
                            return (
                                <tr key={d.id} className="border-t">
                                    <td className="p-2">
                                        {isEditing ? (
                                            <input className="w-full rounded border p-1"
                                                   value={editForm.data.name} onChange={e=>editForm.setData('name', e.target.value)} />
                                        ) : d.name}
                                    </td>
                                    <td className="p-2">
                                        {isEditing ? (
                                            <input className="w-full rounded border p-1"
                                                   value={editForm.data.code} onChange={e=>editForm.setData('code', e.target.value)} />
                                        ) : d.code}
                                    </td>
                                    <td className="p-2">
                                        {isEditing ? (
                                            <input type="checkbox" checked={!!editForm.data.active}
                                                   onChange={e=>editForm.setData('active', e.target.checked)} />
                                        ) : (d.active ? 'Yes' : 'No')}
                                    </td>
                                    <td className="p-2 space-x-2">
                                        {isEditing ? (
                                            <>
                                                <button onClick={()=>saveEdit(d.id)} className="rounded bg-black px-3 py-1 text-white">Save</button>
                                                <button onClick={()=>setEditingId(null)} className="rounded px-3 py-1 border">Cancel</button>
                                            </>
                                        ) : (
                                            <>
                                                <button onClick={()=>startEdit(d.id, d)} className="rounded px-3 py-1 border">Edit</button>
                                                <button onClick={()=>remove(d.id)} className="rounded px-3 py-1 border">Delete</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                        {!rows.length && (
                            <tr><td className="p-3 text-gray-500" colSpan={4}>No departments yet.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    )
}
