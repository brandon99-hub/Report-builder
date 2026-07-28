export interface BCDeploymentConfig {
  serverUrl: string
  companyName: string
  reportName: string
  apiKey?: string
  username?: string
  password?: string
}

export interface BCDeploymentResult {
  success: boolean
  message: string
  reportId?: string
  error?: string
}

// Deploy RDL to Business Central
export async function deployToBusinessCentral(
  rdlXml: string,
  config: BCDeploymentConfig
): Promise<BCDeploymentResult> {
  try {
    // Validate configuration
    if (!config.serverUrl || !config.companyName || !config.reportName) {
      return {
        success: false,
        message: "Missing required configuration",
        error: "Server URL, company name, and report name are required",
      }
    }

    // In a real implementation, this would call the Business Central API
    // For now, we'll simulate the API call and provide instructions
    const apiEndpoint = `${config.serverUrl}/api/v2.0/${config.companyName}/reports`
    
    // Prepare the request body
    const requestBody = {
      name: config.reportName,
      rdlContent: rdlXml,
      description: "Invoice report generated from Report Builder",
    }

    // Note: This is a placeholder implementation
    // Real BC API integration would require:
    // 1. OAuth2 authentication
    // 2. Proper API endpoint structure
    // 3. Error handling for BC-specific errors
    
    // Simulated API call (replace with actual fetch in production)
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return {
        success: false,
        message: "Failed to deploy to Business Central",
        error: errorText || `HTTP ${response.status}`,
      }
    }

    const result = await response.json()
    return {
      success: true,
      message: "Successfully deployed to Business Central",
      reportId: result.id || result.reportId,
    }
  } catch (error) {
    return {
      success: false,
      message: "Deployment failed",
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Validate Business Central connection
export async function validateBCConnection(config: BCDeploymentConfig): Promise<{
  valid: boolean
  message: string
}> {
  try {
    const testEndpoint = `${config.serverUrl}/api/v2.0/${config.companyName}`
    const response = await fetch(testEndpoint, {
      method: "GET",
      headers: {
        ...(config.apiKey && { Authorization: `Bearer ${config.apiKey}` }),
      },
    })

    if (response.ok) {
      return { valid: true, message: "Connection successful" }
    } else {
      return { valid: false, message: `Connection failed: HTTP ${response.status}` }
    }
  } catch (error) {
    return {
      valid: false,
      message: error instanceof Error ? error.message : "Connection failed",
    }
  }
}

// Generate deployment instructions
export function generateDeploymentInstructions(config: BCDeploymentConfig): string {
  return `
Business Central Deployment Instructions
========================================

1. Server URL: ${config.serverUrl}
2. Company: ${config.companyName}
3. Report Name: ${config.reportName}

Manual Deployment Steps:
1. Open Business Central
2. Navigate to Report Management
3. Import the generated RDL file
4. Assign the report to the appropriate company

API Deployment:
- Use the Business Central API v2.0
- Endpoint: ${config.serverUrl}/api/v2.0/${config.companyName}/reports
- Method: POST
- Content-Type: application/json

Authentication:
${config.apiKey ? `- Using API Key: ${config.apiKey.substring(0, 10)}...` : "- Configure OAuth2 authentication"}

Note: Ensure your Business Central environment allows API access.
  `.trim()
}

