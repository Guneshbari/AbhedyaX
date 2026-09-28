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
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center",
        "border-2 border-dashed border-black bg-white shadow-[4px_4px_0px_0px_#000]",
        className
      )}
    >
      <div className="p-3.5 bg-[#FFE600] border-2 border-black shadow-[2px_2px_0px_0px_#000] text-black mb-4">
        <Icon className="w-6 h-6 stroke-[2.5]" />
      </div>

      <h3 className="text-base font-black text-black mb-1">{title}</h3>
      <p className="text-sm text-zinc-700 max-w-sm mb-6 leading-relaxed font-medium">
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
