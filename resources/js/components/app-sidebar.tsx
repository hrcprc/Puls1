import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { departments } from '@/routes/supervisor';
import { index as supervisorUsersIndex } from '@/routes/supervisor/users';
import { index as managerJobTypesIndex } from '@/routes/manager/job-types';
import { index as managerJobTemplatesIndex } from '@/routes/manager/job-templates';
import { index as managerScheduleIndex } from '@/routes/manager/schedule';
import { index as managerTasksIndex } from '@/routes/manager/tasks';
import { index as managerShiftsIndex } from '@/routes/manager/shifts';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Departments',
        href:  departments(),
        icon: LayoutGrid,
    },
    {
        title: 'Locations',
        href: '/supervisor/locations',
        icon: LayoutGrid,
    },
    {
        title: 'Users',
        href:  supervisorUsersIndex(),
        icon: LayoutGrid,
    },
    {
        title: 'Job Types',
        href:  managerJobTypesIndex(),
        icon: LayoutGrid,
    },
    {
        title: 'Job Templates',
        href:  managerJobTemplatesIndex(),
        icon: LayoutGrid,
    },
    {
        title: 'Shifts',
        href:  managerShiftsIndex(),
        icon: LayoutGrid,
    },
    {
        title: 'Schedule',
        href:  managerScheduleIndex(),
        icon: LayoutGrid,
    },
    {
        title: 'Tasks',
        href:  managerTasksIndex(),
        icon: LayoutGrid,
    }
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
