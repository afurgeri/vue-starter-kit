<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3';
import { computed } from 'vue';
import AppLogo from '@/components/AppLogo.vue';
import NavFooter from '@/components/NavFooter.vue';
import NavMain from '@/components/NavMain.vue';
import NavUser from '@/components/NavUser.vue';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from '@/components/ui/sidebar';
import { useSidebarSwipe } from '@/composables/useSidebarSwipe';
import { useTranslation } from '@/composables/useTranslation';
import { footerNavigationItems, navigationGroups } from '@/navigation';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const { t } = useTranslation();
const page = usePage();
const { isMobile, setOpenMobile } = useSidebar();

useSidebarSwipe();

function closeMobileSidebar(): void {
    if (isMobile.value) {
        setOpenMobile(false);
    }
}

/**
 * Items without a permission are always shown; the rest need it in auth.permissions.
 */
function isAllowed(item: NavItem): boolean {
    const permissions = (page.props.auth as { permissions?: string[] })
        .permissions;

    return !item.permission || (permissions ?? []).includes(item.permission);
}

const visibleNavGroups = computed(() =>
    navigationGroups(t)
        .map((group) => ({ ...group, items: group.items.filter(isAllowed) }))
        .filter((group) => group.items.length > 0),
);

const visibleFooterNavItems = computed(() =>
    footerNavigationItems(t).filter(isAllowed),
);
</script>

<template>
    <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton size="lg" as-child>
                        <Link :href="dashboard()" @click="closeMobileSidebar">
                            <AppLogo />
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
            <NavMain :groups="visibleNavGroups" />
        </SidebarContent>

        <SidebarFooter>
            <NavFooter :items="visibleFooterNavItems" />
            <NavUser />
        </SidebarFooter>
    </Sidebar>
    <slot />
</template>
