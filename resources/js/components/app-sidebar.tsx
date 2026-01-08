import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavMain2 } from '@/components/nav-main2';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid } from 'lucide-react';
import AppLogo from './app-logo';
import HomeIcon from '@mui/icons-material/Home';
import MarkunreadIcon from '@mui/icons-material/Markunread';
import PeopleIcon from '@mui/icons-material/People';
import { usePage } from '@inertiajs/react';
import EditIcon from '@mui/icons-material/Edit';
import { type BreadcrumbItem, type SharedData } from '@/types';
const mainNavItems: NavItem[] = [
    {
        title: 'Главная',
        href: '/',
        icon: HomeIcon,
    },
    {
        title: 'Сообщения',
        href: '/message/1',
        icon: MarkunreadIcon,
    },
    {
        title: 'Друзья',
        href: '/friends',
        icon: PeopleIcon,
    },
];
const adminnav: NavItem[] = [
    {
        title: 'Модерация',
        href: '/admin',
        icon: EditIcon,
    },
];
const footerNavItems: NavItem[] = [
    {
        title: 'Technical support',
        href: 'https://t.me/sonzaiigi',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                {auth.user && auth.user.role == 'admin' &&
                    <NavMain2 items={adminnav} />
                }
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
