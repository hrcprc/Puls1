import AppLayout from '@/layouts/app-layout'
import { Head, Link, useForm } from '@inertiajs/react'

type Row = {
    id:number
    work_date:string
    start_at:string
    end_at:string
    duration_minutes:number
    status:'planned'|'in_progress'|'done'|'canceled'
    notes?:string|null
    user_id:number
    user_name:string
    user_email:string
    department_id:number|null
    department_name:string|null
    department_code:string|null
    shift_id:number|null
    shift_name:string|null
    job_template_id:number|null
    job_name:string|null
    job_code:string|null
}

type Option = { id:number; name:string; code?:string }
type PageProps = {
    filters: {
        user_ids:number[]
        department_ids:number[]
        shift_id?:number|null
        status:string[]
        date_from:string
        date_to:string
    }
    rows: {
        data: Row[]
        current_page:number
        last_page:number
        links: { url:string|null; label:string; active:boolean }[]
        total:number
    }
    metrics: { by_status: Record<string, number>; total_minutes:number }
    options: {
        users: { id:number; name:string; email:string }[]
        departments: { id:number; name:string; code:string }[]
        shifts: { id:number; name:string }[]
        statuses: string[]
    }
    tz: string
    flash?: string|null
}

export default function Tasks({ filters, rows, metrics, options, tz, flash }: PageProps) {
    const { data, setData, get, processing } = useForm({
        user_ids: filters.user_ids ?? [],
        department_ids: filters.department_ids ?? [],
        shift_id: filters.shift_id ?? '',
        status: filters.status ?? [],
        date_from: filters.date_from,
        date_to: filters.date_to,
    })

    function toggleArray(key: 'user_ids'|'department_ids'|'status', value: number|string, checked: boolean) {
        const set = new Set(data[key] as any[])
        checked ? set.add(value as any) : set.delete(value as any)
        setData(key, Array.from(set) as any)
    }

    function submit(e: React.FormEvent) {
        e.preventDefault()
        get('/manager/tasks', { preserveScroll: true })
    }

    function resetFilters() {
        setData({
            user_ids: [],
            department_ids: [],
            shift_id: '',
            status: [],
            date_from: new Date(Date.now() - 6*86400000).toISOString().slice(0,10),
            date_to: new Date().toISOString().slice(0,10),
        })
    }

    return (
        <AppLayout breadcrumbs={[{ title:'Tasks', href:'/manager/tasks' }]}>
            <Head title="Tasks • puls1" />

            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {flash && (
                    <div className="rounded border border-green-200 bg-green-50 p-3 text-green-800">{flash}</div>
                )}

                {/* KPIs */}
                <div className="grid gap-3 md:grid-cols-4">
                    <div className="rounded border p-3">
                        <div className="text-xs text-muted-foreground">Total tasks (filtered)</div>
                        <div className="text-2xl font-semibold">{rows.total}</div>
                    </div>
                    <div className="rounded border p-3">
                        <div className="text-xs text-muted-foreground">Planned</div>
                        <div className="text-xl">{metrics.by_status?.planned ?? 0}</div>
                    </div>
                    <div className="rounded border p-3">
                        <div className="text-xs text-muted-foreground">In progress</div>
                        <div className="text-xl">{metrics.by_status?.in_progress ?? 0}</div>
                    </div>
                    <div className="rounded border p-3">
                        <div className="text-xs text-muted-foreground">Done (minutes)</div>
                        <div className="text-xl">{metrics.by_status?.done ?? 0} • {metrics.total_minutes}m</div>
                    </div>
                </div>

                {/* Filters */}
                <form onSubmit={submit} className="rounded border p-4 grid gap-4">
                    <div className="grid md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm text-muted-foreground">Date from</label>
                            <input type="date" className="mt-1 w-full rounded border p-2"
                                   value={data.date_from} onChange={e=>setData('date_from', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground">Date to</label>
                            <input type="date" className="mt-1 w-full rounded border p-2"
                                   value={data.date_to} onChange={e=>setData('date_to', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground">Shift</label>
                            <select className="mt-1 w-full rounded border p-2"
                                    value={data.shift_id ?? ''} onChange={e=>setData('shift_id', e.target.value || '')}>
                                <option value="">All</option>
                                {options.shifts.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-muted-foreground">Status</label>
                            <div className="mt-1 grid grid-cols-2 gap-2">
                                {options.statuses.map(st => (
                                    <label key={st} className="inline-flex items-center gap-2">
                                        <input type="checkbox"
                                               checked={data.status.includes(st)}
                                               onChange={e=>toggleArray('status', st, e.target.checked)} />
                                        <span className="capitalize">{st.replace('_',' ')}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <div className="text-sm text-muted-foreground mb-1">Departments</div>
                            <div className="grid sm:grid-cols-2 gap-2">
                                {options.departments.map(d=>(
                                    <label key={d.id} className="inline-flex items-center gap-2 rounded border p-2">
                                        <input type="checkbox"
                                               checked={data.department_ids.includes(d.id)}
                                               onChange={e=>toggleArray('department_ids', d.id, e.target.checked)} />
                                        <span>{d.name} <span className="text-xs text-muted-foreground">({d.code})</span></span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="text-sm text-muted-foreground mb-1">Users</div>
                            <div className="grid sm:grid-cols-2 gap-2 max-h-48 overflow-auto pr-2">
                                {options.users.map(u=>(
                                    <label key={u.id} className="inline-flex items-center gap-2 rounded border p-2">
                                        <input type="checkbox"
                                               checked={data.user_ids.includes(u.id)}
                                               onChange={e=>toggleArray('user_ids', u.id, e.target.checked)} />
                                        <span>{u.name} <span className="text-xs text-muted-foreground">({u.email})</span></span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button disabled={processing} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">Apply</button>
                        <button type="button" onClick={resetFilters} className="rounded border px-4 py-2">Reset</button>
                        {/* Optional CSV: <Link href={route('manager.tasks.export', data as any)} className="rounded border px-4 py-2">Export CSV</Link> */}
                    </div>
                </form>

                {/* Table */}
                <div className="rounded-xl border overflow-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="p-2 text-left">Date</th>
                            <th className="p-2 text-left">Time</th>
                            <th className="p-2 text-left">User</th>
                            <th className="p-2 text-left">Department</th>
                            <th className="p-2 text-left">Shift</th>
                            <th className="p-2 text-left">Job</th>
                            <th className="p-2 text-left">Duration</th>
                            <th className="p-2 text-left">Status</th>
                            <th className="p-2 text-left">Notes</th>
                        </tr>
                        </thead>
                        <tbody>
                        {rows.data.map(r=>{
                            // display local time quickly (server sent UTC strings)
                            const start = new Date(r.start_at)
                            const end   = new Date(r.end_at)
                            const fmt   = (d:Date)=> d.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })
                            return (
                                <tr key={r.id} className="border-t">
                                    <td className="p-2">{r.work_date}</td>
                                    <td className="p-2">{fmt(start)}–{fmt(end)}</td>
                                    <td className="p-2">{r.user_name}</td>
                                    <td className="p-2">{r.department_name ?? '—'} {r.department_code ? <span className="text-xs text-muted-foreground">({r.department_code})</span> : null}</td>
                                    <td className="p-2">{r.shift_name ?? '—'}</td>
                                    <td className="p-2">{r.job_name ?? '—'} {r.job_code ? <span className="text-xs text-muted-foreground">({r.job_code})</span> : null}</td>
                                    <td className="p-2">{r.duration_minutes}m</td>
                                    <td className="p-2 capitalize">{r.status.replace('_',' ')}</td>
                                    <td className="p-2">{r.notes ?? '—'}</td>
                                </tr>
                            )
                        })}
                        {!rows.data.length && (
                            <tr><td className="p-3 text-gray-500" colSpan={9}>No tasks found for the chosen filters.</td></tr>
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap gap-2">
                    {rows.links.map((l, i)=>(
                        <Link key={i}
                              href={l.url || '#'}
                              className={`px-3 py-1 rounded border ${l.active ? 'bg-black text-white' : 'bg-white'}`}
                              dangerouslySetInnerHTML={{ __html: l.label }} />
                    ))}
                </div>
            </div>
        </AppLayout>
    )
}
