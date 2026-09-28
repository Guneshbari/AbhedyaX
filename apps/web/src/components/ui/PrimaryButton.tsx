import React from "react";
import Link from "next/link";
import { LucideIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
  href?: string;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  icon: Icon,
  iconPosition = "left",
  isLoading = false,
  href,
  className,
  disabled,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-150 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2.5",
  };

  const variantStyles = {
    primary:
      "bg-blue-600 hover:bg-blue-500 text-white shadow-sm border border-blue-500/50 hover:border-blue-400",
    secondary:
      "bg-[#141820] hover:bg-[#1A202C] text-[#F4F7FA] border border-[#252B35] hover:border-[#3B82F6]/50",
    outline:
      "bg-transparent hover:bg-[#141820] text-[#9AA4B2] hover:text-[#F4F7FA] border border-[#252B35]",
    ghost:
      "bg-transparent hover:bg-[#141820] text-[#9AA4B2] hover:text-[#F4F7FA]",
    danger:
      "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30",
  };

  const combinedClasses = cn(
    baseStyles,
    sizeStyles[size],
    variantStyles[variant],
    className
  );

  const content = (
    <>
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-current" />
      ) : (
        Icon && iconPosition === "left" && <Icon className="w-4 h-4 text-current" />
      )}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === "right" && (
        <Icon className="w-4 h-4 text-current" />
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={combinedClasses}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={combinedClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {content}
    </button>
  );
};
