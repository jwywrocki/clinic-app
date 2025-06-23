'use client';

import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions {
    threshold?: number | number[];
    rootMargin?: string;
    triggerOnce?: boolean;
    initialIsIntersecting?: boolean;
}

export function useIntersectionObserver(options: UseIntersectionObserverOptions = {}) {
    const { threshold = 0.1, rootMargin = '0px', triggerOnce = true, initialIsIntersecting = false } = options;

    const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting);
    const [hasTriggered, setHasTriggered] = useState(false);
    const elementRef = useRef<HTMLElement>(null);

    useEffect(() => {
        const element = elementRef.current;
        if (!element) return;

        // Respect user's motion preferences
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (prefersReducedMotion) {
            setIsIntersecting(true);
            setHasTriggered(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                const isElementIntersecting = entry.isIntersecting;

                if (isElementIntersecting && !hasTriggered) {
                    setIsIntersecting(true);
                    if (triggerOnce) {
                        setHasTriggered(true);
                    }
                } else if (!triggerOnce && !isElementIntersecting) {
                    setIsIntersecting(false);
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
    }, [threshold, rootMargin, triggerOnce, hasTriggered]);

    return {
        elementRef,
        isIntersecting,
        hasTriggered,
    };
}
