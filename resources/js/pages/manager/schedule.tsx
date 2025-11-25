import AppLayout from '@/layouts/app-layout'
import { Head, router, useForm } from '@inertiajs/react'
import { useMemo, useState } from 'react'

type Dept = { id:number; name:string; code:string }
type Shift = { id:number; name:string; start:string; end:string }
type JobTemplate = { id:number; name:string; code:string; default_duration:number }
type Worker = { id:number; name:string; email:string }
type Slot = {
    id:number
    user_id:number
    start:string
    end:string
    duration:number
    status:string
    job:string
    job_template_id:number
    notes:string|null
    start_at_local:string
}

type PageProps = {
    filters: { date:string; department_id:number; shift_id:number }
    options: {
        departments: Dept[]
        shifts: Shift[]
        job_templates: JobTemplate[]
        tz: string
    }
    schedule: { id:number; times:string[] } | null
    workers: Worker[]
    slots: Slot[]
    flash?: string|null
}

const DURATIONS = Array.from({ length: 16 }, (_, i) => (i + 1) * 30) // 30..480

export default function ManagerSchedulePage({ filters, options, schedule, workers, slots, flash }: PageProps) {
    const [adding, setAdding] = useState<{ user_id:number; time:string }|null>(null)
    const [editing, setEditing] = useState<Slot|null>(null)

    // index slots by user+start for quick lookup
    const byUserStart = useMemo(()=>{
        const m = new Map<string, Slot>()
        for (const s of slots) m.set(`${s.user_id}__${s.start}`, s)
        return m
    }, [slots])

    function changeFilter<K extends keyof typeof filters>(key: K, val: string|number) {
        router.get('/manager/schedule', { ...filters, [key]: val }, { preserveState: true })
    }

    return (
        <AppLayout breadcrumbs={[{ title:'Schedule', href:'/manager/schedule' }]}>
            <Head title="Schedule • puls1" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {flash && <div className="rounded border p-3">{flash}</div>}

                {/* Filter bar */}
                <div className="grid gap-3 rounded border p-4 md:grid-cols-4">
                    <div>
                        <label className="block text-sm">Date</label>
                        <input type="date" className="mt-1 w-full rounded border p-2"
                               value={filters.date}
                               onChange={e=>changeFilter('date', e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm">Department</label>
                        <select className="mt-1 w-full rounded border p-2"
                                value={filters.department_id}
                                onChange={e=>changeFilter('department_id', Number(e.target.value))}>
                            {options.departments.map(d=> <option key={d.id} value={d.id}>{d.name} ({d.code})</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm">Shift</label>
                        <select className="mt-1 w-full rounded border p-2"
                                value={filters.shift_id}
                                onChange={e=>changeFilter('shift_id', Number(e.target.value))}>
                            {options.shifts.map(s=> <option key={s.id} value={s.id}>{s.name} ({s.start}–{s.end})</option>)}
                        </select>
                    </div>
                </div>

                {/* Grid */}
                {!schedule ? (
                    <div className="rounded border p-6 text-gray-600">Select date / department / shift.</div>
                ) : (
                    <div className="rounded border overflow-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="p-2 text-left min-w-52">Worker</th>
                                {schedule.times.map(t=> <th key={t} className="p-2 text-center min-w-24">{t}</th>)}
                            </tr>
                            </thead>
                            <tbody>
                            {workers.map(w=>{
                                return (
                                    <tr key={w.id} className="border-t">
                                        <td className="p-2 font-medium">{w.name}<div className="text-xs text-muted-foreground">{w.email}</div></td>
                                        {schedule.times.map(t=>{
                                            const placed = byUserStart.get(`${w.id}__${t}`)
                                            if (placed) {
                                                // span across columns according to duration
                                                const span = Math.max(1, placed.duration / 30)
                                                // after rendering the starting cell with colSpan, skip the covered cells
                                                return (
                                                    <td key={`${w.id}-${t}`} colSpan={span} className="p-1">
                                                        <button
                                                            type="button"
                                                            className="w-full"
                                                            onClick={()=>setEditing(placed)}
                                                        >
                                                            <div className="rounded bg-neutral-900 text-white px-2 py-1 flex items-center justify-between">
                                                                <span className="truncate">{placed.job}</span>
                                                                <span className="text-xs ml-2">{placed.start}–{placed.end}</span>
                                                            </div>
                                                        </button>
                                                    </td>
                                                )
                                            }
                                            // render only cells that are not covered by a spanning block:
                                            // detect if this time falls inside any existing slot for this user (excluding the start)
                                            const isCovered = slots.some(s => s.user_id===w.id && s.start < t && t < s.end)
                                            if (isCovered) return null

                                            return (
                                                <td key={`${w.id}-${t}`} className="p-1">
                                                    <button
                                                        className="w-full rounded border px-2 py-1 hover:bg-gray-50"
                                                        onClick={()=>setAdding({ user_id:w.id, time:t })}
                                                    >+</button>
                                                </td>
                                            )
                                        })}
                                    </tr>
                                )
                            })}
                            {!workers.length && (
                                <tr><td className="p-3 text-gray-500" colSpan={1 + schedule.times.length}>No workers in this department.</td></tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Modal */}
                {adding && schedule && (
                    <SlotModal
                        mode="add"
                        scheduleId={schedule.id}
                        users={workers}
                        defaultUserId={adding.user_id}
                        startTimeLocal={`${filters.date} ${adding.time}`}
                        jobTemplates={options.job_templates}
                        shift={options.shifts.find(s=>s.id===filters.shift_id)!}
                        onClose={()=>setAdding(null)}
                    />
                )}
                {editing && schedule && (
                    <SlotModal
                        mode="edit"
                        scheduleId={schedule.id}
                        users={workers}
                        defaultUserId={editing.user_id}
                        startTimeLocal={editing.start_at_local}
                        jobTemplates={options.job_templates}
                        shift={options.shifts.find(s=>s.id===filters.shift_id)!}
                        slot={editing}
                        onClose={()=>setEditing(null)}
                    />
                )}
            </div>
        </AppLayout>
    )
}

function SlotModal(props: {
    mode: 'add' | 'edit'
    scheduleId:number
    users: Worker[]
    defaultUserId:number
    startTimeLocal:string // "YYYY-MM-DD HH:mm"
    jobTemplates: JobTemplate[]
    shift: Shift
    slot?: Slot
    onClose: ()=>void
}) {
    const { mode, scheduleId, users, defaultUserId, startTimeLocal, jobTemplates, shift, slot, onClose } = props
    const form = useForm({
        schedule_id: scheduleId,
        user_id: slot?.user_id ?? defaultUserId,
        job_template_id: slot?.job_template_id ?? jobTemplates[0]?.id ?? '',
        start_at: slot?.start_at_local ?? startTimeLocal,
        duration_minutes: slot?.duration ?? 30,
        notes: slot?.notes ?? '',
    })

    // compute allowed minutes so slot stays within shift
    const allowedMinutes = (() => {
        const [date, hm] = form.data.start_at.split(' ')
        const s = new Date(`${date}T${hm}:00`)
        const end = shiftEndAsDate(date, shift.start, shift.end)
        return Math.max(0, Math.round((end.getTime() - s.getTime()) / 60000))
    })()

    const durations = DURATIONS.filter(m => m <= allowedMinutes)

    function submit(e: React.FormEvent) {
        e.preventDefault()
        const action = mode === 'add'
            ? form.post
            : form.put

        action(`/manager/schedule/slots${mode === 'edit' && slot ? `/${slot.id}` : ''}`, {
            preserveScroll: true,
            onSuccess: onClose,
        })
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <div className="w-full max-w-xl rounded bg-white p-6">
                <h2 className="mb-4 text-lg font-semibold">{mode === 'add' ? 'Add slot' : 'Edit slot'}</h2>

                <form onSubmit={submit} className="grid gap-3">
                    <div className="grid md:grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm">Worker</label>
                            <select className="mt-1 w-full rounded border p-2"
                                    value={form.data.user_id}
                                    onChange={e=>form.setData('user_id', Number(e.target.value))}>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                            {form.errors.user_id && <p className="text-sm text-red-600 mt-1">{form.errors.user_id}</p>}
                        </div>
                        <div>
                            <label className="block text-sm">Job</label>
                            <select className="mt-1 w-full rounded border p-2"
                                    value={form.data.job_template_id}
                                    onChange={e=>form.setData('job_template_id', Number(e.target.value))}>
                                {jobTemplates.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                            </select>
                            {form.errors.job_template_id && <p className="text-sm text-red-600 mt-1">{form.errors.job_template_id}</p>}
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                            <label className="block text-sm">Start (local)</label>
                            <input className="mt-1 w-full rounded border p-2"
                                   value={form.data.start_at}
                                   onChange={e=>form.setData('start_at', e.target.value)} />
                            <p className="text-xs text-muted-foreground mt-1">Format: YYYY-MM-DD HH:mm (Europe/Sarajevo)</p>
                            {form.errors.start_at && <p className="text-sm text-red-600 mt-1">{form.errors.start_at}</p>}
                        </div>
                        <div>
                            <label className="block text-sm">Duration</label>
                            <select className="mt-1 w-full rounded border p-2"
                                    value={form.data.duration_minutes}
                                    onChange={e=>form.setData('duration_minutes', Number(e.target.value))}>
                                {durations.map(m => <option key={m} value={m}>{labelMinutes(m)}</option>)}
                            </select>
                            {form.errors.duration_minutes && <p className="text-sm text-red-600 mt-1">{form.errors.duration_minutes}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm">Notes (optional)</label>
                        <textarea className="mt-1 w-full rounded border p-2" rows={3}
                                  value={form.data.notes} onChange={e=>form.setData('notes', e.target.value)} />
                    </div>

                    <div className="flex justify-between gap-2 flex-wrap items-center">
                        {mode === 'edit' && slot && (
                            <button
                                type="button"
                                className="rounded border px-4 py-2 text-red-600 border-red-300"
                                onClick={()=>{
                                    if (!confirm('Delete this slot?')) return
                                    router.delete(`/manager/schedule/slots/${slot.id}`, {
                                        preserveScroll: true,
                                        onSuccess: onClose,
                                    })
                                }}
                            >
                                Delete
                            </button>
                        )}

                        <div className="flex justify-end gap-2 ml-auto">
                            <button type="button" className="rounded border px-4 py-2" onClick={onClose}>Cancel</button>
                            <button disabled={form.processing} className="rounded bg-black px-4 py-2 text-white disabled:opacity-50">
                                {form.processing ? 'Saving...' : 'Save slot'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    )
}

function labelMinutes(m:number){
    return m < 60 ? `${m} min` : `${Math.floor(m/60)}h${m%60?` ${m%60}m`:''}`
}

function shiftEndAsDate(date:string, startHHMM:string, endHHMM:string){
    const s = new Date(`${date}T${startHHMM}:00`)
    let e = new Date(`${date}T${endHHMM}:00`)
    if (e <= s) e = new Date(e.getTime() + 24*60*60000) // overnight
    return e
}
