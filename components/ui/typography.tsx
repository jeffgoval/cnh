import * as React from "react"
import { cn } from "@/lib/utils"

// -----------------------------------------------------------------------------
// HEADING COMPONENT
// -----------------------------------------------------------------------------

interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
    level?: 1 | 2 | 3 | 4
}

export function Heading({ level = 1, className, children, ...props }: HeadingProps) {
    // Mapping levels to exact visual styles based on the new scale
    // h1 -> title-lg (22px)
    // h2 -> title-md (18px)
    // h3 -> title-sm (16px)
    // h4 -> body-md (14px) - strict section headers

    const styles = {
        1: "text-[22px] leading-tight font-medium tracking-[-0.01em]",
        2: "text-[18px] leading-tight font-medium tracking-[-0.01em]",
        3: "text-[16px] leading-normal font-medium tracking-[-0.01em]",
        4: "text-[14px] leading-normal font-medium tracking-normal text-muted-foreground uppercase",
    }

    const headingProps = {
        className: cn(styles[level], className),
        ...props,
    }

    switch (level) {
        case 1:
            return <h1 {...headingProps}>{children}</h1>
        case 2:
            return <h2 {...headingProps}>{children}</h2>
        case 3:
            return <h3 {...headingProps}>{children}</h3>
        case 4:
            return <h4 {...headingProps}>{children}</h4>
    }
}

// -----------------------------------------------------------------------------
// TEXT COMPONENT
// -----------------------------------------------------------------------------

interface TextProps extends React.HTMLAttributes<HTMLParagraphElement> {
    variant?: "body" | "muted" | "small" | "large"
    as?: React.ElementType
}

export function Text({ variant = "body", className, as: Component = "p", children, ...props }: TextProps) {
    // body  -> 14px (Default standard)
    // muted -> 13px (Secondary info)
    // small -> 13px (Dense UI)

    const styles = {
        body: "text-[14px] leading-relaxed font-normal tracking-[-0.005em] text-foreground",
        muted: "text-[13px] leading-relaxed font-normal tracking-[-0.005em] text-muted-foreground",
        small: "text-[13px] leading-snug font-normal tracking-[-0.005em] text-foreground",
        large: "text-[16px] leading-relaxed font-normal tracking-[-0.005em] text-foreground", // Use sparingly
    }

    return (
        <Component className={cn(styles[variant], className)} {...props}>
            {children}
        </Component>
    )
}

// -----------------------------------------------------------------------------
// LABEL COMPONENT
// -----------------------------------------------------------------------------

interface LabelProps extends React.HTMLAttributes<HTMLLabelElement> {
    size?: "sm" | "xs"
    htmlFor?: string
}

export function Label({ size = "sm", className, children, ...props }: LabelProps) {
    // sm -> 12px (Forms, inputs)
    // xs -> 11px (Tiny details, hints)

    const styles = {
        sm: "text-[12px] leading-none font-medium tracking-normal text-foreground/90 pb-1.5 block",
        xs: "text-[11px] leading-none font-medium tracking-normal text-muted-foreground uppercase",
    }

    return (
        <label className={cn(styles[size], className)} {...props}>
            {children}
        </label>
    )
}
