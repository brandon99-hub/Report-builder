export interface TemplateComment {
  id: string
  templateId: string
  userId: string
  userName: string
  comment: string
  timestamp: number
  resolved?: boolean
}

export interface TemplateShare {
  templateId: string
  sharedWith: string[]
  permissions: "view" | "edit" | "admin"
  sharedBy: string
  timestamp: number
}

export interface ApprovalRequest {
  id: string
  templateId: string
  requestedBy: string
  requestedAt: number
  status: "pending" | "approved" | "rejected"
  approvedBy?: string
  approvedAt?: number
  comments?: string
}

const COLLAB_STORAGE_KEY = "invoice_collaboration"

// Share template with users
export function shareTemplate(share: TemplateShare): void {
  try {
    const shares = getSharedTemplates()
    shares.push(share)
    localStorage.setItem(COLLAB_STORAGE_KEY, JSON.stringify(shares))
  } catch (error) {
    console.error("Failed to share template:", error)
  }
}

// Get shared templates
export function getSharedTemplates(): TemplateShare[] {
  try {
    const stored = localStorage.getItem(COLLAB_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Failed to load shared templates:", error)
  }
  return []
}

// Add comment to template
export function addComment(comment: TemplateComment): void {
  try {
    const comments = getTemplateComments(comment.templateId)
    comments.push(comment)
    localStorage.setItem(`template_comments_${comment.templateId}`, JSON.stringify(comments))
  } catch (error) {
    console.error("Failed to add comment:", error)
  }
}

// Get comments for template
export function getTemplateComments(templateId: string): TemplateComment[] {
  try {
    const stored = localStorage.getItem(`template_comments_${templateId}`)
    if (stored) {
      return JSON.parse(stored).sort((a: TemplateComment, b: TemplateComment) => b.timestamp - a.timestamp)
    }
  } catch (error) {
    console.error("Failed to load comments:", error)
  }
  return []
}

// Create approval request
export function createApprovalRequest(request: ApprovalRequest): void {
  try {
    const requests = getApprovalRequests()
    requests.push(request)
    localStorage.setItem("approval_requests", JSON.stringify(requests))
  } catch (error) {
    console.error("Failed to create approval request:", error)
  }
}

// Get approval requests
export function getApprovalRequests(): ApprovalRequest[] {
  try {
    const stored = localStorage.getItem("approval_requests")
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error("Failed to load approval requests:", error)
  }
  return []
}

// Update approval request status
export function updateApprovalRequest(
  requestId: string,
  status: "approved" | "rejected",
  approvedBy: string,
  comments?: string
): void {
  try {
    const requests = getApprovalRequests()
    const request = requests.find((r) => r.id === requestId)
    if (request) {
      request.status = status
      request.approvedBy = approvedBy
      request.approvedAt = Date.now()
      if (comments) {
        request.comments = comments
      }
      localStorage.setItem("approval_requests", JSON.stringify(requests))
    }
  } catch (error) {
    console.error("Failed to update approval request:", error)
  }
}

