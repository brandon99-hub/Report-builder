"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface TemplateFiltersProps {
    selectedCategory: string
    onCategoryChange: (category: string) => void
}

const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'simple', label: 'Simple' },
    { value: 'modern', label: 'Modern' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'retail', label: 'Retail' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'construction', label: 'Construction' },
    { value: 'professional', label: 'Professional' },
]

export function TemplateFilters({ selectedCategory, onCategoryChange }: TemplateFiltersProps) {
    return (
        <div className="w-full sm:w-64">
            <Select value={selectedCategory} onValueChange={onCategoryChange}>
                <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                    {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                            {category.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    )
}
