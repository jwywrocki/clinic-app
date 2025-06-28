'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AnimatedSection } from '@/components/ui/animated-section';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { User } from '@/lib/types/users';

interface UsersManagementProps {
    users: User[];
    roles: { id: string; name: string }[];
    currentUser: User | null;
    onSave: (user: Partial<User>) => void;
    onDelete: (table: string, id: string) => Promise<void>;
    isSaving?: boolean;
}

export function UsersManagement({ users, roles, currentUser, onSave, onDelete, isSaving = false }: UsersManagementProps) {
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            const formData = new FormData(e.target as HTMLFormElement);
            const selectedRole = formData.get('role') as string;
            const password = formData.get('password') as string;

            onSave({
                ...editingUser,
                password: password || undefined,
                role: selectedRole || '',
            });
            setEditingUser(null);
        }
    };

    const handleNewUser = () => {
        setEditingUser({
            id: '',
            username: '',
            password: '',
            is_active: true,
            created_at: '',
            updated_at: '',
            role: '',
        });
    };

    return (
        <AnimatedSection animation="fadeInUp">
            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Zarządzaj Użytkownikami</CardTitle>
                        <Button onClick={handleNewUser}>
                            <Plus className="h-4 w-4 mr-2" />
                            Dodaj użytkownika
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {editingUser ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="userUsername">Nazwa użytkownika</Label>
                                <Input
                                    id="userUsername"
                                    value={editingUser.username}
                                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                                    placeholder="Nazwa użytkownika"
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="userPassword">Hasło</Label>
                                <Input
                                    id="userPassword"
                                    name="password"
                                    type="password"
                                    value={editingUser.password || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, password: e.target.value })}
                                    placeholder={editingUser.id ? 'Nowe hasło (opcjonalne)' : 'Hasło użytkownika'}
                                    required={!editingUser.id}
                                />
                            </div>
                            <div>
                                <Label htmlFor="userRole">Rola</Label>
                                <select
                                    id="userRole"
                                    name="role"
                                    value={editingUser.role || ''}
                                    onChange={(e) => setEditingUser({ ...editingUser, role: e.target.value })}
                                    required
                                    className="block w-full border border-gray-300 rounded px-3 py-2"
                                >
                                    <option value="" disabled>
                                        Wybierz rolę
                                    </option>
                                    {roles.map((role) => (
                                        <option key={role.id} value={role.name}>
                                            {role.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="userActive" checked={editingUser.is_active} onChange={(e) => setEditingUser({ ...editingUser, is_active: e.target.checked })} />
                                <Label htmlFor="userActive">Aktywny</Label>
                            </div>
                            <div className="flex gap-2">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? 'Zapisywanie...' : 'Zapisz'}
                                </Button>
                                <Button variant="outline" onClick={() => setEditingUser(null)} disabled={isSaving}>
                                    Anuluj
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nazwa użytkownika</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rola</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ostatnie logowanie</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex flex-wrap gap-1">
                                                    {user.role ? (
                                                        <Badge key={user.role} variant={user.role === 'Administrator' ? 'default' : 'secondary'}>
                                                            {user.role}
                                                        </Badge>
                                                    ) : (
                                                        <span className="text-gray-400">Brak ról</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <Badge variant={user.is_active ? 'default' : 'secondary'} className={user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                                    {user.is_active ? 'Aktywny' : 'Nieaktywny'}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.last_login ? new Date(user.last_login).toLocaleDateString('pl-PL') : 'Nigdy'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                                <Button variant="outline" size="sm" onClick={() => setEditingUser(user)} disabled={user.username === 'jaqb'} title="Edytuj użytkownika">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => onDelete('users', user.id)}
                                                    disabled={user.username === currentUser?.username || user.username === 'jaqb'}
                                                    className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:text-gray-400 disabled:hover:text-gray-400 disabled:hover:bg-transparent"
                                                    title="Usuń użytkownika"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {users.length === 0 && (
                                <div className="text-center py-8">
                                    <div className="text-gray-500">
                                        <h3 className="text-lg font-medium mb-2">Brak użytkowników</h3>
                                        <p className="text-sm">Rozpocznij od dodania pierwszego użytkownika.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </AnimatedSection>
    );
}
