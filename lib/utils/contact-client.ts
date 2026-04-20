export interface ContactDetail {
  id: string;
  type: string;
  value: string;
  order_position: number;
}

export interface ContactGroupSummary {
  id: string;
  label: string;
  in_hero: boolean;
  in_footer: boolean;
  contact_details: ContactDetail[];
}

export interface ContactInfoResult {
  phone: string | null;
  phoneLabel: string | null;
  email: string | null;
  address: string | null;
  hours: string | null;
  contactGroups: ContactGroupSummary[];
}

export async function fetchContactInfo(): Promise<ContactInfoResult> {
  const response = await fetch('/api/contact_groups', {
    cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch contact groups: ${response.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allGroups: any[] = await response.json();

  const result: ContactInfoResult = {
    phone: null,
    phoneLabel: null,
    email: null,
    address: null,
    hours: null,
    contactGroups: allGroups.map(group => ({
      id: group.id,
      label: group.label,
      in_hero: group.in_hero,
      in_footer: group.in_footer,
      contact_details: Array.isArray(group.contact_details)
        ? [...group.contact_details]
            .sort((a, b) => a.order_position - b.order_position)
            .map(d => ({
              id: d.id,
              type: d.type,
              value: d.value,
              order_position: d.order_position,
            }))
        : [],
    })),
  };

  // Derive convenience fields from groups
  const heroPhoneGroup = result.contactGroups.find(
    g => g.in_hero && g.contact_details.some(d => d.type === 'phone')
  );
  if (heroPhoneGroup) {
    const phone = heroPhoneGroup.contact_details.find(d => d.type === 'phone');
    if (phone) {
      result.phone = phone.value;
      result.phoneLabel = heroPhoneGroup.label;
    }
  }

  const emailGroup = result.contactGroups.find(
    g => (g.in_hero || g.in_footer) && g.contact_details.some(d => d.type === 'email')
  );
  if (emailGroup) {
    const email = emailGroup.contact_details.find(d => d.type === 'email');
    if (email) result.email = email.value;
  }

  const addressGroup = result.contactGroups.find(
    g => (g.in_hero || g.in_footer) && g.contact_details.some(d => d.type === 'address')
  );
  if (addressGroup) {
    const address = addressGroup.contact_details.find(d => d.type === 'address');
    if (address) result.address = address.value;
  }

  const hoursGroup = result.contactGroups.find(
    g => g.in_hero && g.contact_details.some(d => d.type === 'hours')
  );
  if (hoursGroup) {
    const hours = hoursGroup.contact_details.find(d => d.type === 'hours');
    if (hours) result.hours = hours.value;
  }

  return result;
}
