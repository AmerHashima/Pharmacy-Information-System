import type { ProductDto } from "@/types";
import type { PrescriptionMedicine } from "@/api/prescriptionService";

export interface MedicineSelection {
  medicine: PrescriptionMedicine;
  matchedProducts: ProductDto[];
  selectedProduct: ProductDto | null;
  isExpanded: boolean;
  isLoading: boolean;
  searchTerm: string;
}
