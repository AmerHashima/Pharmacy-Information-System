import { useEffect, useState } from 'react'
import { DndContext, DragOverlay, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { BlockSidebar } from './BlockSidebar'
import { BuilderCanvas } from './BuilderCanvas'
import { PropertiesPanel } from './PropertiesPanel'
import { InvoiceRenderer } from '../renderer/InvoiceRenderer'
import { useTemplateStore } from '../store/templateStore'
import { createBlock } from '../utils/blockDefaults'
import { saveTemplate } from '../utils/serializer'
import type { InvoiceTemplate } from '../types/template.types'
import { Save, Eye, EyeOff } from 'lucide-react'
import { invoiceShapeService } from '@/api/invoiceShapeService'

interface InvoiceBuilderProps {
  templateId?: string
  apiUrl: string
  onSaved?: (template: InvoiceTemplate) => void
}

export function InvoiceBuilder({ templateId, apiUrl, onSaved }: InvoiceBuilderProps) {
  const [isPreview, setIsPreview] = useState(false)
  const [activeDragType, setActiveDragType] = useState<string | null>(null)
  
  const { 
    template, 
    isDirty, 
    isSaving,
    setTemplateName, 
    loadTemplate, 
    addBlock, 
    reorderBlocks,
    setSaving,
    markClean
  } = useTemplateStore()

  useEffect(() => {
    if (templateId) {
      invoiceShapeService.getById(templateId)
        .then(res => {
          if (res.data.success) {
            // Mapping back from DTO to builder format
            const dto = res.data.data;
            loadTemplate({
              id: dto.oid,
              name: dto.shapeName,
              version: 1, // Assumption
              meta: {
                paperSize: 'A4',
                margins: { top: 40, right: 40, bottom: 40, left: 40 },
                primaryColor: '#1a1a2e',
                currency: 'USD',
              },
              blocks: [], // We don't have blocks in the API yet, so we load empty or we'd need to parse html
            });
          }
        })
        .catch(err => console.error("Failed to load template", err))
    }
  }, [templateId, loadTemplate])

  const handleSave = async () => {
    setSaving(true)
    try {
      const saved = await saveTemplate(template, apiUrl)
      markClean()
      if (onSaved) onSaved(saved)
    } catch (err) {
      console.error(err)
      alert("Failed to save template")
    } finally {
      setSaving(false)
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: any) => {
    const { active } = event
    if (active.data.current?.type === 'BlockType') {
      setActiveDragType(active.data.current.blockType)
    } else {
      setActiveDragType('existingBlock') // sorting an existing block
    }
  }

  const handleDragEnd = (event: any) => {
    const { active, over } = event
    setActiveDragType(null)
    
    if (!over) return

    // Adding a new block from the sidebar
    if (active.data.current?.type === 'BlockType') {
      const blockType = active.data.current.blockType
      const newBlock = createBlock(blockType)
      
      if (over.data.current?.type === 'Column') {
        const columnId = over.data.current.columnId
        addBlock(newBlock, undefined, columnId)
      } else if (over.id === 'canvas-root') {
        addBlock(newBlock)
      } else {
        // dropped over an existing block, append after it within the same scope
        addBlock(newBlock, over.id, over.data.current?.parentColumnId)
      }
      return
    }

    // Reordering existing blocks
    if (active.id !== over.id) {
      const parentColumnId = active.data.current?.parentColumnId
      const overParentColumnId = over.data.current?.parentColumnId
      
      // Basic implementation for sorting within the same parent
      if (parentColumnId === overParentColumnId) {
        let list = template.blocks
        if (parentColumnId) {
          // Find the list
          for (const topB of template.blocks) {
             if (topB.type === 'columns') {
               const col = topB.columns.find(c => c.id === parentColumnId)
               if (col) { list = col.blocks; break }
             }
          }
        }
        
        const oldIndex = list.findIndex(b => b.id === active.id)
        const newIndex = list.findIndex(b => b.id === over.id)
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = [...list]
          const [moved] = newOrder.splice(oldIndex, 1)
          newOrder.splice(newIndex, 0, moved)
          reorderBlocks(newOrder.map(b => b.id), parentColumnId)
        }
      }
    }
  }

  // Pre-fill fake data for Preview mode
  const previewData = {
    invoiceNumber: 'INV-2023-001',
    date: new Date().toLocaleDateString(),
    dueDate: new Date(Date.now() + 86400000 * 30).toLocaleDateString(),
    from: { name: 'My Company', address: '123 Main St', email: 'hello@company.com' },
    to: { name: 'Client Corp', address: '456 Business Rd', email: 'billing@client.com' },
    notes: 'Thank you for your business.',
    lineItems: [
      { description: 'Consulting Services', quantity: 10, unitPrice: 150, total: 1500 },
      { description: 'Software License', quantity: 1, unitPrice: 500, total: 500 }
    ],
    logoUrl: 'https://via.placeholder.com/150x50.png?text=LOGO'
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-100 text-gray-900 font-sans">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-4 w-1/3">
          <input 
            type="text"
            className="text-lg font-semibold border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none w-full max-w-[300px]"
            value={template.name}
            onChange={(e) => setTemplateName(e.target.value)}
            placeholder="Template Name"
          />
          {isDirty && <span className="text-xs text-amber-500 font-medium bg-amber-50 px-2 py-0.5 rounded">Unsaved Changes</span>}
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsPreview(!isPreview)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100 transition-colors"
          >
            {isPreview ? <><EyeOff className="w-4 h-4"/> Edit Mode</> : <><Eye className="w-4 h-4"/> Preview</>}
          </button>
          
          <button 
            onClick={handleSave}
            disabled={!isDirty || isSaving}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Template'}
          </button>
        </div>
      </div>

      {isPreview ? (
        <div className="flex-1 overflow-y-auto p-8 flex items-start justify-center">
          <div className="shadow-xl">
             <InvoiceRenderer template={template} data={previewData} />
          </div>
        </div>
      ) : (
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex flex-1 overflow-hidden">
            <BlockSidebar />
            <BuilderCanvas />
            <PropertiesPanel />
          </div>
          
          <DragOverlay>
            {activeDragType === 'title' ? <div className="p-2 border border-blue-500 bg-white opacity-80 rounded">Title Block</div> : null}
            {activeDragType === 'text' ? <div className="p-2 border border-blue-500 bg-white opacity-80 rounded">Text Block</div> : null}
            {activeDragType === 'columns' ? <div className="p-2 border border-blue-500 bg-white opacity-80 rounded">Columns Block</div> : null}
            {activeDragType === 'table' ? <div className="p-2 border border-blue-500 bg-white opacity-80 rounded">Table Block</div> : null}
            {activeDragType === 'divider' ? <div className="p-2 border border-blue-500 bg-white opacity-80 rounded">Divider Block</div> : null}
            {activeDragType === 'spacer' ? <div className="p-2 border border-blue-500 bg-white opacity-80 rounded">Spacer Block</div> : null}
            {activeDragType === 'header-meta' ? <div className="p-2 border border-blue-500 bg-white opacity-80 rounded">Header Meta Block</div> : null}
            {activeDragType === 'existingBlock' ? <div className="p-4 border-2 border-dashed border-blue-500 bg-white opacity-50 rounded">Moving Block...</div> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}
