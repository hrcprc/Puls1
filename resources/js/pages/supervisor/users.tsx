import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, useForm, router } from '@inertiajs/react'
import { useMemo, useState } from 'react'

type Dept = { id:number; name:string; code:string; active:boolean }
type UserRow = {
    id:number; name:string; email:string;
    departments: { id:number; name:string; code:string; role?:string|null }[];
}
type PageProps = { users: UserRow[]; departments: Dept[]; flash?: string|null }

const breadcrumbs: BreadcrumbItem[] = [{ title:'Users', href:'/supervisor/users' }]

export default function Users({ users, departments, flash }: PageProps) {
    const [editingId, setEditingId] = useState<number|null>(null)
    const toEdit = useMemo(()=> users.find(u=>u.id===editingId) ?? null, [users, editingId])

    const create = useForm({
        name:'', email:'', password:'', departments: [] as number[], role: 'Worker' as 'Worker'|'Manager'
    })

    const editForm = useForm({
        name: toEdit?.name ?? '',
        email: toEdit?.email ?? '',
        password: '',
        departments: (toEdit?.departments ?? []).map(d=>d.id),
        role: (toEdit?.departments?.[0]?.role as 'Worker'|'Manager') ?? 'Worker',
    })

    function submitCreate(e: React.FormEvent) {
        e.preventDefault()
        create.post('/supervisor/users', { onSuccess: ()=> create.reset('name','email','password','departments') })
    }

    function openEdit(u: UserRow) {
        setEditingId(u.id)
        editForm.setData({
            name: u.name, email: u.email, password: '',
            departments: u.departments.map(d=>d.id),
            role: (u.departments[0]?.role as 'Worker'|'Manager') ?? 'Worker',
        })
    }

    function saveEdit() {
        if (!editingId) return
        router.put(`/supervisor/users/${editingId}`, editForm.data, {
            onSuccess: ()=> setEditingId(null),
            preserveScroll: true
        })
    }

    function removeUser(id:number) {
        if (!confirm('Delete user?')) return
        router.delete(`/supervisor/users/${id}`, { preserveScroll: true })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users • puls1" />
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
                            <label className="block text-sm text-muted-foreground">Email</label>
                            <input className="mt-1 w-full rounded border p-2"
                                   value={create.data.email} onChange={e=>create.setData('email', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground">Password</label>
                            <input type="password" className="mt-1 w-full rounded border p-2"
                                   value={create.data.password} onChange={e=>create.setData('password', e.target.value)} />
                        </div>
                    </div>

                    <div>
                        <div className="text-sm text-muted-foreground mb-2">Departments</div>
                        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                            {departments.map(d=>(
                                <label key={d.id} className="inline-flex items-center gap-2 rounded border p-2">
                                    <input type="checkbox"
                                           checked={create.data.departments.includes(d.id)}
                                           onChange={e=>{
                                               const set = new Set(create.data.departments)
                                               e.target.checked ? set.add(d.id) : set.delete(d.id)
                                               create.setData('departments', Array.from(set))
                                           }} />
                                    <span>{d.name} <span className="text-xs text-muted-foreground">({d.code})</span></span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-muted-foreground">Role for selected departments</label>
                        <select className="mt-1 w-full rounded border p-2 max-w-xs"
                                value={create.data.role} onChange={e=>create.setData('role', e.target.value as any)}>
                            <option value="Worker">Worker</option>
                            <option value="Manager">Manager</option>
                        </select>
                    </div>

                    <button disabled={create.processing} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">Create user</button>
                </form>

                {/* Directory */}
                <div className="rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Email</th>
                            <th className="p-2 text-left">Departments / Role</th>
                            <th className="p-2 text-left w-40">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(u=>(
                            <tr key={u.id} className="border-t">
                                <td className="p-2">{u.name}</td>
                                <td className="p-2">{u.email}</td>
                                <td className="p-2">
                                    {u.departments.length ? (
                                        <ul className="list-disc pl-5">
                                            {u.departments.map(d=>(
                                                <li key={d.id}>
                                                    {d.name} <span className="text-xs text-muted-foreground">({d.code})</span>
                                                    {d.role ? <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs">{d.role}</span> : null}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <span className="text-muted-foreground">—</span>}
                                </td>
                                <td className="p-2 space-x-2">
                                    <button onClick={()=>openEdit(u)} className="rounded px-3 py-1 border">Edit</button>
                                    <button onClick={()=>removeUser(u.id)} className="rounded px-3 py-1 border">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {!users.length && (
                            <tr><td className="p-3 text-gray-500" colSpan={4}>No users yet.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Edit modal */}
                {editingId && toEdit && (
                    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
                        <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
                            <h2 className="text-lg font-semibold mb-4">Edit user</h2>

                            <div className="grid gap-3 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm text-muted-foreground">Name</label>
                                    <input className="mt-1 w-full rounded border p-2"
                                           value={editForm.data.name} onChange={e=>editForm.setData('name', e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-sm text-muted-foreground">Email</label>
                                    <input className="mt-1 w-full rounded border p-2"
                                           value={editForm.data.email} onChange={e=>editForm.setData('email', e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm text-muted-foreground">New password (optional)</label>
                                    <input type="password" className="mt-1 w-full rounded border p-2"
                                           value={editForm.data.password} onChange={e=>editForm.setData('password', e.target.value)} />
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="text-sm text-muted-foreground mb-2">Departments</div>
                                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                                    {departments.map(d=>(
                                        <label key={d.id} className="inline-flex items-center gap-2 rounded border p-2">
                                            <input type="checkbox"
                                                   checked={editForm.data.departments.includes(d.id)}
                                                   onChange={e=>{
                                                       const set = new Set(editForm.data.departments)
                                                       e.target.checked ? set.add(d.id) : set.delete(d.id)
                                                       editForm.setData('departments', Array.from(set))
                                                   }} />
                                            <span>{d.name} <span className="text-xs text-muted-foreground">({d.code})</span></span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm text-muted-foreground">Role for selected departments</label>
                                <select className="mt-1 w-full rounded border p-2 max-w-xs"
                                        value={editForm.data.role}
                                        onChange={e=>editForm.setData('role', e.target.value as any)}>
                                    <option value="Worker">Worker</option>
                                    <option value="Manager">Manager</option>
                                </select>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                <button onClick={()=>setEditingId(null)} className="rounded px-4 py-2 border">Cancel</button>
                                <button onClick={saveEdit} className="rounded bg-black px-4 py-2 text-white">Save</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    )
}
