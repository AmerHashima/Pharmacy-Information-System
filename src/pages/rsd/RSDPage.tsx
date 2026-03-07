import { useTranslation } from "react-i18next";
import Card from "@/components/ui/Card";
import { ShieldCheck } from "lucide-react";

export default function RSDPage() {
  const { t } = useTranslation("sidebar");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl shadow-sm">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-gray-900">
              {t("rsd")}
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Drug Track and Trace System Implementation
            </p>
          </div>
        </div>
      </div>

      <Card className="p-8 border-none shadow-lg bg-white rounded-3xl flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 mb-2">
          <ShieldCheck size={40} />
        </div>
        <h2 className="text-xl font-bold text-gray-800">RSD Module (رصد)</h2>
        <p className="text-gray-500 max-w-md mx-auto">
          This module will handle the integration with the Drug Track and Trace
          System (RSD). Features like notifications, compliance tracking, and
          automated reporting will be available here soon.
        </p>
      </Card>
    </div>
  );
}
