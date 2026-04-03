import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Hash } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface SerialNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  quantity: number;
  initialSerials: string[];
  productName: string;
  onSave: (serials: string[]) => void;
}

export default function SerialNumberModal({
  isOpen,
  onClose,
  quantity,
  initialSerials,
  productName,
  onSave,
}: SerialNumberModalProps) {
  const { t } = useTranslation("sales");
  const [serials, setSerials] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Initialize serials array with correct length
      const newSerials = [...initialSerials];
      while (newSerials.length < Math.floor(quantity)) {
        newSerials.push("");
      }
      setSerials(newSerials.slice(0, Math.floor(quantity)));
    }
  }, [isOpen, initialSerials, quantity]);

  const handleSerialChange = (index: number, value: string) => {
    const updated = [...serials];
    updated[index] = value;
    setSerials(updated);
  };

  const handleConfirm = () => {
    // Filter out empty strings if necessary or keep them?
    // User probably wants to save exactly what's entered
    onSave(serials.filter(s => s.trim() !== ""));
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${t("enter_serials")} - ${productName}`}
      size="md"
    >
      <div className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-lg flex items-start gap-2 text-blue-700 text-sm">
          <Hash className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            {t("serial_notice", {
              count: Math.floor(quantity),
              defaultValue: `Please enter up to ${Math.floor(quantity)} serial numbers for this item.`,
            })}
          </p>
        </div>

        <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {Array.from({ length: Math.floor(quantity) }).map((_, idx) => (
            <div key={idx} className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                {t("unit")} {idx + 1}
              </label>
              <Input
                placeholder={`${t("serialNumber")}...`}
                value={serials[idx] || ""}
                onChange={(e) => handleSerialChange(idx, e.target.value)}
                className="focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            {t("cancel")}
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            {t("confirm")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
