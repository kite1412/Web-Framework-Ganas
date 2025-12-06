import '../css/app.css';
import './bootstrap';

import { createInertiaApp, Head } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Semi Tugas';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        // Support nested names like 'Auth/Login' by falling back to basename
        const pages = import.meta.glob('./Pages/**/*.jsx');
        const directPath = `./Pages/${name}.jsx`;
        if (pages[directPath]) {
            return pages[directPath]().then((module) => module.default);
        }
        const baseName = name.split('/').pop();
        const altPath = `./Pages/${baseName}.jsx`;
        if (pages[altPath]) {
            return pages[altPath]().then((module) => module.default);
        }
        // Fallback to default resolver to preserve error semantics
        return resolvePageComponent(`./Pages/${name}.jsx`, pages);
    },
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: { color: '#4B5563' },
});
