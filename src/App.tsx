import { BrowserRouter } from 'react-router-dom';
import AppLayout from './app/layout/AppLayout';
import AppRoutes from './app/routes/AppRoutes';
import { ToastProvider } from './shared/components/ToastProvider';
import { PermissionProvider } from './shared/components/PermissionProvider';
import BackendErrorHandler from './shared/components/BackendErrorHandler';

export default function App() {
    return (
        <BrowserRouter>
            <PermissionProvider>
                <ToastProvider>
                    <AppLayout>
                        <AppRoutes />
                    </AppLayout>
                    <BackendErrorHandler />
                </ToastProvider>
            </PermissionProvider>
        </BrowserRouter>
    );
}
