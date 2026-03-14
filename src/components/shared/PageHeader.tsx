import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import Button from "../ui/Button";
import { Plus, ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  onAddClick?: () => void;
  onBack?: () => void;
  addLabel?: string;
  children?: React.ReactNode;
}

export default function PageHeader({
  title,
  onAddClick,
  onBack,
  addLabel,
  children,
}: PageHeaderProps) {
  const { t } = useTranslation();
  const [portalNode, setPortalNode] = useState<HTMLElement | null>(() =>
    typeof document !== "undefined"
      ? document.getElementById("page-header-portal")
      : null,
  );

  useEffect(() => {
    if (!portalNode) {
      const node = document.getElementById("page-header-portal");
      if (node) setPortalNode(node);
    }
  }, [portalNode]);

  const content = (
    <div className="flex flex-1 items-center justify-between gap-3 w-full animate-in fade-in duration-300">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors border-none"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Button>
        )}
        <div className="min-w-0 pr-4">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 truncate">
            {title}
          </h1>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {children}
        {onAddClick && (
          <Button onClick={onAddClick} className="gap-2" size="sm">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">
              {addLabel || t("common:addNew")}
            </span>
          </Button>
        )}
      </div>
    </div>
  );

  // If the portal node is found, render into it.
  // Otherwise, fallback to the original layout (e.g., if used outside AppLayout).
  if (portalNode) {
    return createPortal(content, portalNode);
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
      <div className="flex items-center gap-2">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack} className="p-1">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {children}
        {onAddClick && (
          <Button onClick={onAddClick} className="gap-2">
            <Plus className="h-4 w-4" />
            {addLabel || t("common:addNew")}
          </Button>
        )}
      </div>
    </div>
  );
}
