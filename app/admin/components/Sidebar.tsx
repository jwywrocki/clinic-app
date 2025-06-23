'use client';

import { Button } from '@/components/ui/button';
import { AnimatedSection } from '@/components/ui/animated-section';
import { BarChart3, FileText, Newspaper, Stethoscope, Users, ClipboardList, MenuIcon, Phone, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { User } from '@/lib/types/users';

interface SidebarProps {
    currentUser: User | null;
    sidebarCollapsed: boolean;
    setSidebarCollapsed: (collapsed: boolean) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    hasPermission: (permission: string) => boolean;
    onLogout: () => void;
}

const navigationItems = [
    // GŁÓWNY DASHBOARD
    { id: 'dashboard', label: 'Panel główny', icon: BarChart3, category: 'main' },

    // ZARZĄDZANIE TREŚCIĄ
    { id: 'pages', label: 'Strony', icon: FileText, permission: 'manage_pages', category: 'content' },
    { id: 'news', label: 'Aktualności', icon: Newspaper, permission: 'manage_pages', category: 'content' },
    { id: 'services', label: 'Usługi', icon: Stethoscope, permission: 'manage_pages', category: 'content' },
    { id: 'doctors', label: 'Lekarze', icon: Users, permission: 'manage_pages', category: 'content' },
    { id: 'surveys', label: 'Ankiety', icon: ClipboardList, permission: 'manage_pages', category: 'content' },

    // STRUKTURA WITRYNY
    { id: 'menus', label: 'Menu', icon: MenuIcon, permission: 'manage_menus', category: 'structure' },
    { id: 'contact', label: 'Kontakt', icon: Phone, permission: 'manage_contact', category: 'structure' },

    // ADMINISTRACJA
    { id: 'users', label: 'Użytkownicy', icon: Users, permission: 'manage_users', category: 'admin' },
    { id: 'settings', label: 'Ustawienia', icon: SettingsIcon, permission: 'manage_pages', category: 'admin' },
];

const categoryLabels = {
    main: 'Panel główny',
    content: 'Zarządzanie treścią',
    structure: 'Struktura witryny',
    admin: 'Administracja',
};

export function Sidebar({ currentUser, sidebarCollapsed, setSidebarCollapsed, activeTab, setActiveTab, hasPermission, onLogout }: SidebarProps) {
    return (
        <AnimatedSection animation="fadeInLeft">
            <div className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
                {/* Sidebar Header */}
                <div className="p-3 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        {!sidebarCollapsed && (
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                    </div>
                                </div>
                                <span className="text-lg font-bold text-gray-900">SPZOZ GOZ</span>
                            </div>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2">
                            <MenuIcon className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-3 flex-1 overflow-y-auto">
                    {!sidebarCollapsed ? (
                        <div className="space-y-6">
                            {Object.entries(categoryLabels).map(([categoryKey, categoryLabel]) => {
                                const categoryItems = navigationItems.filter((item) => item.category === categoryKey);
                                const accessibleItems = categoryItems.filter((item) => !item.permission || hasPermission(item.permission));

                                if (accessibleItems.length === 0) return null;

                                return (
                                    <div key={categoryKey}>
                                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">{categoryLabel}</h3>
                                        <ul className="space-y-1">
                                            {accessibleItems.map((item) => (
                                                <li key={item.id}>
                                                    <Button
                                                        variant={activeTab === item.id ? 'default' : 'ghost'}
                                                        className={`w-full transition-all duration-200 ${
                                                            activeTab === item.id ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 hover:bg-gray-100'
                                                        } justify-start px-4`}
                                                        onClick={() => setActiveTab(item.id)}
                                                    >
                                                        <item.icon className="h-5 w-5 mr-3" />
                                                        {item.label}
                                                    </Button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <ul className="space-y-2">
                            {navigationItems.map((item) => {
                                const canAccess = !item.permission || hasPermission(item.permission);
                                if (!canAccess) return null;

                                return (
                                    <li key={item.id}>
                                        <Button
                                            variant={activeTab === item.id ? 'default' : 'ghost'}
                                            className={`w-full transition-all duration-200 ${
                                                activeTab === item.id ? 'bg-blue-600 text-white hover:bg-blue-700' : 'text-gray-700 hover:bg-gray-100'
                                            } justify-center px-2`}
                                            onClick={() => setActiveTab(item.id)}
                                            title={item.label}
                                        >
                                            <item.icon className="h-5 w-5" />
                                        </Button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </nav>

                {/* User Info & Logout */}
                <div className="p-2 border-t border-gray-200">
                    {!sidebarCollapsed && (
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-900">{currentUser?.username}</p>
                            <p className="text-xs text-gray-500">{currentUser?.role || 'Administrator'}</p>
                        </div>
                    )}
                    <Button variant="outline" onClick={onLogout} className={`w-full ${sidebarCollapsed ? 'px-2' : ''}`}>
                        <LogOut className={`h-4 w-4 ${sidebarCollapsed ? '' : 'mr-2'}`} />
                        {!sidebarCollapsed && 'Wyloguj'}
                    </Button>
                </div>
            </div>
        </AnimatedSection>
    );
}
