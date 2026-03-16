import { forwardRef } from "react";
import { format } from "date-fns";
import { SalesInvoiceDto } from "@/types";

interface PrintableInvoiceProps {
  invoice: SalesInvoiceDto;
}

const PrintableInvoice = forwardRef<HTMLDivElement, PrintableInvoiceProps>(
  ({ invoice }, ref) => {
    const subtotal = (invoice.totalAmount || 0) - (invoice.taxAmount || 0);

    const headerInfo = [
      { labelEn: "Branch", labelAr: "فرع", value: invoice.branchName || "---" },
      { labelEn: "Phone", labelAr: "تليفون", value: "---" },
      { labelEn: "Address", labelAr: "عنوان1", value: "---" },
      {
        labelEn: "Date",
        labelAr: "التاريخ",
        value: invoice.invoiceDate
          ? format(new Date(invoice.invoiceDate), "yyyy/MM/dd h:mm:ss a")
          : "---",
      },
      { labelEn: "Tax No.", labelAr: "ر. ضريبي", value: "311228090100003" },
      { labelEn: "CR.No.", labelAr: "س.تجاري", value: "2051043044" },
      {
        labelEn: "Cashier",
        labelAr: "الكاشير",
        value: invoice.createdByName || "---",
      },
    ];

    return (
      <div
        ref={ref}
        className="hidden print:block bg-white text-black p-4 space-y-4 text-xs font-sans w-full"
        style={{ direction: "ltr" }}
      >
        {/* Company Name */}
        {/* <div className="text-center space-y-1">
          <h2 className="text-sm font-bold uppercase">
            شركة معجنات الشلال لتقديم الوجبات
          </h2>
          <h3 className="text-xs font-bold uppercase">فرع الجامعيين</h3>
        </div> */}

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 mt-4">
          {headerInfo.map((info, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center border-b border-gray-100 py-0.5"
            >
              <div className="flex gap-2">
                <span className="font-bold w-16">{info.labelEn}</span>
                <span className="font-medium">{info.value}</span>
              </div>
              <span
                className="font-bold text-right w-16"
                style={{ direction: "rtl" }}
              >
                {info.labelAr}
              </span>
            </div>
          ))}
        </div>

        {/* Title */}
        <div className="text-center border-y-2 border-black py-1 mt-4">
          <h1 className="text-xs font-bold">
            Simplified Tax Invoice - فاتورة ضريبية مبسطة
          </h1>
        </div>

        {/* Order Info */}
        <div className="text-center space-y-1 py-2">
          <div className="font-bold">{invoice.invoiceNumber}</div>
          <div className="font-bold text-sm">Take Away - تيك اوى</div>
        </div>

        {/* Ticket Number */}
        <div className="text-center border-y-2 border-black py-2">
          <div className="text-2xl font-black">
            Tckt:{invoice.invoiceNumber?.split("-").pop() || "0"}
          </div>
        </div>

        {/* Table Headers */}
        <div className="grid grid-cols-12 border-b-2 border-black py-1 font-bold text-center mt-4">
          <div className="col-span-2 flex flex-col items-center">
            <span style={{ direction: "rtl" }}>عدد</span>
            <span>Qty</span>
          </div>
          <div className="col-span-6 flex flex-col items-center">
            <span style={{ direction: "rtl" }}>المنتجات</span>
            <span>Products</span>
          </div>
          <div className="col-span-2 flex flex-col items-center">
            <span style={{ direction: "rtl" }}>سعر</span>
            <span>Price</span>
          </div>
          <div className="col-span-2 flex flex-col items-center">
            <span style={{ direction: "rtl" }}>اجمالي</span>
            <span>Amnt</span>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y border-b border-black">
          {invoice.items?.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-12 py-1 text-center items-center"
            >
              <div className="col-span-2">{item.quantity}</div>
              <div className="col-span-6 text-left px-2">
                <div className="font-medium">{item.productName}</div>
                <div className="text-[10px] text-gray-500">.</div>
              </div>
              <div className="col-span-2">{item.unitPrice?.toFixed(2)}</div>
              <div className="col-span-2">{item.totalPrice?.toFixed(2)}</div>
            </div>
          ))}
        </div>

        {/* Totals Section */}
        <div className="space-y-1 mt-4">
          <div className="flex justify-between items-center border-b border-black py-0.5">
            <div className="flex gap-4">
              <span className="font-bold w-32">Total exclusive vat</span>
              <span className="font-bold">{subtotal.toFixed(2)}</span>
            </div>
            <span className="font-bold text-right" style={{ direction: "rtl" }}>
              المبلغ الخاضع للضريبة
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-black py-0.5">
            {/* <div className="flex gap-4">
              <span className="font-bold w-32">Total vat (15%)</span>
              <span className="font-bold">{invoice.taxAmount?.toFixed(2)}</span>
            </div> */}
            {/* <span className="font-bold text-right" style={{ direction: "rtl" }}>
              قيمة الضريبة (15%)
            </span> */}
          </div>
          <div className="flex justify-between items-center py-2">
            <div className="flex gap-4 text-sm">
              <span className="font-black w-32">Amount with vat</span>
              <span className="font-black underline decoration-double">
                {invoice.totalAmount?.toFixed(2)}
              </span>
            </div>
            <span
              className="font-black text-sm text-right"
              style={{ direction: "rtl" }}
            >
              المجموع مع الضريبة
            </span>
          </div>
        </div>

        {/* Payment Section */}
        <div className="space-y-1 pt-4 border-t-2 border-dashed border-black">
          <div className="flex justify-between items-center border-b border-black py-0.5">
            <div className="flex gap-4">
              <span className="font-bold w-32">Cash</span>
              <span className="font-bold">
                {invoice.totalAmount?.toFixed(2)}
              </span>
            </div>
            <span className="font-bold text-right" style={{ direction: "rtl" }}>
              نقدي
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-black py-0.5">
            <div className="flex gap-4">
              <span className="font-bold w-32">Paid</span>
              <span className="font-bold">
                {invoice.totalAmount?.toFixed(2)}
              </span>
            </div>
            <span className="font-bold text-right" style={{ direction: "rtl" }}>
              المدفوع
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-black py-0.5">
            <div className="flex gap-4">
              <span className="font-bold w-32">Rest</span>
              <span className="font-bold">0.00</span>
            </div>
            <span className="font-bold text-right" style={{ direction: "rtl" }}>
              المتبقي
            </span>
          </div>
        </div>

        {/* QR Code Placeholder */}
        <div className="flex justify-center pt-6 pb-4">
          <div className="w-32 h-32 border-2 border-black flex items-center justify-center bg-gray-50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.qr-code-generator.com/wp-content/themes/qr/new_structure/markets/core_market/generator/dist/generator/assets/images/dynamic-qr-code.png')] bg-cover"></div>
            <span className="font-bold text-[10px] z-10 text-center px-1">
              QR CODE PLACEHOLDER
            </span>
          </div>
        </div>

        {/* Footer */}
        <div
          className="text-center pt-4 border-t-2 border-black font-bold text-[10px]"
          style={{ direction: "rtl" }}
        >
          جميع الاسعار تشمل ضريبة القيمة المضافة شكرا لزيارتكم ,, نراكم قريبا -1
        </div>
      </div>
    );
  },
);

PrintableInvoice.displayName = "PrintableInvoice";

export default PrintableInvoice;
