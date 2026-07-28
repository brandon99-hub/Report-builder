"use client"

import { useState, useEffect } from "react"
import { generateHtmlPreview } from "@/lib/preview-generator"
import { getTemplateMetadata } from "@/lib/templates"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

interface Template {
  id: string
  name: string
  description: string
}

interface TemplateSelectorProps {
  onSelect: (id: string) => void
  onBack?: () => void
}

const BUILT_IN_TEMPLATES = ["simple", "modern", "corporate"]

export function TemplateSelector({ onSelect, onBack }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewCache, setPreviewCache] = useState<Record<string, string>>({})

  // Generate preview thumbnails for templates
  useEffect(() => {
    if (templates.length > 0) {
      const sampleSchema = {
        companyName: "Acme Corporation",
        companyAddress: "123 Business St\nCity, State 12345",
        invoiceTitle: "Invoice",
        customerName: "John Doe",
        customerAddress: "456 Customer Ave\nCity, State 67890",
        itemColumns: [
          { label: "Description", fieldName: "Description" },
          { label: "Quantity", fieldName: "Quantity" },
          { label: "Price", fieldName: "UnitPrice" },
          { label: "Amount", fieldName: "LineAmount" },
        ],
        totals: [
          { label: "Subtotal", fieldName: "Subtotal" },
          { label: "Tax", fieldName: "Tax" },
          { label: "Total", fieldName: "GrandTotal" },
        ],
        invoiceItems: [
          { description: "Product A", quantity: "2", price: "50.00", amount: "100.00" },
          { description: "Product B", quantity: "1", price: "75.00", amount: "75.00" },
        ],
      }

      const cache: Record<string, string> = {}
      templates.forEach((template) => {
        try {
          const preview = generateHtmlPreview(sampleSchema as any, template.id)
          cache[template.id] = preview
        } catch (err) {
          console.error(`Failed to generate preview for ${template.id}:`, err)
        }
      })
      setPreviewCache(cache)
    }
  }, [templates])

  useEffect(() => {
    // Use built-in templates instead of fetching from API
    const builtInTemplates: Template[] = BUILT_IN_TEMPLATES.map((id) => {
      const metadata = getTemplateMetadata(id)
      return {
        id: metadata.id,
        name: metadata.name,
        description: metadata.description,
      }
    })
    
    setTemplates(builtInTemplates)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full border-4 border-muted border-t-primary animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">Loading templates...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4 font-medium">{error}</p>
          <button onClick={() => window.location.reload()} className="text-primary hover:underline">
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-10">
        {onBack && (
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 -ml-2"
            aria-label="Go back to mode selection"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Choose Your Template</h2>
        <p className="text-slate-600 dark:text-slate-400">Select a professional invoice design to get started</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0">
        {templates.map((template) => {
          // Define template colors
          const colors: Record<string, { gradient: string; icon: string; badge: string }> = {
            simple: {
              gradient: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
              icon: "📊",
              badge: "Popular",
            },
            modern: {
              gradient: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
              icon: "✨",
              badge: "Premium",
            },
            corporate: {
              gradient: "from-slate-100 to-neutral-100 dark:from-slate-800 dark:to-neutral-800",
              icon: "🏢",
              badge: "Enterprise",
            },
          }

          const templateConfig = colors[template.id] || colors.simple

          return (
            <button
              key={template.id}
              onClick={() => onSelect(template.id)}
              className="group text-left transition-all duration-300 hover:scale-105"
              aria-label={`Select ${template.name} template`}
              type="button"
            >
              {/* Card container */}
              <div className="relative overflow-hidden rounded-xl border-2 border-border hover:border-primary/50 bg-card shadow-sm hover:shadow-2xl transition-all duration-300">
                {/* Preview area */}
                <div
                  className={`bg-gradient-to-br ${templateConfig.gradient} aspect-[4/3] relative overflow-hidden`}
                >
                  {previewCache[template.id] ? (
                    <div className="absolute inset-0 p-2">
                      <iframe
                        srcDoc={previewCache[template.id]}
                        className="w-full h-full border-0 rounded-lg bg-white shadow-sm scale-75 origin-top-left"
                        style={{ width: "133%", height: "133%" }}
                        title={`${template.name} Preview`}
                        sandbox="allow-same-origin"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-6">
                      {/* Decorative elements */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-primary rounded-full blur-3xl" />
                      </div>

                      {/* Icon */}
                      <div className="text-6xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                        {templateConfig.icon}
                      </div>

                      {/* Badge */}
                      <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
                        {templateConfig.badge}
                      </div>

                      {/* Template name in preview */}
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{template.name}</p>
                    </div>
                  )}
                </div>

                {/* Content section */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mb-5 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>

                  {/* CTA Button (visual only, outer button handles click) */}
                  <div className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform group-hover:shadow-lg group-active:scale-95">
                    Use Template
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
