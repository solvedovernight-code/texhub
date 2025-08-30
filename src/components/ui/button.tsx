import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";
import { forwardRef } from "react";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-white shadow hover:bg-primary/90",
        secondary: "bg-secondary text-white shadow-sm hover:bg-secondary/80",
        ghost: "text-text hover:bg-surface/80 hover:text-text", // Added default text-text for visibility
        link: "text-primary underline-offset-4 hover:underline",
        outline: "border border-border bg-surface text-textSecondary hover:bg-surface/80 hover:text-text",
        destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700", // Updated destructive variant
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-4 w-4", // Standardized icon size for consistent row height
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
