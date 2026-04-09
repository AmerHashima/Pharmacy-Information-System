import type { InvoiceTemplate } from '../types/template.types'
import { renderToStaticMarkup } from 'react-dom/server'
import { InvoiceRenderer } from '../renderer/InvoiceRenderer'
import React from 'react'

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

  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'text/html' },
    body: htmlContent,
  })

  if (!res.ok) throw new Error(`Failed to save template: ${res.statusText}`)
  
  try {
    return await res.json()
  } catch (e) {
    return template
  }
}
