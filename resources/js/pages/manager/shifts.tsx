import AppLayout from '@/layouts/app-layout'
import { Head, useForm, router } from '@inertiajs/react'

type Row = { id:number; name:string; start:string; end:string; active:boolean }
type PageProps = { rows: Row[]; flash?: string|null }

export default function Shifts({ rows, flash }: PageProps) {
    const create = useForm({ name:'', start:'07:00', end:'15:00', active:true })
    const edit   = useForm<{ id:number|null; name:string; start:string; end:string; active:boolean }>({ id:null, name:'', start:'', end:'', active:true })

    function submitCreate(e: React.FormEvent) {
        e.preventDefault()
        create.post('/manager/shifts', { onSuccess: ()=> create.reset('name','start','end','active') })
    }
    function openEdit(r: Row) { edit.setData({ id:r.id, name:r.name, start:r.start.slice(0,5), end:r.end.slice(0,5), active:r.active }) }
    function submitEdit() { if (!edit.data.id) return; edit.put(`/manager/shifts/${edit.data.id}`, { onSuccess: ()=> edit.reset('id','name','start','end','active') }) }
    function remove(id: number) {
        if (!confirm('Delete shift?')) return
        router.delete(`/manager/shifts/${id}`, { preserveScroll: true })
    }
    return (
        <AppLayout breadcrumbs={[{ title:'Shifts', href:'/manager/shifts' }]}>
            <Head title="Shifts • puls1" />
            <div className="flex flex-col gap-4 p-4">
                {flash && <div className="rounded border p-3">{flash}</div>}

                <form onSubmit={submitCreate} className="grid gap-3 rounded border p-4 md:grid-cols-5">
                    <div>
                        <label className="block text-sm">Name</label>
                        <input className="mt-1 w-full rounded border p-2" value={create.data.name} onChange={e=>create.setData('name', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm">Start</label>
                        <input type="time" className="mt-1 w-full rounded border p-2" value={create.data.start} onChange={e=>create.setData('start', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm">End</label>
                        <input type="time" className="mt-1 w-full rounded border p-2" value={create.data.end} onChange={e=>create.setData('end', e.target.value)} />
                    </div>
                    <label className="mt-6 inline-flex items-center gap-2">
                        <input type="checkbox" checked={create.data.active} onChange={e=>create.setData('active', e.target.checked)} /> Active
                    </label>
                    <button className="rounded bg-black px-4 py-2 text-white md:self-end">Create</button>
                </form>

                <div className="rounded border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                        <tr><th className="p-2 text-left">Name</th><th className="p-2 text-left">Start</th><th className="p-2 text-left">End</th><th className="p-2">Active</th><th className="p-2">Actions</th></tr>
                        </thead>
                        <tbody>
                        {rows.map(r=>(
                            <tr key={r.id} className="border-t">
                                <td className="p-2">{r.name}</td>
                                <td className="p-2">{r.start}</td>
                                <td className="p-2">{r.end}</td>
                                <td className="p-2">{r.active?'Yes':'No'}</td>
                                <td className="p-2 space-x-2">
                                    <button className="rounded border px-3 py-1" onClick={()=>openEdit(r)}>Edit</button>
                                    <button className="rounded border px-3 py-1" onClick={()=>remove(r.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {!rows.length && <tr><td className="p-3 text-gray-500" colSpan={5}>No shifts.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {edit.data.id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                        <div className="w-full max-w-lg rounded bg-white p-6">
                            <h2 className="mb-4 text-lg font-semibold">Edit shift</h2>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm">Name</label>
                                    <input className="mt-1 w-full rounded border p-2" value={edit.data.name} onChange={e=>edit.setData('name', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm">Start</label>
                                    <input type="time" className="mt-1 w-full rounded border p-2" value={edit.data.start} onChange={e=>edit.setData('start', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm">End</label>
                                    <input type="time" className="mt-1 w-full rounded border p-2" value={edit.data.end} onChange={e=>edit.setData('end', e.target.value)} />
                                </div>
                                <label className="inline-flex items-center gap-2">
                                    <input type="checkbox" checked={edit.data.active} onChange={e=>edit.setData('active', e.target.checked)} /> Active
                                </label>
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                                <button className="rounded border px-4 py-2" onClick={()=>edit.reset('id','name','start','end','active')}>Cancel</button>
                                <button className="rounded bg-black px-4 py-2 text-white" onClick={submitEdit}>Save</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
