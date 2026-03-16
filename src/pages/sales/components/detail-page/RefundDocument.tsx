import { forwardRef } from "react";
import Card from "@/components/ui/Card";
import { ReturnInvoiceDto } from "@/types";
import RefundDocumentHeader from "./RefundDocumentHeader";
import RefundItemsTable from "./RefundItemsTable";
import InvoiceFooter from "./InvoiceFooter";

interface RefundDocumentProps {
  refund: ReturnInvoiceDto;
}

const RefundDocument = forwardRef<HTMLDivElement, RefundDocumentProps>(
  ({ refund }, ref) => {
    return (
      <Card
        ref={ref}
        className="overflow-hidden border-none shadow-2xl shadow-gray-200/50 bg-white print:shadow-none print:w-full"
      >
        <RefundDocumentHeader refund={refund} />

        <div className="p-8 sm:p-10 space-y-10">
          <RefundItemsTable refund={refund} />
          <InvoiceFooter />
        </div>
      </Card>
    );
  },
);

RefundDocument.displayName = "RefundDocument";

export default RefundDocument;
