'use client';

import { forwardRef } from 'react';
import { AnimatedSection } from './animated-section';

interface FadeInProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    className?: string;
    as?: React.ElementType;
    threshold?: number;
    triggerOnce?: boolean;
}

export const FadeIn = forwardRef<HTMLElement, FadeInProps>(function FadeIn({ children, delay = 0, direction = 'up', className = '', as = 'div', threshold = 0.1, triggerOnce = true, ...rest }, ref) {
    const getAnimation = () => {
        switch (direction) {
            case 'up':
                return 'fadeInUp';
            case 'down':
                return 'fadeInDown';
            case 'left':
                return 'fadeInLeft';
            case 'right':
                return 'fadeInRight';
            case 'none':
            default:
                return 'fadeIn';
        }
    };

    return (
        <AnimatedSection ref={ref} animation={getAnimation()} delay={delay} className={className} as={as} threshold={threshold} triggerOnce={triggerOnce} {...rest}>
            {children}
        </AnimatedSection>
    );
});

interface SlideInProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    delay?: number;
    direction?: 'up' | 'down' | 'left' | 'right';
    className?: string;
    as?: React.ElementType;
    threshold?: number;
    triggerOnce?: boolean;
}

export const SlideIn = forwardRef<HTMLElement, SlideInProps>(function SlideIn(
    { children, delay = 0, direction = 'up', className = '', as = 'div', threshold = 0.1, triggerOnce = true, ...rest },
    ref
) {
    const getAnimation = () => {
        switch (direction) {
            case 'up':
                return 'slideInUp';
            case 'left':
                return 'slideInLeft';
            case 'right':
                return 'slideInRight';
            default:
                return 'slideInUp';
        }
    };

    return (
        <AnimatedSection ref={ref} animation={getAnimation()} delay={delay} className={className} as={as} threshold={threshold} triggerOnce={triggerOnce} {...rest}>
            {children}
        </AnimatedSection>
    );
});

interface ScaleInProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    as?: React.ElementType;
    threshold?: number;
    triggerOnce?: boolean;
}

export const ScaleIn = forwardRef<HTMLElement, ScaleInProps>(function ScaleIn({ children, delay = 0, className = '', as = 'div', threshold = 0.1, triggerOnce = true, ...rest }, ref) {
    return (
        <AnimatedSection ref={ref} animation="scaleIn" delay={delay} className={className} as={as} threshold={threshold} triggerOnce={triggerOnce} {...rest}>
            {children}
        </AnimatedSection>
    );
});

interface BounceInProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
    delay?: number;
    className?: string;
    as?: React.ElementType;
    threshold?: number;
    triggerOnce?: boolean;
}

export const BounceIn = forwardRef<HTMLElement, BounceInProps>(function BounceIn({ children, delay = 0, className = '', as = 'div', threshold = 0.1, triggerOnce = true, ...rest }, ref) {
    return (
        <AnimatedSection ref={ref} animation="bounceIn" delay={delay} className={className} as={as} threshold={threshold} triggerOnce={triggerOnce} {...rest}>
            {children}
        </AnimatedSection>
    );
});
