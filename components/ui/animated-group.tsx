'use client';

import React, { Children, cloneElement, isValidElement } from 'react';
import { AnimatedSection } from './animated-section';
import { animationVariants } from '@/hooks/use-scroll-animation';

interface AnimatedGroupProps {
    children: React.ReactNode;
    animation?: keyof typeof animationVariants;
    staggerDelay?: number;
    className?: string;
    threshold?: number;
    as?: React.ElementType;
}

export function AnimatedGroup({ children, animation = 'fadeInUp', staggerDelay = 100, className = '', threshold = 0.1, as: Tag = 'div' }: AnimatedGroupProps) {
    const childrenArray = Children.toArray(children);

    return (
        <Tag className={className}>
            {childrenArray.map((child, index) => {
                const delay = index * staggerDelay;

                if (isValidElement(child)) {
                    return (
                        <AnimatedSection key={index} animation={animation} delay={delay} threshold={threshold}>
                            {child}
                        </AnimatedSection>
                    );
                }

                return (
                    <AnimatedSection key={index} animation={animation} delay={delay} threshold={threshold}>
                        {child}
                    </AnimatedSection>
                );
            })}
        </Tag>
    );
}
