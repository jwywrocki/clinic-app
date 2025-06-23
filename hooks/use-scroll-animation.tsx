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
            setHasTriggered(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasTriggered) {
                    if (delay > 0) {
                        setTimeout(() => {
                            if (!hasTriggered) {
                                setIsVisible(true);
                                if (triggerOnce) setHasTriggered(true);
                            }
                        }, delay);
                    } else {
                        setIsVisible(true);
                        if (triggerOnce) setHasTriggered(true);
                    }
                } else if (!triggerOnce && !entry.isIntersecting) {
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

    return { elementRef, isVisible, hasTriggered };
}

// Animation variants for different effects
export const animationVariants = {
    fadeInUp: {
        initial: 'opacity-0 transform translate-y-8',
        animate: 'opacity-100 transform translate-y-0',
        transition: 'transition-all duration-700 ease-out',
    },
    fadeInLeft: {
        initial: 'opacity-0 transform -translate-x-8',
        animate: 'opacity-100 transform translate-x-0',
        transition: 'transition-all duration-700 ease-out',
    },
    fadeInRight: {
        initial: 'opacity-0 transform translate-x-8',
        animate: 'opacity-100 transform translate-x-0',
        transition: 'transition-all duration-700 ease-out',
    },
    fadeInDown: {
        initial: 'opacity-0 transform -translate-y-8',
        animate: 'opacity-100 transform translate-y-0',
        transition: 'transition-all duration-700 ease-out',
    },
    scaleIn: {
        initial: 'opacity-0 transform scale-95',
        animate: 'opacity-100 transform scale-100',
        transition: 'transition-all duration-500 ease-out',
    },
    slideInUp: {
        initial: 'opacity-0 transform translate-y-12',
        animate: 'opacity-100 transform translate-y-0',
        transition: 'transition-all duration-800 ease-out',
    },
    bounceIn: {
        initial: 'opacity-0 transform scale-90',
        animate: 'opacity-100 transform scale-100',
        transition: 'transition-all duration-600 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]',
    },
    fadeIn: {
        initial: 'opacity-0',
        animate: 'opacity-100',
        transition: 'transition-all duration-700 ease-out',
    },
    slideInLeft: {
        initial: 'opacity-0 transform -translate-x-12',
        animate: 'opacity-100 transform translate-x-0',
        transition: 'transition-all duration-800 ease-out',
    },
    slideInRight: {
        initial: 'opacity-0 transform translate-x-12',
        animate: 'opacity-100 transform translate-x-0',
        transition: 'transition-all duration-800 ease-out',
    },
    zoomIn: {
        initial: 'opacity-0 transform scale-50',
        animate: 'opacity-100 transform scale-100',
        transition: 'transition-all duration-600 ease-out',
    },
    rotateIn: {
        initial: 'opacity-0 transform rotate-180 scale-75',
        animate: 'opacity-100 transform rotate-0 scale-100',
        transition: 'transition-all duration-800 ease-out',
    },
    flipInX: {
        initial: 'opacity-0 transform rotateX-90',
        animate: 'opacity-100 transform rotateX-0',
        transition: 'transition-all duration-600 ease-out',
    },
    flipInY: {
        initial: 'opacity-0 transform rotateY-90',
        animate: 'opacity-100 transform rotateY-0',
        transition: 'transition-all duration-600 ease-out',
    },
};
