import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// El base path coincide con el nombre del repo para GitHub Pages.
// En dev se usa "/" automáticamente.
export default defineConfig(function (_a) {
    var command = _a.command;
    return ({
        base: command === 'build' ? '/ticketera-demo/' : '/',
        plugins: [react()],
        server: {
            port: 5173,
            open: true,
        },
    });
});
