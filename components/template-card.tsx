"use client"

import { Card } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Eye, Download } from 'lucide-react'

interface Template {
    id: string
    name: string
    description: string
    category: string
    tags: string[]
    thumbnail: string
    author?: string
    version?: string
}

interface TemplateCardProps {
    template: Template
    onPreview: () => void
    onUse: () => void
}

export function TemplateCard({ template, onPreview, onUse }: TemplateCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
            {/* Thumbnail */}
            <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden">
                {template.thumbnail ? (
                    <img
                        src={template.thumbnail}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="text-6xl">📄</div>
                    </div>
                )}

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
                <div>
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{template.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {template.description}
                    </p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary" className="text-xs capitalize">
                        {template.category}
                    </Badge>
                    {template.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                    {template.tags.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 2}
                        </Badge>
                    )}
                </div>

                {/* Author info */}
                {template.author && (
                    <p className="text-xs text-muted-foreground">
                        By {template.author}
                    </p>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onPreview}
                        className="flex-1"
                    >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                    </Button>
                    <Button
                        size="sm"
                        onClick={onUse}
                        className="flex-1"
                    >
                        <Download className="h-4 w-4 mr-1" />
                        Use Template
                    </Button>
                </div>
            </div>
        </Card>
    )
}
