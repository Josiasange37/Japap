import { Navigate, Outlet } from 'react-router-dom';

export default function RequireOnboarding() {
    const hasOnboarded = localStorage.getItem('japap_onboarded') === 'true';

    if (!hasOnboarded) {
        return <Navigate to="/onboarding" replace />;
    }

    return <Outlet />;
}
