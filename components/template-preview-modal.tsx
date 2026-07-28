"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'

interface Template {
    id: string
    name: string
    description: string
    category: string
    tags: string[]
    thumbnail: string
    author?: string
    version?: string
    schema?: any
}

interface TemplatePreviewModalProps {
    template: Template
    onClose: () => void
    onUse: () => void
}

export function TemplatePreviewModal({ template, onClose, onUse }: TemplatePreviewModalProps) {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{template.name}</DialogTitle>
                    <DialogDescription>{template.description}</DialogDescription>
                </DialogHeader>

                <ScrollArea className="max-h-[60vh]">
                    <div className="space-y-4">
                        {/* Preview Image */}
                        <div className="border rounded-lg overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                            {template.thumbnail ? (
                                <img
                                    src={template.thumbnail}
                                    alt={template.name}
                                    className="w-full"
                                />
                            ) : (
                                <div className="w-full aspect-[4/3] flex items-center justify-center">
                                    <div className="text-9xl">📄</div>
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-semibold mb-2">Category & Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                    <Badge className="capitalize">{template.category}</Badge>
                                    {template.tags.map((tag) => (
                                        <Badge key={tag} variant="outline">{tag}</Badge>
                                    ))}
                                </div>
                            </div>

                            {(template.author || template.version) && (
                                <div className="text-sm text-muted-foreground space-y-1">
                                    {template.author && <p>Author: {template.author}</p>}
                                    {template.version && <p>Version: {template.version}</p>}
                                </div>
                            )}

                            {template.schema && (
                                <div>
                                    <h4 className="font-semibold mb-2">Template Features</h4>
                                    <ul className="text-sm text-muted-foreground space-y-1">
                                        {template.schema.itemColumns && (
                                            <li>• {template.schema.itemColumns.length} item columns</li>
                                        )}
                                        {template.schema.totals && (
                                            <li>• {template.schema.totals.length} total fields</li>
                                        )}
                                        {template.schema.modules && (
                                            <li>• Includes: {template.schema.modules.join(', ')}</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button onClick={onUse}>
                        Use This Template
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
