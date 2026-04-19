import { InvoiceBuilder } from "@/features/invoice-builder";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { ChevronLeft } from "lucide-react";

export default function InvoiceTemplatePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/invoice-builder")}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to List
        </Button>
      </div>
      <div className="h-[calc(100vh-180px)] w-full overflow-hidden border border-gray-200 rounded-xl shadow-sm">
        <InvoiceBuilder
          templateId={id}
          apiUrl="/api/InvoiceShape"
          onSaved={() => {
            toast.success("Template Saved successfully!");
            navigate("/invoice-builder");
          }}
        />
      </div>
    </div>
  );
}
