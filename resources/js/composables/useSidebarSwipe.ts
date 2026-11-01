import { onBeforeUnmount, onMounted } from 'vue';
import { useSidebar } from '@/components/ui/sidebar';

const minimumDistance = 60;
const maximumDuration = 600;

type SwipeStart = { x: number; y: number; time: number };

/**
 * Whether the touch began on something that handles horizontal gestures on its own,
 * like a text field or a horizontally scrollable table.
 */
function startsOnHorizontalControl(target: EventTarget | null): boolean {
    let element = target instanceof Element ? target : null;

    while (element && element !== document.body) {
        if (
            element.matches(
                'input, textarea, select, [contenteditable="true"], [data-swipe-ignore]',
            )
        ) {
            return true;
        }

        const overflowX = getComputedStyle(element).overflowX;

        if (
            (overflowX === 'auto' || overflowX === 'scroll') &&
            element.scrollWidth > element.clientWidth
        ) {
            return true;
        }

        element = element.parentElement;
    }

    return false;
}

/**
 * On mobile, a swipe to the right opens the sidebar and a swipe to the left closes it.
 * Must be called inside the SidebarProvider.
 */
export function useSidebarSwipe(): void {
    const { isMobile, openMobile, setOpenMobile } = useSidebar();
    let start: SwipeStart | null = null;

    function onTouchStart(event: TouchEvent): void {
        start = null;

        if (
            !isMobile.value ||
            event.touches.length !== 1 ||
            startsOnHorizontalControl(event.target)
        ) {
            return;
        }

        // Leave other open dialogs alone; the open sidebar is itself a dialog, so it still closes on swipe.
        if (!openMobile.value && document.querySelector('[role="dialog"]')) {
            return;
        }

        const touch = event.touches[0];
        start = { x: touch.clientX, y: touch.clientY, time: Date.now() };
    }

    function onTouchEnd(event: TouchEvent): void {
        if (!start) {
            return;
        }

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - start.x;
        const deltaY = touch.clientY - start.y;
        const isQuickHorizontalSwipe =
            Math.abs(deltaX) >= minimumDistance &&
            Math.abs(deltaX) > Math.abs(deltaY) * 2 &&
            Date.now() - start.time <= maximumDuration;

        start = null;

        if (!isQuickHorizontalSwipe) {
            return;
        }

        if (deltaX > 0 && !openMobile.value) {
            setOpenMobile(true);
        } else if (deltaX < 0 && openMobile.value) {
            setOpenMobile(false);
        }
    }

    onMounted(() => {
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchend', onTouchEnd, { passive: true });
    });

    onBeforeUnmount(() => {
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchend', onTouchEnd);
    });
}
