import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function RequireOnboarding() {
    const { user } = useApp();
    const hasOnboarded = user?.onboarded && user?.pseudo;

    if (!hasOnboarded) {
        return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
}
