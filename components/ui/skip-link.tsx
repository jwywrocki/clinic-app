'use client';

import type React from 'react';

import { Button } from './button';

interface SkipLinkProps {
    href: string;
    children: React.ReactNode;
}

export function SkipLink({ href, children }: SkipLinkProps) {
    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
            if (target instanceof HTMLElement) {
                target.focus();
            }
        }
    };

    return (
        <Button asChild className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50" onClick={handleClick}>
            <a href={href}>{children}</a>
        </Button>
    );
}
