import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/* -----------------------------
   HEADING
------------------------------*/
const headingVariants = cva(
    "text-foreground tracking-tight",
    {
        variants: {
            level: {
                1: "text-[22px] font-medium leading-tight",
                2: "text-[18px] font-medium leading-snug",
                3: "text-[16px] font-medium leading-snug",
                4: "text-[14px] font-medium leading-snug",
            },
        },
        defaultVariants: {
            level: 2,
        },
    }
)

export function Heading({
    level,
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement> &
    VariantProps<typeof headingVariants>) {
    const Comp = `h${level}` as any
    return <Comp className={cn(headingVariants({ level }), className)} {...props} />
}

/* -----------------------------
   TEXT
------------------------------*/
const textVariants = cva(
    "tracking-[-0.005em]",
    {
        variants: {
            variant: {
                body: "text-[13px] leading-5 text-foreground",
                bodyMd: "text-[14px] leading-5 text-foreground",
                muted: "text-[13px] leading-5 text-muted-foreground",
                small: "text-[12px] leading-4 text-muted-foreground",
            },
        },
        defaultVariants: {
            variant: "body",
        },
    }
)

export function Text({
    variant,
    className,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement> &
    VariantProps<typeof textVariants>) {
    return <p className={cn(textVariants({ variant }), className)} {...props} />
}

/* -----------------------------
   LABEL
------------------------------*/
export function Label({
    className,
    ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <label
            className={cn(
                "text-[12px] font-medium leading-none text-muted-foreground",
                className
            )}
            {...props}
        />
    )
}
