import React from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrimaryButton } from "./PrimaryButton";

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  actionHref?: string;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionText,
  onAction,
  actionHref,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl",
        "border border-dashed border-[#252B35] bg-[#0F1218]/50",
        className
      )}
    >
      <div className="p-3.5 rounded-full bg-[#141820] border border-[#252B35] text-[#9AA4B2] mb-4">
        <Icon className="w-6 h-6 text-blue-400" />
      </div>

      <h3 className="text-base font-semibold text-[#F4F7FA] mb-1">{title}</h3>
      <p className="text-sm text-[#9AA4B2] max-w-sm mb-6 leading-relaxed">
        {description}
      </p>

      {actionText && (
        <PrimaryButton
          variant="secondary"
          size="sm"
          onClick={onAction}
          href={actionHref}
        >
          {actionText}
        </PrimaryButton>
      )}
    </div>
  );
};
