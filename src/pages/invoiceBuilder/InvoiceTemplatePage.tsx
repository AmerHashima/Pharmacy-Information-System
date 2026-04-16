import { InvoiceBuilder } from "@/features/invoice-builder";

export default function InvoiceTemplatePage() {
  return (
    <div className="h-[calc(100vh-120px)] w-full overflow-hidden border border-gray-200 rounded-xl shadow-sm">
      <InvoiceBuilder
        apiUrl="/api/InvoiceShape"
        onSaved={(template) => {
          console.log("Template Saved successfully!", template);
          alert("Template Saved!");
        }}
      />
    </div>
  );
}
