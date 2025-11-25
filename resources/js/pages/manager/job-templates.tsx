import AppLayout from '@/layouts/app-layout'
 import { Head, useForm, router } from '@inertiajs/react'

type TypeOpt = { id:number; name:string; code:string }
type Row = { id:number; job_type_id:number; name:string; code:string; default_duration:number; requires_attachment:boolean; active:boolean; type?: { id:number; name:string } }
type PageProps = { rows: Row[]; types: TypeOpt[]; flash?: string|null }

const DURATIONS = Array.from({length:16}, (_,i)=>(i+1)*30) // 30..480

export default function JobTemplates({ rows, types, flash }: PageProps) {
    const create = useForm({
        job_type_id: types[0]?.id ?? '',
        name:'', code:'', default_duration:30, instructions:'', requires_attachment:false, active:true
    })
    const edit = useForm<{ id:number|null; job_type_id:any; name:string; code:string; default_duration:number; instructions:string; requires_attachment:boolean; active:boolean }>({
        id:null, job_type_id:'', name:'', code:'', default_duration:30, instructions:'', requires_attachment:false, active:true
    })

    function submitCreate(e: React.FormEvent) {
        e.preventDefault()
        create.post('/manager/job-templates', { onSuccess: ()=> create.reset('job_type_id','name','code','default_duration','instructions','requires_attachment','active') })
    }
    function openEdit(r: Row) {
        edit.setData({
            id:r.id, job_type_id:r.job_type_id, name:r.name, code:r.code, default_duration:r.default_duration,
            instructions:'', requires_attachment:r.requires_attachment, active:r.active
        })
    }
    function submitEdit() {
        if (!edit.data.id) return
        // @ts-ignore
        edit.put(`/manager/job-templates/${edit.data.id}`, { onSuccess: ()=> edit.reset('id','job_type_id','name','code','default_duration','instructions','requires_attachment','active') })
    }
    function remove(id: number) {
        if (!confirm('Delete job template?')) return
        router.delete(`/manager/job-templates/${id}`, { preserveScroll: true })
    }
    return (
        <AppLayout breadcrumbs={[{ title:'Job Templates', href:'/manager/job-templates' }]}>
            <Head title="Job Templates • puls1" />
            <div className="flex flex-col gap-4 p-4">
                {flash && <div className="rounded border p-3">{flash}</div>}

                <form onSubmit={submitCreate} className="grid gap-3 rounded border p-4">
                    <div className="grid md:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-sm">Type</label>
                            <select className="mt-1 w-full rounded border p-2" value={create.data.job_type_id} onChange={e=>create.setData('job_type_id', e.target.value)}>
                                {types.map(t=> <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm">Name</label>
                            <input className="mt-1 w-full rounded border p-2" value={create.data.name} onChange={e=>create.setData('name', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm">Code</label>
                            <input className="mt-1 w-full rounded border p-2 uppercase" value={create.data.code} onChange={e=>create.setData('code', e.target.value.toUpperCase())} />
                        </div>
                        <div>
                            <label className="block text-sm">Default duration</label>
                            <select className="mt-1 w-full rounded border p-2" value={create.data.default_duration} onChange={e=>create.setData('default_duration', Number(e.target.value))}>
                                {DURATIONS.map(m=> <option key={m} value={m}>{m<60?`${m}m`:`${Math.floor(m/60)}h${m%60?` ${m%60}m`:''}`}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                            <label className="block text-sm">Instructions (optional)</label>
                            <textarea className="mt-1 w-full rounded border p-2" rows={3} value={create.data.instructions} onChange={e=>create.setData('instructions', e.target.value)} />
                        </div>
                        <div className="flex flex-col justify-end gap-3">
                            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={create.data.requires_attachment} onChange={e=>create.setData('requires_attachment', e.target.checked)} /> Requires attachment</label>
                            <label className="inline-flex items-center gap-2"><input type="checkbox" checked={create.data.active} onChange={e=>create.setData('active', e.target.checked)} /> Active</label>
                            <button className="rounded bg-black px-4 py-2 text-white">Create</button>
                        </div>
                    </div>
                </form>

                <div className="rounded border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Code</th>
                            <th className="p-2 text-left">Type</th>
                            <th className="p-2 text-left">Default</th>
                            <th className="p-2">Attach?</th>
                            <th className="p-2">Active</th>
                            <th className="p-2">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.map(r=>(
                            <tr key={r.id} className="border-t">
                                <td className="p-2">{r.name}</td>
                                <td className="p-2">{r.code}</td>
                                <td className="p-2">{r.type?.name ?? '—'}</td>
                                <td className="p-2">{r.default_duration}m</td>
                                <td className="p-2">{r.requires_attachment?'Yes':'No'}</td>
                                <td className="p-2">{r.active?'Yes':'No'}</td>
                                <td className="p-2 space-x-2">
                                    <button className="rounded border px-3 py-1" onClick={()=>openEdit(r)}>Edit</button>
                                    <button className="rounded border px-3 py-1" onClick={()=>remove(r.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                        {!rows.length && <tr><td className="p-3 text-gray-500" colSpan={7}>No job templates.</td></tr>}
                        </tbody>
                    </table>
                </div>

                {edit.data.id && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
                        <div className="w-full max-w-2xl rounded bg-white p-6">
                            <h2 className="mb-4 text-lg font-semibold">Edit template</h2>

                            <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm">Type</label>
                                    <select className="mt-1 w-full rounded border p-2" value={edit.data.job_type_id} onChange={e=>edit.setData('job_type_id', e.target.value)}>
                                        {types.map(t=> <option key={t.id} value={t.id}>{t.name} ({t.code})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm">Code</label>
                                    <input className="mt-1 w-full rounded border p-2 uppercase" value={edit.data.code} onChange={e=>edit.setData('code', e.target.value.toUpperCase())} />
                                </div>
                                <div>
                                    <label className="block text-sm">Name</label>
                                    <input className="mt-1 w-full rounded border p-2" value={edit.data.name} onChange={e=>edit.setData('name', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm">Default duration</label>
                                    <select className="mt-1 w-full rounded border p-2" value={edit.data.default_duration} onChange={e=>edit.setData('default_duration', Number(e.target.value))}>
                                        {DURATIONS.map(m=> <option key={m} value={m}>{m<60?`${m}m`:`${Math.floor(m/60)}h${m%60?` ${m%60}m`:''}`}</option>)}
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm">Instructions (optional)</label>
                                    <textarea className="mt-1 w-full rounded border p-2" rows={3} value={edit.data.instructions} onChange={e=>edit.setData('instructions', e.target.value)} />
                                </div>
                                <label className="inline-flex items-center gap-2">
                                    <input type="checkbox" checked={edit.data.requires_attachment} onChange={e=>edit.setData('requires_attachment', e.target.checked)} /> Requires attachment
                                </label>
                                <label className="inline-flex items-center gap-2">
                                    <input type="checkbox" checked={edit.data.active} onChange={e=>edit.setData('active', e.target.checked)} /> Active
                                </label>
                            </div>

                            <div className="mt-4 flex justify-end gap-2">
                                <button className="rounded border px-4 py-2" onClick={()=>edit.reset('id','job_type_id','name','code','default_duration','instructions','requires_attachment','active')}>Cancel</button>
                                <button className="rounded bg-black px-4 py-2 text-white" onClick={submitEdit}>Save</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
