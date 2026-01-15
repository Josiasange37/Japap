import { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';

export function usePeriodicNotification() {
    const { t } = useLanguage();

    useEffect(() => {
        // Request permission on mount
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }

        const intervalId = setInterval(() => {
            if (Notification.permission === 'granted') {
                new Notification('JAPAP', {
                    body: "🔥 Le kongosa chauffe ! Viens voir ce qui se passe.",
                    icon: '/pwa-192x192.png' // Assuming this exists or similar
                });
            }
        }, 45 * 60 * 1000); // 45 minutes

        return () => clearInterval(intervalId);
    }, [t]);
}
