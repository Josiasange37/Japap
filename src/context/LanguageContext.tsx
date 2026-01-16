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
        'nav.trending': 'Tendances',
        'nav.notifications': 'Actualités',
        'nav.profile': 'Mon Coin',
        'nav.create': 'Créer',
        // Home
        'home.title': 'Histoires du Jour',
        'home.subtitle': 'Directement de la communauté',
        'home.latest': 'Les dernières histoires',
        'home.empty.title': 'La communauté est calme...',
        'home.empty.desc': 'Aucune histoire pour le moment. Soyez le premier à partager',
        'home.loading': 'Patienter pour le nouveau japap du moment...',
        // Trending
        'trending.title': 'Histoires Populaires',
        'trending.subtitle': 'Ce que la communauté partage',
        'trending.search': 'Chercher des histoires, tags ou aliases...',
        'trending.viral': 'Populaire en ce moment',
        'trending.empty': 'Rien de populaire.\nSoyez celui qui lance la tendance',
        'trending.hot': 'POPULAIRE',
        'trending.scoops': 'HISTOIRES',
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
        'create.page.title': 'Partager une Histoire',
        'create.page.subtitle': 'Quelle est votre histoire aujourd\'hui',
        'create.page.guidelines': 'Règles de la Communauté',
        'create.page.tip1.title': 'Anonymat optionnel',
        'create.page.tip1.desc': 'Activez l\'anonymat pour cacher votre pseudo.',
        'create.page.tip2.title': 'Restez Populaire',
        'create.page.tip2.desc': 'Les histoires avec engagement restent plus longtemps.',
        'create.page.tip3.title': 'Soyez Rapide',
        'create.page.tip3.desc': 'Les nouvelles histoires boostent votre visibilité.',
        'create.page.tip4.title': 'Contenu Authentique',
        'create.page.tip4.desc': 'Gardez cela réel, intéressant et authentique.',
        // Create Component
        'create.title': 'Raconter votre histoire',
        'create.placeholder': 'Quelle est votre histoire aujourd\'hui',
        'create.anonymous': 'Anonyme',
        'create.pseudo': 'Mon Pseudo',
        'create.button': 'PUBLIER L\'HISTOIRE',
        'create.posting': 'Publication...',
        'create.success': 'Publié avec succès',
        // Profile
        'profile.scoops': 'Mes Histoires',
        'profile.likes': 'Histoires Aimées',
        'profile.stats.scoops': 'Histoires',
        'profile.stats.clarity': 'Engagement',
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
        'onboarding.welcome.desc': 'Partagez des histoires et connectez-vous avec votre communauté. Espace sûr et respectueux.',
        'onboarding.welcome.button': 'COMMENCER',
        'onboarding.policy.title': 'Principes de la',
        'onboarding.policy.subtitle': 'Communauté',
        'onboarding.policy.1.title': 'Respect de la vie privée',
        'onboarding.policy.1.desc': 'Nous protégeons votre identité. Votre vie privée est notre priorité.',
        'onboarding.policy.2.title': 'Communauté Positive',
        'onboarding.policy.2.desc': 'Respectez les autres. Pas de haine ou harcèlement, seulement des histoires constructives.',
        'onboarding.policy.3.title': 'Histoires Temporaires',
        'onboarding.policy.3.desc': 'Les histoires disparaissent après 7 jours. Créez du contenu qui a un impact.',
        'onboarding.policy.button': 'ACCEPTER LES PRINCIPES',
        'onboarding.profile.title': 'Créez votre',
        'onboarding.profile.subtitle': 'Alias',
        'onboarding.profile.label': 'VOTRE PSEUDONYME',
        'onboarding.profile.bioLabel': 'VOTRE BIO (OPTIONNEL)',
        'onboarding.profile.bioPlaceholder': 'Racontez-nous un peu sur vous...',
        'onboarding.profile.button': 'TERMINER LA CONFIG',
        'onboarding.error.pseudoTaken': 'Ce pseudo est déjà pris, wanda !',
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
        'home.loading': 'Waiting for the latest scoop...',
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
        'create.page.title': 'Share Your Story',
        'create.page.subtitle': 'What\'s your story today',
        'create.page.guidelines': 'Community Guidelines',
        'create.page.tip1.title': 'Optional Anonymity',
        'create.page.tip1.desc': 'Toggle anonymous to hide your identity.',
        'create.page.tip2.title': 'Stay Engaging',
        'create.page.tip2.desc': 'High engagement stories stay visible longer.',
        'create.page.tip3.title': 'Be Timely',
        'create.page.tip3.desc': 'New stories get better visibility initially.',
        'create.page.tip4.title': 'Authentic Content',
        'create.page.tip4.desc': 'Keep it real, interesting, and authentic.',
        // Create Component
        'create.title': 'Tell Your Story',
        'create.placeholder': 'What\'s your story today',
        'create.anonymous': 'Anonymous',
        'create.pseudo': 'My Pseudo',
        'create.button': 'PUBLISH STORY',
        'create.posting': 'Publishing...',
        'create.success': 'Story published',
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
        'onboarding.welcome.desc': 'Share stories, connect with your community. Safe space, positive environment.',
        'onboarding.welcome.button': 'GET STARTED',
        'onboarding.policy.title': 'Community',
        'onboarding.policy.subtitle': 'Principles',
        'onboarding.policy.1.title': 'Privacy First',
        'onboarding.policy.1.desc': 'We protect your identity. Your privacy is our priority.',
        'onboarding.policy.2.title': 'Positive Community',
        'onboarding.policy.2.desc': 'Respect others. No hate or harassment, only constructive stories.',
        'onboarding.policy.3.title': 'Temporary Stories',
        'onboarding.policy.3.desc': 'Stories disappear after 7 days. Create content that matters.',
        'onboarding.policy.button': 'I UNDERSTAND AND AGREE',
        'onboarding.profile.title': 'Create your',
        'onboarding.profile.subtitle': 'Alias',
        'onboarding.profile.label': 'SCOOP PSEUDONYM',
        'onboarding.profile.bioLabel': 'YOUR BIO (OPTIONAL)',
        'onboarding.profile.bioPlaceholder': 'Tell us a bit about yourself...',
        'onboarding.profile.button': 'COMPLETE SETUP',
        'onboarding.error.pseudoTaken': 'This pseudo is already taken!',
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
