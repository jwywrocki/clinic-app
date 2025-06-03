'use client';

import type { ReactNode, Ref, ElementType } from 'react';
import { forwardRef } from 'react';
import { useScrollAnimation, animationVariants } from '@/hooks/use-scroll-animation';

interface AnimatedSectionProps extends React.HTMLAttributes<HTMLElement> {
    children: ReactNode;
    animation?: keyof typeof animationVariants;
    delay?: number;
    className?: string;
    as?: ElementType;
}

export const AnimatedSection = forwardRef(function AnimatedSection(
    { children, animation = 'fadeInUp', delay = 0, className = '', as: Tag = 'div', ...rest }: AnimatedSectionProps,
    ref: Ref<HTMLElement>
) {
    const { elementRef, isVisible } = useScrollAnimation({ delay, triggerOnce: true });
    const variant = animationVariants[animation] || animationVariants.fadeInUp;

    return (
        <Tag
            ref={(node: HTMLElement) => {
                elementRef.current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
            }}
            className={`${variant.initial} ${isVisible ? variant.animate : ''} ${variant.transition} ${className}`}
            {...rest}
        >
            {children}
        </Tag>
    );
});
