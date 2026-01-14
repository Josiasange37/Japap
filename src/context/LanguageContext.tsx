import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    fr: {
        // Nav
        'nav.home': 'Accueil',
        'nav.trending': 'Ça Cuit',
        'nav.notifications': 'Kongosa',
        'nav.profile': 'Mon Coin',
        'nav.create': 'Japaper',
        // Home
        'home.title': 'Le Japap du Jour',
        'home.subtitle': 'Directement du mboa',
        'home.latest': 'Les derniers way',
        'home.empty.title': 'Le quartier est calme...',
        'home.empty.desc': 'Zéro kongosa pour le moment. Soyez le premier à verser le thé',
        // Trending
        'trending.title': 'Le kongosa du moment',
        'trending.subtitle': 'Ce que tout le monde chuchote',
        'trending.search': 'Chercher des scoops, tags ou aliases...',
        'trending.viral': 'Viral en ce moment',
        'trending.empty': 'Rien ne cuit encore.\nSois celui qui lance la tendance',
        'trending.hot': 'CHAUD',
        'trending.scoops': 'JAPAPS',
        // Notifications
        'notifications.title': 'Activité',
        'notifications.subtitle': 'Alertes & tendances en temps réel',
        'notifications.empty': 'Pas encore de notifications. Garde l\'œil ouvert',
        'notifications.trending.title': 'Ça cuit',
        'notifications.trending.desc': 'Le scoop sur "{name}" devient viral.',
        'notifications.new.title': 'Nouveau Scoop',
        'notifications.new.desc': 'Quelqu\'un vient de verser le thé sur "{name}".',
        'notifications.like.title': 'Nouvelle Réaction',
        'notifications.like.desc': '{name} a aimé ton scoop.',
        'notifications.comment.title': 'Nouveau Commentaire',
        'notifications.comment.desc': '{name} a commenté ton scoop.',
        // Create Page
        'create.page.title': 'Lancer un Scoop',
        'create.page.subtitle': 'Quel est le thé aujourd\'hui',
        'create.page.guidelines': 'Règles du Kongosa',
        'create.page.tip1.title': 'Anonymat d\'abord',
        'create.page.tip1.desc': 'Active l\'anonymat pour cacher ton pseudo.',
        'create.page.tip2.title': 'Reste en Tendance',
        'create.page.tip2.desc': 'Les scoops avec d\'engagement restent plus longtemps.',
        'create.page.tip3.title': 'Sois Rapide',
        'create.page.tip3.desc': 'Les nouveaux scoops boostent ta visibilité.',
        'create.page.tip4.title': 'Thé Pur',
        'create.page.tip4.desc': 'Garde ça réel, piquant et Japap.',
        // Create Component
        'create.title': 'Taper le Kongosa',
        'create.placeholder': 'Quel est le thé aujourd\'hui',
        'create.anonymous': 'Anonyme',
        'create.pseudo': 'Mon Pseudo',
        'create.button': 'POSTER LE JAPAP',
        'create.posting': 'Publication...',
        'create.success': 'Posté avec succès',
        // Profile
        'profile.scoops': 'Mes Japaps',
        'profile.likes': 'Le kongosa du moment',
        'profile.stats.scoops': 'Kongosa',
        'profile.stats.clarity': 'Clarté',
        'profile.stats.rank': 'Rang',
        'profile.edit.bio': 'Modifier la bio',
        // PWA
        'pwa.install.title': 'Installer Japap',
        'pwa.install.desc': 'Installez Japap sur votre écran d\'accueil pour ne rien rater.',
        'pwa.install.button': 'INSTALLER',
        'pwa.install.ios': 'Appuyez sur Partager puis "Sur l\'écran d\'accueil"',
        'pwa.notify.title': 'Ne ratez rien',
        'pwa.notify.desc': 'Activez les notifications pour recevoir les alertes de kongosa.',
        'pwa.notify.button': 'ACTIVER LES KONGOSA',
        // Common
        'post.views': 'VUES',
        'post.comments': 'REACTIONS',
        'post.hot': 'CHAUD',
        'comment.thread': 'Fil de discussion',
        'comment.placeholder': 'Partagez vos pensées...',
        'comment.empty': 'Pas encore de réactions. Soyez le premier à commenter',
        // Onboarding
        'onboarding.welcome.title': 'Bienvenue sur',
        'onboarding.welcome.desc': 'Partagez les scoops et vibrez avec votre communauté. Totalement anonyme, sans restrictions.',
        'onboarding.welcome.button': 'COMMENCER',
        'onboarding.policy.title': 'La Loi du',
        'onboarding.policy.subtitle': 'Kongosa',
        'onboarding.policy.1.title': 'Furtif total',
        'onboarding.policy.1.desc': 'Nous ne savons pas qui vous êtes. Votre identité est votre secret.',
        'onboarding.policy.2.title': 'Vibe Propre',
        'onboarding.policy.2.desc': 'Respectez le mouvement. Pas de haine ou d\'insultes, juste le bon japap.',
        'onboarding.policy.3.title': 'Japaps Éphémères',
        'onboarding.policy.3.desc': 'Tout disparaît après 7 jours. Faites en sorte que ça chauffe.',
        'onboarding.policy.button': 'ACCEPTER LES RÈGLES',
        'onboarding.profile.title': 'Créez votre',
        'onboarding.profile.subtitle': 'Alias',
        'onboarding.profile.label': 'VOTRE PSEUDONYME',
        'onboarding.profile.button': 'TERMINER LA CONFIG',
    },
    en: {
        // Nav
        'nav.home': 'Home',
        'nav.trending': 'Trending',
        'nav.notifications': 'Notifications',
        'nav.profile': 'Profile',
        'nav.create': 'Create',
        // Home
        'home.title': 'Daily Tea',
        'home.subtitle': 'Live from the community',
        'home.latest': 'Latest',
        'home.empty.title': 'Silence is boring...',
        'home.empty.desc': 'No gossip has been spilled in the last 7 days. Be the first to drop a scoop',
        // Trending
        'trending.title': 'The Hottest Tea',
        'trending.subtitle': 'What the world is whispering about',
        'trending.search': 'Search for scoops, tags, or aliases...',
        'trending.viral': 'Viral Right Now',
        'trending.empty': 'Nothing is trending yet.\nBe the trendsetter',
        'trending.hot': 'HOT',
        'trending.scoops': 'SCOOPS',
        // Notifications
        'notifications.title': 'Activity',
        'notifications.subtitle': 'Real-time alerts & trends',
        'notifications.empty': 'No notifications yet. Keep an eye out',
        'notifications.trending.title': 'Trending Gossip',
        'notifications.trending.desc': 'The scoop about "{name}" is going viral.',
        'notifications.new.title': 'New Scoop Unleashed',
        'notifications.new.desc': 'Someone just spilled the tea on "{name}".',
        'notifications.like.title': 'New Reaction',
        'notifications.like.desc': '{name} liked your scoop.',
        'notifications.comment.title': 'New Comment',
        'notifications.comment.desc': '{name} commented on your scoop.',
        // Create Page
        'create.page.title': 'Unleash Scoop',
        'create.page.subtitle': 'What\'s the tea today',
        'create.page.guidelines': 'Gossip Guidelines',
        'create.page.tip1.title': 'Anonymity First',
        'create.page.tip1.desc': 'Toggle anonymous to hide your pseudo.',
        'create.page.tip2.title': 'Stay Trending',
        'create.page.tip2.desc': 'High engagement scoops stay up longer.',
        'create.page.tip3.title': 'Be Fast',
        'create.page.tip3.desc': 'New scoops get a 2x visibility boost.',
        'create.page.tip4.title': 'Pure Tea',
        'create.page.tip4.desc': 'Keep it real, keep it spicy, keep it Japap.',
        // Create Component
        'create.title': 'Drop a Scoop',
        'create.placeholder': 'What\'s the tea today',
        'create.anonymous': 'Anonymous',
        'create.pseudo': 'My Pseudo',
        'create.button': 'POST SCOOP',
        'create.posting': 'Unleashing...',
        'create.success': 'Gossip unleashed',
        // Profile
        'profile.scoops': 'My Scoops',
        'profile.likes': 'Hot Tea',
        'profile.stats.scoops': 'Scoops',
        'profile.stats.clarity': 'Clarity',
        'profile.stats.rank': 'Rank',
        'profile.edit.bio': 'Edit bio',
        // PWA
        'pwa.install.title': 'Get the Japap App',
        'pwa.install.desc': 'Install Japap on your home screen for the full premium experience.',
        'pwa.install.button': 'INSTALL NOW',
        'pwa.install.ios': 'Tap Share then "Add to Home Screen"',
        'pwa.notify.title': 'Never miss the tea',
        'pwa.notify.desc': 'Enable notifications to get real-time alerts on trending scoops.',
        'pwa.notify.button': 'ENABLE ALERTS',
        // Common
        'post.views': 'VIEWS',
        'post.comments': 'REACTIONS',
        'post.hot': 'HOT',
        'comment.thread': 'Gossip Thread',
        'comment.placeholder': 'Spill your thoughts...',
        'comment.empty': 'No reactions yet. Be the first to spill',
        // Onboarding
        'onboarding.welcome.title': 'Welcome to',
        'onboarding.welcome.desc': 'Spill the tea, share the scoops, and vibe with your community. Fully anonymous, zero restrictions.',
        'onboarding.welcome.button': 'ENTER THE FEED',
        'onboarding.policy.title': 'The Gossip',
        'onboarding.policy.subtitle': 'Code',
        'onboarding.policy.1.title': 'Stealth Mode',
        'onboarding.policy.1.desc': 'We don\'t know who you are. Your identity is your secret.',
        'onboarding.policy.2.title': 'Vibe Check',
        'onboarding.policy.2.desc': 'Respect the hustle. No hate or harassment, just pure tea.',
        'onboarding.policy.3.title': 'Ephemeral Scoops',
        'onboarding.policy.3.desc': 'Everything vanishes after 7 days. Make it count.',
        'onboarding.policy.button': 'I UNDERSTAND AND AGREE',
        'onboarding.profile.title': 'Create your',
        'onboarding.profile.subtitle': 'Alias',
        'onboarding.profile.label': 'SCOOP PSEUDONYM',
        'onboarding.profile.button': 'COMPLETE SETUP',
    }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem('japap_lang') as Language;
        return stored || 'fr';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem('japap_lang', lang);
    };

    const t = (key: string): string => {
        return translations[language][key as keyof typeof translations['en']] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
}
