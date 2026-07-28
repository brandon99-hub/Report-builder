"use client"

import { useState, useEffect } from 'react'
import { TemplateCard } from './template-card'
import { TemplatePreviewModal } from './template-preview-modal'
import { TemplateFilters } from './template-filters'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Loader2, Search } from 'lucide-react'

interface Template {
    id: string
    name: string
    description: string
    category: string
    tags: string[]
    thumbnail: string
    schema: any
    modules: string[]
    rdlTemplate: string
    author?: string
    version?: string
}

interface TemplateGalleryProps {
    onSelectTemplate: (template: Template) => void
    onClose?: () => void
}

export function TemplateGallery({ onSelectTemplate, onClose }: TemplateGalleryProps) {
    const [templates, setTemplates] = useState<Template[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

    useEffect(() => {
        fetchTemplates()
    }, [selectedCategory, searchQuery])

    const fetchTemplates = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (selectedCategory !== 'all') params.append('category', selectedCategory)
            if (searchQuery) params.append('search', searchQuery)

            const response = await fetch(`/api/templates/external?${params}`)
            const data = await response.json()
            setTemplates(data.templates || [])
        } catch (error) {
            console.error('Failed to fetch templates:', error)
            setTemplates([])
        } finally {
            setLoading(false)
        }
    }

    const handleUseTemplate = (template: Template) => {
        onSelectTemplate(template)
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Template Gallery</h2>
                    <p className="text-muted-foreground">
                        Choose from our collection of professional invoice templates
                    </p>
                </div>
                {onClose && (
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <TemplateFilters
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                />
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search templates..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Loading templates...</span>
                </div>
            )}

            {/* Template Grid */}
            {!loading && templates.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <TemplateCard
                            key={template.id}
                            template={template}
                            onPreview={() => setPreviewTemplate(template)}
                            onUse={() => handleUseTemplate(template)}
                        />
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!loading && templates.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground text-lg">No templates found</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Try adjusting your search or filter criteria
                    </p>
                </div>
            )}

            {/* Preview Modal */}
            {previewTemplate && (
                <TemplatePreviewModal
                    template={previewTemplate}
                    onClose={() => setPreviewTemplate(null)}
                    onUse={() => {
                        handleUseTemplate(previewTemplate)
                        setPreviewTemplate(null)
                    }}
                />
            )}
        </div>
    )
}
