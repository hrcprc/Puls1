import AppLayout from '@/layouts/app-layout'
import { type BreadcrumbItem } from '@/types'
import { Head, useForm } from '@inertiajs/react'
import { departments as departmentsRoute } from '@/routes/supervisor' // just for breadcrumb link back to departments
// If Wayfinder generated a users helper, you can import it similarly.
// For POST, we’ll use the literal URL '/supervisor/users' (works regardless of generator).

type Dept = { id:number; name:string; code:string; active:boolean }
type UserRow = {
    id:number; name:string; email:string;
    departments: { id:number; name:string; code:string; role?:string|null }[];
}
type PageProps = {
    users: UserRow[]
    departments: Dept[]
    flash?: string|null
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users', href: '/supervisor/users' },
]

export default function Users({ users, departments, flash }: PageProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        departments: [] as number[],
        role: 'Worker' as 'Manager'|'Worker',
    })

    function submit(e: React.FormEvent) {
        e.preventDefault()
        post('/supervisor/users', { onSuccess: () => reset('name','email','password','departments') })
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Users • puls1" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {flash && (
                    <div className="rounded border border-green-200 bg-green-50 p-3 text-green-800">
                        {flash}
                    </div>
                )}

                {/* Create form */}
                <form onSubmit={submit} className="grid gap-4 rounded-xl border p-4">
                    <div className="grid gap-2 md:grid-cols-3">
                        <div>
                            <label className="block text-sm text-muted-foreground">Name</label>
                            <input
                                className="mt-1 w-full rounded border p-2"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                            />
                            {errors.name && <div className="mt-1 text-sm text-red-600">{errors.name}</div>}
                        </div>

                        <div>
                            <label className="block text-sm text-muted-foreground">Email</label>
                            <input
                                className="mt-1 w-full rounded border p-2"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                            />
                            {errors.email && <div className="mt-1 text-sm text-red-600">{errors.email}</div>}
                        </div>

                        <div>
                            <label className="block text-sm text-muted-foreground">Password</label>
                            <input
                                type="password"
                                className="mt-1 w-full rounded border p-2"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                            />
                            {errors.password && <div className="mt-1 text-sm text-red-600">{errors.password}</div>}
                        </div>
                    </div>

                    {/* Departments multi-select (checkbox list) */}
                    <div>
                        <div className="text-sm text-muted-foreground mb-2">Departments</div>
                        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                            {departments.map(d => (
                                <label key={d.id} className="inline-flex items-center gap-2 rounded border p-2">
                                    <input
                                        type="checkbox"
                                        checked={data.departments.includes(d.id)}
                                        onChange={(e) => {
                                            const set = new Set(data.departments)
                                            e.target.checked ? set.add(d.id) : set.delete(d.id)
                                            setData('departments', Array.from(set))
                                        }}
                                    />
                                    <span>{d.name} <span className="text-xs text-muted-foreground">({d.code})</span></span>
                                </label>
                            ))}
                        </div>
                        {errors.departments && <div className="mt-1 text-sm text-red-600">{errors.departments}</div>}
                    </div>

                    {/* Role select */}
                    <div>
                        <label className="block text-sm text-muted-foreground">Role for selected departments</label>
                        <select
                            className="mt-1 w-full rounded border p-2 max-w-xs"
                            value={data.role}
                            onChange={(e) => setData('role', e.target.value as 'Manager'|'Worker')}
                        >
                            <option value="Worker">Worker</option>
                            <option value="Manager">Manager</option>
                        </select>
                        {errors.role && <div className="mt-1 text-sm text-red-600">{errors.role}</div>}
                    </div>

                    <div>
                        <button
                            disabled={processing}
                            className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                        >
                            Create user
                        </button>
                    </div>
                </form>

                {/* Directory */}
                <div className="rounded-xl border overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 text-left">Name</th>
                            <th className="p-2 text-left">Email</th>
                            <th className="p-2 text-left">Departments / Role</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map(u => (
                            <tr key={u.id} className="border-t">
                                <td className="p-2">{u.name}</td>
                                <td className="p-2">{u.email}</td>
                                <td className="p-2">
                                    {u.departments.length ? (
                                        <ul className="list-disc pl-5">
                                            {u.departments.map(d => (
                                                <li key={d.id}>
                                                    {d.name} <span className="text-xs text-muted-foreground">({d.code})</span>
                                                    {d.role ? <span className="ml-2 rounded bg-gray-100 px-2 py-0.5 text-xs">{d.role}</span> : null}
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <span className="text-muted-foreground">—</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {!users.length && (
                            <tr>
                                <td className="p-3 text-gray-500" colSpan={3}>No users yet.</td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    )
}
