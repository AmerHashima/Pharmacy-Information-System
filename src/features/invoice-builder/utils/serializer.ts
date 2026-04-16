import type { InvoiceTemplate } from '../types/template.types'
import { renderToStaticMarkup } from 'react-dom/server'
import { InvoiceRenderer } from '../renderer/InvoiceRenderer'
import React from 'react'
import { useAuthStore } from '@/store/authStore'

export function serializeTemplate(template: InvoiceTemplate): string {
  return JSON.stringify({ ...template, version: (template.version ?? 1) })
}

export function deserializeTemplate(json: string): InvoiceTemplate {
  return JSON.parse(json) as InvoiceTemplate
}

export async function saveTemplate(
  template: InvoiceTemplate,
  apiUrl: string
): Promise<InvoiceTemplate> {
  const method = template.id ? 'PUT' : 'POST'
  const url = template.id ? `${apiUrl}/${template.id}` : apiUrl

  const htmlContent = renderToStaticMarkup(
    React.createElement(InvoiceRenderer, { template })
  )

  const user = useAuthStore.getState().user
  const branchID = user?.branchId || "3fa85f64-5717-4562-b3fc-2c963f66afa6"

  const payload = {
    shapeName: template.name || "Untitled Template",
    htmlContent: htmlContent,
    defaultPrint: true,
    isActive: true,
    branchID: branchID,
    status: 0
  }

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) throw new Error(`Failed to save template: ${res.statusText}`)
  
  try {
    return await res.json()
  } catch (e) {
    return template
  }
}
