import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ArrowLeft, Printer } from "lucide-react";
import Button from "@/components/ui/Button";

interface RefundDetailHeaderProps {
  onPrint: () => void;
}

export default function RefundDetailHeader({
  onPrint,
}: RefundDetailHeaderProps) {
  const { t } = useTranslation("sales");

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100">
      <Link to="/sales">
        <Button
          variant="ghost"
          className="gap-2 text-gray-600 hover:text-gray-900 hover:bg-white transition-all"
        >
          <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
          {t("back_to_sales")}
        </Button>
      </Link>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <Button
          onClick={onPrint}
          variant="primary"
          className="gap-2 shadow-lg shadow-primary-600/20 w-full sm:w-auto transition-all hover:-translate-y-0.5 font-bold"
        >
          <Printer className="h-4 w-4" />
          {t("print_refund", { defaultValue: "Print Refund" })}
        </Button>
      </div>
    </div>
  );
}
