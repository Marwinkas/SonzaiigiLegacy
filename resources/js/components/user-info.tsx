import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { SharedData, type User } from '@/types';
import { usePage } from '@inertiajs/react';
export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    const getInitials = useInitials();
    const { auth } = usePage<SharedData>().props;
    return (
        <>
            {auth.user && <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={"http://sonzaiigi.art/" + user.photo} alt={user.name} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.name)}
                </AvatarFallback>
            </Avatar>}
            {auth.user && <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                {showEmail && <span className="text-muted-foreground truncate text-xs">{user.email}</span>}
            </div>}
        </>
    );
}
