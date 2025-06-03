'use client';

import React from 'react';
import { toast } from '@/hooks/use-toast';

type Entity = 'pages' | 'news' | 'services' | 'doctors' | 'menu_items' | 'contact_details' | 'users';

export async function saveEntity<T>(
    table: Entity,
    data: Partial<T>,
    editingId: string | null,
    setList: React.Dispatch<React.SetStateAction<T[]>>,
    allItems: T[],
    setEditing: React.Dispatch<React.SetStateAction<T | null>>
) {
    try {
        const now = new Date().toISOString();
        const isEditing = Boolean(editingId);
        const url = isEditing ? `/api/${table}/${editingId}` : `/api/${table}`;
        const method = isEditing ? 'PATCH' : 'POST';

        const payload = {
            ...data,
            updated_at: now,
            ...(isEditing ? {} : { created_at: now }),
        };

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Błąd sieci');

        if (isEditing) {
            setList(allItems.map((item) => ((item as any).id === editingId ? json : item)));
        } else {
            setList([...allItems, json]);
        }
        setEditing(null);

        const entityNames = {
            pages: { singular: 'Strona', edit: 'Strona zaktualizowana pomyślnie', create: 'Nowa strona dodana pomyślnie' },
            news: { singular: 'Aktualność', edit: 'Aktualność zaktualizowana pomyślnie', create: 'Nowa aktualność dodana pomyślnie' },
            services: { singular: 'Usługa', edit: 'Usługa zaktualizowana pomyślnie', create: 'Nowa usługa dodana pomyślnie' },
            doctors: { singular: 'Lekarz', edit: 'Lekarz zaktualizowany pomyślnie', create: 'Nowy lekarz dodany pomyślnie' },
            menu_items: { singular: 'Pozycja menu', edit: 'Pozycja menu zaktualizowana pomyślnie', create: 'Nowa pozycja menu dodana pomyślnie' },
            contact_details: { singular: 'Dane kontaktowe', edit: 'Dane kontaktowe zaktualizowane pomyślnie', create: 'Nowe dane kontaktowe dodane pomyślnie' },
            users: { singular: 'Użytkownik', edit: 'Użytkownik zaktualizowany pomyślnie', create: 'Nowy użytkownik dodany pomyślnie' },
        };

        const entityInfo = entityNames[table];

        toast({
            title: isEditing ? 'Zaktualizowano' : 'Utworzono',
            description: isEditing ? entityInfo.edit : entityInfo.create,
        });
    } catch (err: any) {
        console.error(`saveEntity(${table}) error:`, err);
        toast({
            title: 'Błąd',
            description: err.message,
            variant: 'destructive',
        });
    }
}
