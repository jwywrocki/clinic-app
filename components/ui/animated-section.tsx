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
    threshold?: number;
    triggerOnce?: boolean;
    disabled?: boolean;
}

export const AnimatedSection = forwardRef(function AnimatedSection(
    { children, animation = 'fadeInUp', delay = 0, className = '', as: Tag = 'div', threshold = 0.1, triggerOnce = true, disabled = false, ...rest }: AnimatedSectionProps,
    ref: Ref<HTMLElement>
) {
    const { elementRef, isVisible, hasTriggered } = useScrollAnimation({
        delay,
        triggerOnce,
        threshold,
        rootMargin: '0px 0px -80px 0px',
    });

    const variant = animationVariants[animation] || animationVariants.fadeInUp;

    // If disabled, don't apply animations
    if (disabled) {
        return (
            <Tag ref={ref} className={className} {...rest}>
                {children}
            </Tag>
        );
    }

    // Get current animation classes
    const getAnimationClasses = () => {
        if (isVisible) {
            return `${variant.animate} ${variant.transition}`;
        } else {
            return `${variant.initial} ${variant.transition}`;
        }
    };

    return (
        <Tag
            ref={(node: HTMLElement) => {
                elementRef.current = node;
                if (typeof ref === 'function') ref(node);
                else if (ref) (ref as React.MutableRefObject<HTMLElement | null>).current = node;
            }}
            className={`${getAnimationClasses()} ${className}`}
            style={{
                willChange: isVisible ? 'auto' : 'transform, opacity',
            }}
            {...rest}
        >
            {children}
        </Tag>
    );
});
