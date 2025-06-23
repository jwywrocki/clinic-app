'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { createSupabaseClient } from '@/lib/supabase';
import { MenuCache } from '@/lib/menu-cache';
import { saveEntity } from '@/lib/saveEntity';

import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Dashboard } from './Dashboard';
import { PagesManagement } from './PagesManagement';
import { NewsManagement } from './NewsManagement';
import { ServicesManagement } from './ServicesManagement';
import { DoctorsManagement } from './DoctorsManagement';
import { MenuManagement } from './MenuManagement';
import { ContactManagement } from './ContactManagement';
import { UsersManagement } from './UsersManagement';
import { SurveysManagement } from './SurveysManagement';
import { Settings } from './Settings';

import { User } from '@/lib/types/users';
import { Page } from '@/lib/types/pages';
import { MenuItem } from '@/lib/types/menu';
import { Service } from '@/lib/types/services';
import { NewsItem } from '@/lib/types/news';
import { Doctor } from '@/lib/types/doctors';
import { ContactGroup, ContactDetail as ContactDetailType } from '@/lib/types/contact';

export default function PolishAdminPanel() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Data states
    const [users, setUsers] = useState<User[]>([]);
    const [pages, setPages] = useState<Page[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [contactGroups, setContactGroups] = useState<ContactGroup[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [roles, setRoles] = useState<{ id: string; name: string }[]>([]);

    const router = useRouter();
    const { toast } = useToast();

    const fetchData = async () => {
        setLoading(true);
        try {
            const supabase = createSupabaseClient();
            if (!supabase) return;

            const [usersResult, pagesResult, menuResult, contactGroupsResponse, servicesResult, newsResult, doctorsResult, rolesResult] = await Promise.allSettled([
                supabase.from('users').select(`*,user_has_roles: user_has_roles (role: roles (name))`).order('created_at'),
                supabase.from('pages').select('*').order('updated_at', { ascending: false }),
                supabase.from('menu_items').select('*').order('order_position'),
                fetch('/api/contact_groups', { cache: 'no-store' }),
                supabase.from('services').select('*').order('created_at'),
                supabase.from('news').select('*').order('created_at', { ascending: false }),
                supabase.from('doctors').select('*').order('last_name'),
                supabase.from('roles').select('id, name').order('name'),
            ]);

            if (usersResult.status === 'fulfilled' && usersResult.value.data) {
                setUsers(
                    usersResult.value.data.map((user: any) => ({
                        ...user,
                        role: user.user_has_roles[0]?.role?.name || '',
                    }))
                );
            }
            if (pagesResult.status === 'fulfilled' && pagesResult.value.data) {
                setPages(pagesResult.value.data);
            }
            if (menuResult.status === 'fulfilled' && menuResult.value.data) {
                setMenuItems(menuResult.value.data);
            }

            // Process contact groups result
            if (contactGroupsResponse.status === 'fulfilled') {
                try {
                    const contactGroupsData = await contactGroupsResponse.value.json();
                    if (contactGroupsResponse.value.ok) {
                        if (Array.isArray(contactGroupsData)) {
                            setContactGroups(contactGroupsData);
                        } else if (contactGroupsData && Array.isArray(contactGroupsData.data)) {
                            setContactGroups(contactGroupsData.data);
                        } else {
                            console.error('Błąd: Odpowiedź grup kontaktów nie jest tablicą ani nie zawiera pola data będącego tablicą:', contactGroupsData);
                            toast({
                                title: 'Błąd',
                                description: 'Nie udało się załadować grup kontaktów w oczekiwanym formacie.',
                                variant: 'destructive',
                            });
                            setContactGroups([]);
                        }
                    } else {
                        console.error('Błąd podczas przetwarzania odpowiedzi grup kontaktów (status nie OK):', contactGroupsData);
                        toast({
                            title: 'Błąd',
                            description: contactGroupsData.error || 'Nie udało się załadować grup kontaktów.',
                            variant: 'destructive',
                        });
                        setContactGroups([]);
                    }
                } catch (e) {
                    console.error('Błąd parsowania JSON dla grup kontaktów:', e);
                    toast({ title: 'Błąd', description: 'Nie udało się przetworzyć danych grup kontaktów.', variant: 'destructive' });
                    setContactGroups([]);
                }
            } else if (contactGroupsResponse.status === 'rejected') {
                console.error('Błąd podczas ładowania grup kontaktów:', contactGroupsResponse.reason);
                toast({
                    title: 'Błąd',
                    description: 'Nie udało się załadować grup kontaktów.',
                    variant: 'destructive',
                });
                setContactGroups([]);
            }

            if (servicesResult.status === 'fulfilled' && servicesResult.value.data) {
                setServices(servicesResult.value.data);
            }
            if (newsResult.status === 'fulfilled' && newsResult.value.data) {
                setNews(newsResult.value.data);
            }
            if (doctorsResult.status === 'fulfilled' && doctorsResult.value.data) {
                setDoctors(doctorsResult.value.data);
            }
            if (rolesResult.status === 'fulfilled' && rolesResult.value.data) {
                setRoles(rolesResult.value.data);
            }
        } catch (error) {
            console.error('Błąd podczas ładowania danych:', error);
            toast({
                title: 'Błąd',
                description: 'Nie udało się załadować danych',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkLoginStatus = async () => {
            const response = await fetch('/api/auth/status', { cache: 'no-store' });
            const data = await response.json();

            if (data.isLoggedIn) {
                setIsLoggedIn(true);
                setCurrentUser(data.user);
            } else {
                setIsLoggedIn(false);
                setCurrentUser(null);
                router.replace('/admin/login');
            }
        };

        checkLoginStatus();
    }, [router]);

    useEffect(() => {
        if (isLoggedIn) {
            fetchData();
        }
    }, [isLoggedIn]);

    useEffect(() => {
        if (isLoggedIn && currentUser && users.length > 0) {
            const found = users.find((u) => u.id === currentUser.id);
            if (found && found.role) {
                setCurrentUser({ ...currentUser, role: found.role });
            }
        }
    }, [isLoggedIn, currentUser?.id, users]);

    const handleLogout = async () => {
        await fetch('/api/auth', { method: 'DELETE' });
        setIsLoggedIn(false);
        setCurrentUser(null);
        router.replace('/admin/login');
    };

    const hasPermission = (permission: string) => {
        if (!currentUser?.role) return false;
        if (currentUser.role === 'Administrator') return true;
        if (currentUser.role === 'Editor') return permission === 'manage_pages';
        return false;
    };

    const savePage = (d: Partial<Page>) =>
        saveEntity<Page>(
            'pages',
            {
                title: d.title,
                slug: d.slug,
                content: d.content,
                meta_description: d.meta_description || '',
                is_published: d.is_published,
                created_by: currentUser?.id,
            },
            d.id || null,
            setPages,
            pages,
            () => {}
        );

    const saveNews = (d: Partial<NewsItem>) =>
        saveEntity<NewsItem>(
            'news',
            {
                title: d.title,
                content: d.content || '',
                is_published: d.is_published || false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            d.id || null,
            setNews,
            news,
            () => {}
        );

    const saveService = (d: Partial<Service>) =>
        saveEntity<Service>(
            'services',
            {
                title: d.title,
                description: d.description || '',
                icon: d.icon || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            d.id || null,
            setServices,
            services,
            () => {}
        );

    const saveDoctor = (d: Partial<Doctor>) =>
        saveEntity<Doctor>(
            'doctors',
            {
                first_name: d.first_name,
                last_name: d.last_name,
                specialization: d.specialization,
                description: d.description || '',
                image_url: d.image_url || '',
                is_active: d.is_active,
                order_position: d.order_position || 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            },
            d.id || null,
            setDoctors,
            doctors,
            () => {}
        );

    const saveMenuItem = (d: Partial<MenuItem>) =>
        saveEntity<MenuItem>(
            'menu_items',
            {
                title: d.title,
                url: d.url,
                order_position: d.order_position || 0,
                parent_id: d.parent_id,
                is_published: d.is_published,
                created_by: currentUser?.id,
            },
            d.id || null,
            setMenuItems,
            menuItems,
            () => MenuCache.clearCache()
        );

    const saveSurvey = async (surveyData: any) => {
        try {
            const response = await fetch('/api/surveys', {
                method: surveyData.id ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(surveyData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Nie udało się zapisać ankiety');
            }

            const result = await response.json();
            toast({
                title: 'Sukces',
                description: `Ankieta została ${surveyData.id ? 'zaktualizowana' : 'utworzona'}.`,
                variant: 'success',
            });
            return result;
        } catch (error: any) {
            console.error('Błąd zapisywania ankiety:', error);
            toast({
                title: 'Błąd',
                description: error.message || 'Nie udało się zapisać ankiety',
                variant: 'destructive',
            });
            throw error;
        }
    };

    const handleSaveContactGroup = async (groupWithDetails: ContactGroup) => {
        const { contact_details, ...groupDataToSave } = groupWithDetails;
        const isNewGroup = !groupDataToSave.id || groupDataToSave.id.startsWith('new-group-temp-id');

        let savedGroupResponse: ContactGroup | null = null;

        const groupUrl = isNewGroup ? '/api/contact_groups' : `/api/contact_groups/${groupDataToSave.id}`;
        const groupMethod = isNewGroup ? 'POST' : 'PATCH';

        let payloadForGroup: Partial<ContactGroup> = { ...groupDataToSave };
        if (isNewGroup) {
            const { id, ...rest } = payloadForGroup;
            payloadForGroup = rest;
        }

        try {
            const groupResponse = await fetch(groupUrl, {
                method: groupMethod,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payloadForGroup),
            });
            const groupResult = await groupResponse.json();
            if (!groupResponse.ok || groupResult.error) {
                throw new Error(groupResult.error || 'Nie udało się zapisać grupy kontaktów');
            }
            savedGroupResponse = isNewGroup ? groupResult : groupResult.data || groupResult;

            if (!savedGroupResponse || !savedGroupResponse.id) {
                console.error('Invalid group data from server:', savedGroupResponse);
                throw new Error('Otrzymano nieprawidłowe dane grupy kontaktów z serwera po zapisie.');
            }

            const finalGroupId = savedGroupResponse.id;
            const processedDetails: ContactDetailType[] = [];

            if (contact_details && contact_details.length > 0) {
                const detailPromises = contact_details.map((detail) => {
                    const detailPayload: Partial<ContactDetailType> = {
                        ...detail,
                        group_id: finalGroupId,
                    };
                    const isNewDetail = detail.id.startsWith('new-');

                    let currentDetailPayload: Partial<ContactDetailType>;
                    if (isNewDetail) {
                        const { id, ...restOfDetail } = detailPayload;
                        currentDetailPayload = restOfDetail;
                    } else {
                        currentDetailPayload = detailPayload;
                    }

                    const detailUrl = isNewDetail ? '/api/contact_details' : `/api/contact_details/${detail.id}`;
                    const detailMethod = isNewDetail ? 'POST' : 'PATCH';

                    return fetch(detailUrl, {
                        method: detailMethod,
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(currentDetailPayload),
                    }).then(async (res) => {
                        const detailResult = await res.json();
                        if (!res.ok || detailResult.error) {
                            console.error(`Nie udało się zapisać szczegółu (${detail.type}: ${detail.value}): ${detailResult.error}`);
                            toast({ title: 'Błąd szczegółu', description: `Nie udało się zapisać: ${detail.type} - ${detail.value.substring(0, 20)}`, variant: 'destructive' });
                            return null;
                        }
                        return detailResult.data;
                    });
                });

                const savedDetailsResults = await Promise.all(detailPromises);

                savedDetailsResults.forEach((result) => {
                    if (result) {
                        processedDetails.push(result);
                    }
                });
                savedGroupResponse.contact_details = processedDetails;
            } else {
                savedGroupResponse.contact_details = [];
            }

            setContactGroups((prevGroups) => {
                const updatedGroups = isNewGroup ? [...prevGroups, savedGroupResponse!] : prevGroups.map((g) => (g.id === savedGroupResponse!.id ? savedGroupResponse! : g));
                return updatedGroups.filter((g) => g !== null && g !== undefined);
            });

            toast({ title: 'Sukces', description: 'Grupa kontaktów i jej szczegóły zapisane.', variant: 'success' });
        } catch (error: any) {
            console.error('Błąd zapisu grupy kontaktów lub jej szczegółów:', error);
            toast({ title: 'Błąd Ogólny Zapisu', description: error.message, variant: 'destructive' });
            fetchData();
        }
    };

    const handleDeleteContactGroup = async (groupId: string) => {
        if (!confirm('Czy na pewno chcesz usunąć tę grupę kontaktów wraz ze wszystkimi szczegółami?')) return;
        try {
            const response = await fetch(`/api/contact_groups/${groupId}`, { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok || result.error) throw new Error(result.error || 'Nie udało się usunąć grupy kontaktów');

            setContactGroups((prev) => prev.filter((g) => g.id !== groupId));
            toast({ title: 'Sukces', description: 'Grupa kontaktów usunięta.', variant: 'success' });
        } catch (error: any) {
            console.error('Błąd usuwania grupy kontaktów:', error);
            toast({ title: 'Błąd', description: error.message, variant: 'destructive' });
        }
    };

    const handleDeleteContactDetail = async (detailId: string, groupId?: string) => {
        if (!confirm('Czy na pewno chcesz usunąć ten szczegół kontaktu?')) return;
        try {
            const response = await fetch(`/api/contact_details/${detailId}`, { method: 'DELETE' });
            const result = await response.json();
            if (!response.ok || result.error) throw new Error(result.error || 'Nie udało się usunąć szczegółu kontaktu');

            if (groupId) {
                const groupToUpdate = contactGroups.find((g) => g.id === groupId);
                if (groupToUpdate) {
                    const updatedDetails = (groupToUpdate.contact_details || []).filter((d) => d.id !== detailId);
                    const updatedGroup = { ...groupToUpdate, contact_details: updatedDetails };
                    setContactGroups((prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)));
                }
            } else {
                const cgResponse = await fetch('/api/contact_groups');
                const cgData = await cgResponse.json();
                if (cgResponse.ok && Array.isArray(cgData.data)) setContactGroups(cgData.data);
            }
            toast({ title: 'Sukces', description: 'Szczegół kontaktu usunięty.', variant: 'success' });
        } catch (error: any) {
            console.error('Błąd usuwania szczegółu kontaktu:', error);
            toast({ title: 'Błąd', description: error.message, variant: 'destructive' });
        }
    };

    const saveUser = (d: Partial<User>) =>
        saveEntity<User>(
            'users',
            {
                username: d.username,
                password: d.password,
                is_active: d.is_active,
                role: d.role,
            },
            d.id || null,
            setUsers,
            users,
            () => {}
        );

    type TableKey = 'pages' | 'news' | 'services' | 'doctors' | 'users' | 'menu_items';

    const map: Record<
        TableKey,
        {
            items: any[];
            getName: (item: any) => string;
            setItems: React.Dispatch<React.SetStateAction<any[]>>;
            extra?: () => void;
        }
    > = {
        pages: {
            items: pages,
            getName: (p) => p?.title || 'stronę',
            setItems: setPages,
        },
        news: {
            items: news,
            getName: (n) => n?.title || 'aktualność',
            setItems: setNews,
        },
        services: {
            items: services,
            getName: (s) => s?.title || 'usługę',
            setItems: setServices,
        },
        doctors: {
            items: doctors,
            getName: (d) => `${d?.first_name} ${d?.last_name}` || 'lekarza',
            setItems: setDoctors,
        },
        users: {
            items: users,
            getName: (u) => u?.username || 'użytkownika',
            setItems: setUsers,
        },
        menu_items: {
            items: menuItems,
            getName: (m) => m?.title || 'pozycję menu',
            setItems: setMenuItems,
            extra: () => MenuCache.clearCache(),
        },
    };

    const handleDelete = async (table: string, id: string) => {
        await deleteItem(table as TableKey, id);
    };

    const deleteItem = async (table: TableKey, id: string) => {
        try {
            if (!confirm('Czy na pewno chcesz usunąć ten element?')) return;

            const supabase = createSupabaseClient();
            if (!supabase) {
                toast({ title: 'Błąd', description: 'Klient Supabase nie jest zainicjowany.', variant: 'destructive' });
                return;
            }

            const { error } = await supabase.from(table).delete().match({ id });

            if (error) throw error;

            const { setItems, extra, getName } = map[table];

            const itemsArray = map[table].items;
            const deletedItem = itemsArray.find((item) => item.id === id);
            const itemName = deletedItem ? getName(deletedItem) : `element o ID ${id}`;

            setItems((prev: any[]) => prev.filter((item) => item.id !== id));
            if (extra) extra();

            toast({ title: 'Sukces', description: `Pomyślnie usunięto ${itemName}.`, variant: 'success' });
        } catch (error: any) {
            console.error('Błąd usuwania elementu:', error);
            toast({ title: 'Błąd', description: error.message, variant: 'destructive' });
        }
    };

    const handleReorderContactGroups = async (reorderedGroups: ContactGroup[]) => {
        try {
            setContactGroups(reorderedGroups);

            const response = await fetch('/api/contact_groups/reorder', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groups: reorderedGroups.map((group) => ({
                        id: group.id,
                        order_position: group.order_position,
                    })),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Nie udało się zaktualizować kolejności');
            }

            toast({
                title: 'Sukces',
                description: 'Kolejność działów została zaktualizowana.',
                variant: 'success',
            });
        } catch (error: any) {
            console.error('Błąd aktualizacji kolejności grup kontaktowych:', error);
            toast({
                title: 'Błąd',
                description: error.message || 'Nie udało się zaktualizować kolejności działów',
                variant: 'destructive',
            });
            fetchData();
        }
    };

    if (!isLoggedIn) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p>Przekierowywanie do strony logowania...</p>
            </div>
        );
    }

    if (loading && !users.length) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-100">
                <p>Ładowanie danych panelu...</p>
            </div>
        );
    }

    return (
        <>
            <Toaster />
            <div className="flex h-screen bg-gray-50">
                <Sidebar
                    currentUser={currentUser}
                    sidebarCollapsed={sidebarCollapsed}
                    setSidebarCollapsed={setSidebarCollapsed}
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    hasPermission={hasPermission}
                    onLogout={handleLogout}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <Header activeTab={activeTab} />
                    <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
                        {activeTab === 'dashboard' && <Dashboard pages={pages} services={services} news={news} doctors={doctors} />}
                        {activeTab === 'news' && hasPermission('manage_pages') && <NewsManagement news={news} onSave={saveNews} onDelete={(id) => deleteItem('news', id)} />}
                        {activeTab === 'pages' && hasPermission('manage_pages') && <PagesManagement pages={pages} onSave={savePage} onDelete={(id) => deleteItem('pages', id)} />}
                        {activeTab === 'menus' && hasPermission('manage_menus') && <MenuManagement menuItems={menuItems} onSave={saveMenuItem} onDelete={(id) => deleteItem('menu_items', id)} />}
                        {activeTab === 'doctors' && hasPermission('manage_pages') && <DoctorsManagement doctors={doctors} onSave={saveDoctor} onDelete={(id) => deleteItem('doctors', id)} />}
                        {activeTab === 'services' && hasPermission('manage_pages') && <ServicesManagement services={services} onSave={saveService} onDelete={(id) => deleteItem('services', id)} />}
                        {activeTab === 'surveys' && hasPermission('manage_pages') && <SurveysManagement onSave={saveSurvey} currentUser={currentUser} />}
                        {activeTab === 'contact' && hasPermission('manage_contact') && (
                            <ContactManagement
                                contactGroups={contactGroups}
                                onSaveGroup={handleSaveContactGroup}
                                onDeleteGroup={handleDeleteContactGroup}
                                onDeleteDetail={handleDeleteContactDetail}
                                onReorderGroups={handleReorderContactGroups}
                            />
                        )}
                        {activeTab === 'users' && hasPermission('manage_users') && (
                            <UsersManagement users={users} roles={roles} onSave={saveUser} onDelete={(id) => deleteItem('users', id)} currentUser={currentUser} />
                        )}
                        {activeTab === 'settings' && hasPermission('manage_pages') && (
                            <Settings
                                currentUser={currentUser}
                                onSave={async (data) => {
                                    // Handle settings save if needed
                                }}
                            />
                        )}
                    </main>
                </div>
            </div>
        </>
    );
}
