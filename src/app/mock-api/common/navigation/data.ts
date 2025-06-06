/* eslint-disable */
import { FuseNavigationItem } from '@fuse/components/navigation';

export const defaultNavigation: FuseNavigationItem[] = [
    {
        id   : 'resumen',
        title: 'Resumen',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    },
    {
        id: 'tablas',
        title: 'Tablas',
        type: 'group',
        icon: 'heroicons_outline:home',
        children: [
            {
                id: 'tablas.services',
                title: 'Servicios',
                type: 'basic',
                icon: 'heroicons_outline:clipboard-document-check',
                link: '/tablas/servicios',
            },
            {
                id: 'tablas.pets',
                title: 'Mascotas',
                type: 'basic',
                icon: 'heroicons_outline:clipboard-document-check',
                link: '/tablas/mascotas',
            },
            {
                id: 'tablas.customers',
                title: 'Clientes',
                type: 'basic',
                icon: 'heroicons_outline:clipboard-document-check',
                link: '/tablas/clientes',
            },
        ],
    },
];
export const compactNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const futuristicNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
export const horizontalNavigation: FuseNavigationItem[] = [
    {
        id   : 'example',
        title: 'Example',
        type : 'basic',
        icon : 'heroicons_outline:chart-pie',
        link : '/example'
    }
];
