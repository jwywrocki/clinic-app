interface MenuItem {
    id: string;
    title: string;
    url: string | null;
    order_position: number;
    parent_id?: string | null;
}

interface ContactInfo {
    phone: string;
    email: string;
    address: string;
    hours: string;
    emergency_contact?: string;
}

// Global cache variables
let menuCache: MenuItem[] | null = null;
let contactCache: ContactInfo | null = null;
let cacheTimestamp = 0;

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const MenuCache = {
    // Get cached menu data
    getMenu: (): MenuItem[] | null => {
        const now = Date.now();
        if (menuCache && now - cacheTimestamp < CACHE_DURATION) {
            return menuCache;
        }
        return null;
    },

    // Get cached contact data
    getContact: (): ContactInfo | null => {
        const now = Date.now();
        if (contactCache && now - cacheTimestamp < CACHE_DURATION) {
            return contactCache;
        }
        return null;
    },

    // Set cache data
    setCache: (menu: MenuItem[], contact: ContactInfo | null) => {
        menuCache = menu;
        contactCache = contact;
        cacheTimestamp = Date.now();
    },

    // Clear cache (useful when menu is updated in admin panel)
    clearCache: () => {
        menuCache = null;
        contactCache = null;
        cacheTimestamp = 0;
    },

    // Check if cache is valid
    isValid: (): boolean => {
        const now = Date.now();
        return menuCache !== null && now - cacheTimestamp < CACHE_DURATION;
    },
};
