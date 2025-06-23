import { createSupabaseClient } from './supabase';

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
        in_hero: boolean;
        in_footer: boolean;
        contact_details: Array<{
            id: string;
            type: string;
            value: string;
            order_position: number;
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
                in_hero,
                in_footer,
                contact_details (id, type, value, order_position)
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
                in_hero: boolean;
                in_footer: boolean;
                contact_details: Array<{
                    id: string;
                    type: string;
                    value: string;
                    order_position: number;
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
                in_hero: group.in_hero,
                in_footer: group.in_footer,
                contact_details: group.contact_details
                    ? group.contact_details
                          .sort((a, b) => a.order_position - b.order_position)
                          .map((detail) => ({
                              id: detail.id,
                              type: detail.type,
                              value: detail.value,
                              order_position: detail.order_position,
                          }))
                    : [],
            }));

            const firstHeroPhoneGroup = allGroups.find((g) => g.in_hero && g.contact_details?.some((d) => d.type === 'phone'));
            if (firstHeroPhoneGroup) {
                const phoneDetails = firstHeroPhoneGroup.contact_details.filter((d) => d.type === 'phone').sort((a, b) => a.order_position - b.order_position);
                if (phoneDetails.length > 0) {
                    contactInfo.phone = phoneDetails[0].value;
                    contactInfo.phoneLabel = firstHeroPhoneGroup.label;
                }
            }

            const firstEmailGroup = allGroups.find((g) => (g.in_hero || g.in_footer) && g.contact_details?.some((d) => d.type === 'email'));
            if (firstEmailGroup) {
                const emailDetail = firstEmailGroup.contact_details.find((d) => d.type === 'email');
                if (emailDetail) {
                    contactInfo.email = emailDetail.value;
                }
            }

            const firstAddressGroup = allGroups.find((g) => (g.in_hero || g.in_footer) && g.contact_details?.some((d) => d.type === 'address'));
            if (firstAddressGroup) {
                const addressDetail = firstAddressGroup.contact_details.find((d) => d.type === 'address');
                if (addressDetail) {
                    contactInfo.address = addressDetail.value;
                }
            }

            const firstHeroHoursGroup = allGroups.find((g) => g.in_hero && g.contact_details?.some((d) => d.type === 'hours'));
            if (firstHeroHoursGroup) {
                const hoursDetail = firstHeroHoursGroup.contact_details.find((d) => d.type === 'hours');
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
