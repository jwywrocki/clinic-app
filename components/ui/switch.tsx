'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>>(({ className, ...props }, ref) => (
    <SwitchPrimitives.Root
        ref={ref}
        className={cn(
            'peer inline-flex h-5 w-12 shrink-0 cursor-pointer items-center rounded-full border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input',
            className
        )}
        {...props}
    >
        <SwitchPrimitives.Thumb
            className={cn('pointer-events-none block h-4 w-4 rounded-full bg-background shadow transition-transform duration-200 translate-x-1 data-[state=checked]:translate-x-7')}
        />
    </SwitchPrimitives.Root>
));

Switch.displayName = 'Switch';

export { Switch };
