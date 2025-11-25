import AppLayout from '@/layouts/app-layout'
import { Head, useForm, router } from '@inertiajs/react'

type Row = { id:number; name:string; code:string; active:boolean }
type PageProps = { rows: Row[]; flash?: string|null }

export default function JobTypes({ rows, flash }: PageProps) {
    const create = useForm({ name:'', code:'', active:true })
    const edit   = useForm<{ id:number|null; name:string; code:string; active:boolean }>({ id:null, name:'', code:'', active:true })

    function submitCreate(e: React.FormEvent) {
        e.preventDefault()
        create.post('/manager/job-types', { onSuccess: ()=> create.reset('name','code','active') })
    }
    function openEdit(r: Row) { edit.setData({ id:r.id, name:r.name, code:r.code, active:r.active }) }
    function submitEdit() {
        if (!edit.data.id) return
        edit.put(`/manager/job-types/${edit.data.id}`, { onSuccess: ()=> edit.reset('id','name','code','active') })
    }
    function remove(id: number) {
        if (!confirm('Delete job type?')) return
        router.delete(`/manager/job-types/${id}`, { preserveScroll: true })
    }

    return (
        <AppLayout breadcrumbs={[{ title:'Job Types', href:'/manager/job-types' }]}>
            <Head title="Job Types • puls1" />
            <div className="flex flex-col gap-4 p-4">
                {flash && <div className="rounded border p-3">{flash}</div>}

                <form onSubmit={submitCreate} className="grid gap-3 rounded border p-4 md:grid-cols-4">
                    <div>
                        <label className="block text-sm">Name</label>
                        <input className="mt-1 w-full rounded border p-2" value={create.data.name} onChange={e=>create.setData('name', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm">Code (A–Z,0–9,_)</label>
                        <input className="mt-1 w-full rounded border p-2 uppercase" value={create.data.code} onChange={e=>create.setData('code', e.target.value.toUpperCase())} />
                    </div>
                    <label className="mt-6 inline-flex items-center gap-2">
                        <input type="checkbox" checked={create.data.active} onChange={e=>create.setData('active', e.target.checked)} /> Active
                    </label>
                    <button className="rounded bg-black px-4 py-2 text-white md:self-end">Create</button>
                </form>

                <div className="rounded border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                        <tr><th className="p-2 text-left">Name</th><th className="p-2 text-left">Code</th><th className="p-2">Active</th><th className="p-2">Actions</th></tr>
                        </thead>
                        <tbody>
                        {rows.map(r=>(
                            <tr key={r.id} className="border-t">
                                <td className="p-2">{r.name}</td>
                                <td className="p-2">{r.code}</td>
                                <td className="p-2">{r.active?'Yes':'No'}</td>
                                <td className="p-2 space-x-2">
                                    <button className="rounded border px-3 py-1" onClick={()=>openEdit(r)}>Edit</button>
                                    <button className="rounded border px-3 py-1" onClick={()=>remove(r.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {!rows.length && <tr><td className="p-3 text-gray-500" colSpan={4}>No job types.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {edit.data.id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                        <div className="w-full max-w-lg rounded bg-white p-6">
                            <h2 className="mb-4 text-lg font-semibold">Edit type</h2>
                            <div className="grid gap-3">
                                <div>
                                    <label className="block text-sm">Name</label>
                                    <input className="mt-1 w-full rounded border p-2" value={edit.data.name} onChange={e=>edit.setData('name', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm">Code</label>
                                    <input className="mt-1 w-full rounded border p-2 uppercase" value={edit.data.code} onChange={e=>edit.setData('code', e.target.value.toUpperCase())} />
                                </div>
                                <label className="inline-flex items-center gap-2">
                                    <input type="checkbox" checked={edit.data.active} onChange={e=>edit.setData('active', e.target.checked)} /> Active
                                </label>
                            </div>
                            <div className="mt-4 flex justify-end gap-2">
                                <button className="rounded border px-4 py-2" onClick={()=>edit.reset('id','name','code','active')}>Cancel</button>
                                <button className="rounded bg-black px-4 py-2 text-white" onClick={submitEdit}>Save</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
