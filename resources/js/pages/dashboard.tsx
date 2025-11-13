import { PlaceholderPattern } from '@/components/ui/placeholder-pattern'
import AppLayout from '@/layouts/app-layout'
import { dashboard } from '@/routes'
import { departments } from '@/routes/supervisor'
import { type BreadcrumbItem } from '@/types'
import { Head, Link } from '@inertiajs/react'
import { Building2 } from 'lucide-react'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: dashboard().url },
]

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {/* Departments card (links to supervisor/departments) */}
                    <Link
                        href={departments().url}
                        className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border hover:border-foreground/30 transition-colors"
                    >
                        <div className="absolute inset-0 p-4 flex flex-col">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Building2 className="size-4" />
                                <span>Departments</span>
                            </div>
                            <div className="mt-auto">
                                <div className="text-3xl font-semibold leading-none">Open</div>
                                <div className="text-xs text-muted-foreground">Manage & create</div>
                            </div>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </Link>

                    {/* Your original two placeholders */}
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                    <div className="relative aspect-video overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                    </div>
                </div>

                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    )
}
