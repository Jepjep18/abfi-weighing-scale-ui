/* tslint:disable:max-line-length */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },
    {
        id: 'example',
        title: 'Example',
        type: 'basic',
        icon: 'heroicons_outline:chart-pie',
        link: '/example',
    },
];

export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id: 'dashboard',
        title: 'Dashboard',
        type: 'basic',
        icon: 'heroicons_outline:home',
        link: '/dashboard',
    },
    {
        id: 'trip-sheet',
        title: 'Trip Sheet',
        type: 'collapsable',
        icon: 'heroicons_outline:document-text',
        children: [
            {
                id: 'trip-sheet.create-production',
                title: 'Create Production',
                type: 'basic',
                icon: 'heroicons_outline:plus-circle',
                link: '/trip-sheet/create-production',
            },
        ],
    },
    {
        id: 'weighing-scale',
        title: 'Weighing Scale',
        type: 'basic',
        icon: 'heroicons_outline:scale',
        link: '/weighing-scale',
    },
    {
        id: 'booking',
        title: 'Booking',
        type: 'basic',
        icon: 'heroicons_outline:calendar',
        link: '/booking',
    },
];

