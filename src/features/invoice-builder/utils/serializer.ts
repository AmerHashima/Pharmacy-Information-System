import type { InvoiceTemplate } from "../types/template.types";
import { renderToStaticMarkup } from "react-dom/server";
import { InvoiceRenderer } from "../renderer/InvoiceRenderer";
import React from "react";
import { useAuthStore } from "@/store/authStore";

export function serializeTemplate(template: InvoiceTemplate): string {
  return JSON.stringify({ ...template, version: template.version ?? 1 });
}

export function deserializeTemplate(json: string): InvoiceTemplate {
  return JSON.parse(json) as InvoiceTemplate;
}

import { invoiceShapeService } from "@/api/invoiceShapeService";
import { systemUserService } from "@/api/systemUserService";
import type { CreateInvoiceShapeDto, UpdateInvoiceShapeDto } from "@/types";

export async function saveTemplate(
  template: InvoiceTemplate,
  _apiUrl: string, // Keeping for backward compatibility if needed, but using service
): Promise<InvoiceTemplate> {
  const htmlContent = renderToStaticMarkup(
    React.createElement(InvoiceRenderer, { template }),
  );

  const user = useAuthStore.getState().user;
  let branchID = user?.defaultBranchId || user?.branchId || "5b4badcc-7088-49bb-a034-c3c6a9409b8b";

  if (user?.oid) {
    try {
      const res = await systemUserService.getById(user.oid);
      if (res.data.success && res.data.data) {
        const fetchedUser = res.data.data;
        if (fetchedUser.defaultBranchId) {
          branchID = fetchedUser.defaultBranchId;
        } else if (fetchedUser.branchId) {
          branchID = fetchedUser.branchId;
        }
      }
    } catch (err) {
      console.error("Failed to fetch user details for default branch:", err);
    }
  }

  const payload = {
    shapeName: template.name || "Untitled Template",
    htmlContent: htmlContent,
    defaultPrint: true,
    isActive: true,
    branchID: branchID,
    status: 0,
  };

  if (template.id) {
    const res = await invoiceShapeService.update(template.id, {
      ...payload,
      oid: template.id,
    } as UpdateInvoiceShapeDto);
    return { ...template, ...res.data.data };
  } else {
    const res = await invoiceShapeService.create(
      payload as CreateInvoiceShapeDto,
    );
    const savedDto = res.data.data;
    return {
      ...template,
      id: savedDto.oid,
      name: savedDto.shapeName,
    };
  }
}
