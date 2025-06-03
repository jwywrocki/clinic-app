import { createSupabaseClient } from './supabase-client';

export async function getPageBySlug(slug: string) {
    try {
        const supabase = createSupabaseClient();

        if (!supabase) {
            console.warn('Supabase not configured');
            return null;
        }

        const { data, error } = await supabase.from('pages').select('*').eq('slug', slug).eq('is_published', true).maybeSingle();

        if (error) {
            console.error('Error fetching page by slug:', error);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Error in getPageBySlug:', error);
        return null;
    }
}

export async function getFormattedContactInfo(): Promise<{
    phone: string | null;
    phoneLabel: string | null;
    email: string | null;
    address: string | null;
    hours: string | null;
    contactGroups: Array<{
        id: string;
        label: string;
        featured: boolean;
        contact_details: Array<{
            id: string;
            type: string;
            value: string;
        }>;
    }> | null;
} | null> {
    try {
        const supabase = createSupabaseClient();

        if (!supabase) {
            console.warn('Supabase not configured');
            return null;
        }

        const { data: allGroups, error: groupError } = await supabase
            .from('contact_groups')
            .select(
                `
                id,
                label,
                featured,
                contact_details (id, type, value)
            `
            )
            .order('created_at', { ascending: true });

        if (groupError) {
            console.error('Error fetching contact groups:', groupError);
            return null;
        }

        const contactInfo: {
            phone: string | null;
            phoneLabel: string | null;
            email: string | null;
            address: string | null;
            hours: string | null;
            contactGroups: Array<{
                id: string;
                label: string;
                featured: boolean;
                contact_details: Array<{
                    id: string;
                    type: string;
                    value: string;
                }>;
            }>;
        } = {
            phone: null,
            phoneLabel: null,
            email: null,
            address: null,
            hours: null,
            contactGroups: [],
        };

        if (allGroups && allGroups.length > 0) {
            contactInfo.contactGroups = allGroups.map((group) => ({
                id: group.id,
                label: group.label,
                featured: group.featured,
                contact_details: group.contact_details
                    ? group.contact_details.map((detail) => ({
                          id: detail.id,
                          type: detail.type,
                          value: detail.value,
                      }))
                    : [],
            }));

            // Optionally, populate the top-level convenience fields (phone, email, etc.)
            // from the first featured group that has them, if this is still desired.
            const firstFeaturedPhoneGroup = allGroups.find((g) => g.featured && g.contact_details?.some((d) => d.type === 'phone'));
            if (firstFeaturedPhoneGroup) {
                const phoneDetail = firstFeaturedPhoneGroup.contact_details.find((d) => d.type === 'phone');
                if (phoneDetail) {
                    contactInfo.phone = phoneDetail.value;
                    contactInfo.phoneLabel = firstFeaturedPhoneGroup.label;
                }
            }

            const firstFeaturedEmailGroup = allGroups.find((g) => g.featured && g.contact_details?.some((d) => d.type === 'email'));
            if (firstFeaturedEmailGroup) {
                const emailDetail = firstFeaturedEmailGroup.contact_details.find((d) => d.type === 'email');
                if (emailDetail) {
                    contactInfo.email = emailDetail.value;
                }
            }

            const firstFeaturedAddressGroup = allGroups.find((g) => g.featured && g.contact_details?.some((d) => d.type === 'address'));
            if (firstFeaturedAddressGroup) {
                const addressDetail = firstFeaturedAddressGroup.contact_details.find((d) => d.type === 'address');
                if (addressDetail) {
                    contactInfo.address = addressDetail.value;
                }
            }

            const firstFeaturedHoursGroup = allGroups.find((g) => g.featured && g.contact_details?.some((d) => d.type === 'hours'));
            if (firstFeaturedHoursGroup) {
                const hoursDetail = firstFeaturedHoursGroup.contact_details.find((d) => d.type === 'hours');
                if (hoursDetail) {
                    contactInfo.hours = hoursDetail.value;
                }
            }
        }

        return contactInfo;
    } catch (error) {
        console.error('Error in getFormattedContactInfo:', error);
        return null;
    }
}

export async function getServices() {
    try {
        const supabase = createSupabaseClient();

        if (!supabase) {
            console.warn('Supabase not configured');
            return null;
        }

        const { data, error } = await supabase.from('services').select('*').order('created_at');

        if (error) {
            throw error;
        }

        return data && data.length > 0 ? data : [];
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
}

export async function getDoctors() {
    try {
        const supabase = createSupabaseClient();

        if (!supabase) {
            console.warn('Supabase not configured');
            return null;
        }

        const { data, error } = await supabase.from('doctors').select('*').eq('is_active', true).order('last_name');

        if (error) {
            throw error;
        }

        return data && data.length > 0 ? data : [];
    } catch (error) {
        console.error('Error fetching doctors:', error);
        return [];
    }
}

export async function getNews() {
    try {
        const supabase = createSupabaseClient();

        if (!supabase) {
            console.warn('Supabase not configured');
            return null;
        }

        const { data, error } = await supabase.from('news').select('*').eq('is_published', true).order('created_at', { ascending: false });

        if (error) {
            throw error;
        }

        return data && data.length > 0 ? data : [];
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
}
