"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  deployToBusinessCentral,
  validateBCConnection,
  generateDeploymentInstructions,
  type BCDeploymentConfig,
} from "@/lib/business-central-api"
import { toast } from "sonner"

interface BCDeploymentProps {
  rdlXml: string
}

export function BCDeployment({ rdlXml }: BCDeploymentProps) {
  const [config, setConfig] = useState<BCDeploymentConfig>({
    serverUrl: "",
    companyName: "",
    reportName: "Invoice Report",
    apiKey: "",
  })
  const [isDeploying, setIsDeploying] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<string>("")
  const [showInstructions, setShowInstructions] = useState(false)

  const handleValidate = async () => {
    setIsValidating(true)
    const result = await validateBCConnection(config)
    setConnectionStatus(result.message)
    if (result.valid) {
      toast.success("Connection validated successfully")
    } else {
      toast.error("Connection validation failed")
    }
    setIsValidating(false)
  }

  const handleDeploy = async () => {
    if (!config.serverUrl || !config.companyName || !config.reportName) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsDeploying(true)
    const result = await deployToBusinessCentral(rdlXml, config)

    if (result.success) {
      toast.success(result.message)
    } else {
      toast.error(result.error || result.message)
    }
    setIsDeploying(false)
  }

  const instructions = generateDeploymentInstructions(config)

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Business Central Deployment</h3>

      <div className="space-y-4">
        <div>
          <label htmlFor="bc-server-url" className="text-sm font-semibold text-slate-900 mb-2 block">
            Server URL *
          </label>
          <Input
            id="bc-server-url"
            value={config.serverUrl}
            onChange={(e) => setConfig({ ...config, serverUrl: e.target.value })}
            placeholder="https://api.businesscentral.dynamics.com"
            aria-label="Business Central server URL"
          />
        </div>

        <div>
          <label htmlFor="bc-company" className="text-sm font-semibold text-slate-900 mb-2 block">
            Company Name *
          </label>
          <Input
            id="bc-company"
            value={config.companyName}
            onChange={(e) => setConfig({ ...config, companyName: e.target.value })}
            placeholder="CRONUS"
            aria-label="Business Central company name"
          />
        </div>

        <div>
          <label htmlFor="bc-report-name" className="text-sm font-semibold text-slate-900 mb-2 block">
            Report Name *
          </label>
          <Input
            id="bc-report-name"
            value={config.reportName}
            onChange={(e) => setConfig({ ...config, reportName: e.target.value })}
            placeholder="Invoice Report"
            aria-label="Report name in Business Central"
          />
        </div>

        <div>
          <label htmlFor="bc-api-key" className="text-sm font-semibold text-slate-900 mb-2 block">
            API Key (Optional)
          </label>
          <Input
            id="bc-api-key"
            type="password"
            value={config.apiKey}
            onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
            placeholder="Enter API key for authentication"
            aria-label="Business Central API key"
          />
        </div>

        {connectionStatus && (
          <div
            className={`p-3 rounded-lg text-sm ${
              connectionStatus.includes("successful")
                ? "bg-green-50 text-green-800"
                : "bg-red-50 text-red-800"
            }`}
            role="status"
          >
            {connectionStatus}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleValidate}
            disabled={isValidating || !config.serverUrl || !config.companyName}
            className="flex-1"
          >
            {isValidating ? "Validating..." : "Validate Connection"}
          </Button>
          <Button
            onClick={handleDeploy}
            disabled={isDeploying || !config.serverUrl || !config.companyName || !config.reportName}
            className="flex-1"
          >
            {isDeploying ? "Deploying..." : "Deploy to BC"}
          </Button>
        </div>

        <Button
          variant="outline"
          onClick={() => setShowInstructions(!showInstructions)}
          className="w-full"
        >
          {showInstructions ? "Hide" : "Show"} Deployment Instructions
        </Button>

        {showInstructions && (
          <div className="p-4 bg-slate-50 rounded-lg">
            <pre className="text-xs whitespace-pre-wrap font-mono">{instructions}</pre>
          </div>
        )}
      </div>
    </Card>
  )
}

