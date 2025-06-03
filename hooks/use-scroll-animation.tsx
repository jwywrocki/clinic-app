'use client';

import { useEffect, useRef, useState } from 'react';

interface UseScrollAnimationOptions {
    threshold?: number;
    rootMargin?: string;
    triggerOnce?: boolean;
    delay?: number;
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
    const { threshold = 0.1, rootMargin = '0px 0px -50px 0px', triggerOnce = true, delay = 0 } = options;

    const [isVisible, setIsVisible] = useState(false);
    const [hasTriggered, setHasTriggered] = useState(false);
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        // Check for reduced motion preference
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            setIsVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    if (delay > 0) {
                        setTimeout(() => {
                            setIsVisible(true);
                            if (triggerOnce) setHasTriggered(true);
                        }, delay);
                    } else {
                        setIsVisible(true);
                        if (triggerOnce) setHasTriggered(true);
                    }
                } else if (!triggerOnce && !hasTriggered) {
                    setIsVisible(false);
                }
            },
            {
                threshold,
                rootMargin,
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
        };
    }, [threshold, rootMargin, triggerOnce, delay, hasTriggered]);

    return { elementRef, isVisible };
}

// Animation variants for different effects
export const animationVariants = {
    fadeInUp: {
        initial: 'opacity-0 translate-y-8',
        animate: 'opacity-100 translate-y-0',
        transition: 'transition-all duration-700 ease-out',
    },
    fadeInLeft: {
        initial: 'opacity-0 -translate-x-8',
        animate: 'opacity-100 translate-x-0',
        transition: 'transition-all duration-700 ease-out',
    },
    fadeInRight: {
        initial: 'opacity-0 translate-x-8',
        animate: 'opacity-100 translate-x-0',
        transition: 'transition-all duration-700 ease-out',
    },
    scaleIn: {
        initial: 'opacity-0 scale-95',
        animate: 'opacity-100 scale-100',
        transition: 'transition-all duration-500 ease-out',
    },
    slideInUp: {
        initial: 'opacity-0 translate-y-12',
        animate: 'opacity-100 translate-y-0',
        transition: 'transition-all duration-800 ease-out',
    },
    bounceIn: {
        initial: 'opacity-0 scale-95',
        animate: 'opacity-100 scale-100',
        transition: 'transition-all duration-500 ease-out',
    },
    fadeIn: {
        initial: 'opacity-0',
        animate: 'opacity-100',
        transition: 'transition-all duration-700 ease-out',
    },
};
