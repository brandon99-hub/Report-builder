"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  shareTemplate,
  addComment,
  getTemplateComments,
  createApprovalRequest,
  getApprovalRequests,
  updateApprovalRequest,
  type TemplateComment,
  type ApprovalRequest,
} from "@/lib/collaboration"
import { toast } from "sonner"

interface CollaborationPanelProps {
  templateId: string
}

export function CollaborationPanel({ templateId }: CollaborationPanelProps) {
  const [activeTab, setActiveTab] = useState<"share" | "comments" | "approval">("share")
  const [shareEmail, setShareEmail] = useState("")
  const [sharePermission, setSharePermission] = useState<"view" | "edit" | "admin">("view")
  const [commentText, setCommentText] = useState("")
  const [userName] = useState("Current User") // In real app, get from auth
  const [comments, setComments] = useState<TemplateComment[]>(getTemplateComments(templateId))
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>(getApprovalRequests())

  const handleShare = () => {
    if (!shareEmail.trim()) {
      toast.error("Please enter an email address")
      return
    }

    shareTemplate({
      templateId,
      sharedWith: [shareEmail],
      permissions: sharePermission,
      sharedBy: userName,
      timestamp: Date.now(),
    })

    toast.success(`Template shared with ${shareEmail}`)
    setShareEmail("")
  }

  const handleAddComment = () => {
    if (!commentText.trim()) {
      toast.error("Please enter a comment")
      return
    }

    const comment: TemplateComment = {
      id: `comment_${Date.now()}`,
      templateId,
      userId: "user1",
      userName,
      comment: commentText,
      timestamp: Date.now(),
    }

    addComment(comment)
    setComments([...comments, comment])
    setCommentText("")
    toast.success("Comment added")
  }

  const handleRequestApproval = () => {
    const request: ApprovalRequest = {
      id: `approval_${Date.now()}`,
      templateId,
      requestedBy: userName,
      requestedAt: Date.now(),
      status: "pending",
    }

    createApprovalRequest(request)
    setApprovalRequests([...approvalRequests, request])
    toast.success("Approval request created")
  }

  const handleApprove = (requestId: string) => {
    updateApprovalRequest(requestId, "approved", userName)
    setApprovalRequests(getApprovalRequests())
    toast.success("Request approved")
  }

  const handleReject = (requestId: string) => {
    updateApprovalRequest(requestId, "rejected", userName)
    setApprovalRequests(getApprovalRequests())
    toast.success("Request rejected")
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Collaboration</h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b">
        <button
          onClick={() => setActiveTab("share")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "share" ? "border-b-2 border-primary text-primary" : "text-slate-600"
          }`}
          aria-label="Share template tab"
        >
          Share
        </button>
        <button
          onClick={() => setActiveTab("comments")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "comments" ? "border-b-2 border-primary text-primary" : "text-slate-600"
          }`}
          aria-label="Comments tab"
        >
          Comments
        </button>
        <button
          onClick={() => setActiveTab("approval")}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === "approval" ? "border-b-2 border-primary text-primary" : "text-slate-600"
          }`}
          aria-label="Approval workflow tab"
        >
          Approval
        </button>
      </div>

      {/* Share Tab */}
      {activeTab === "share" && (
        <div className="space-y-4">
          <div>
            <label htmlFor="share-email" className="text-sm font-semibold text-slate-900 mb-2 block">
              Share with (Email)
            </label>
            <Input
              id="share-email"
              type="email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              placeholder="user@example.com"
              aria-label="Email address to share template with"
            />
          </div>
          <div>
            <label htmlFor="share-permission" className="text-sm font-semibold text-slate-900 mb-2 block">
              Permission Level
            </label>
            <select
              id="share-permission"
              value={sharePermission}
              onChange={(e) => setSharePermission(e.target.value as "view" | "edit" | "admin")}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg"
              aria-label="Permission level"
            >
              <option value="view">View Only</option>
              <option value="edit">Can Edit</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <Button onClick={handleShare} className="w-full">
            Share Template
          </Button>
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === "comments" && (
        <div className="space-y-4">
          <div>
            <label htmlFor="comment-input" className="text-sm font-semibold text-slate-900 mb-2 block">
              Add Comment
            </label>
            <Textarea
              id="comment-input"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add a comment..."
              rows={3}
              aria-label="Comment text"
            />
            <Button onClick={handleAddComment} className="mt-2" size="sm">
              Post Comment
            </Button>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {comments.map((comment) => (
              <div key={comment.id} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{comment.userName}</span>
                  <span className="text-xs text-slate-500">
                    {new Date(comment.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-slate-700">{comment.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Tab */}
      {activeTab === "approval" && (
        <div className="space-y-4">
          <Button onClick={handleRequestApproval} className="w-full">
            Request Approval
          </Button>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {approvalRequests
              .filter((r) => r.templateId === templateId)
              .map((request) => (
                <div key={request.id} className="p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Requested by {request.requestedBy}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        request.status === "approved"
                          ? "bg-green-100 text-green-800"
                          : request.status === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                  {request.status === "pending" && (
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" onClick={() => handleApprove(request.id)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleReject(request.id)}>
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
    </Card>
  )
}

