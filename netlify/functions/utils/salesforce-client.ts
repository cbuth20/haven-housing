// Salesforce OAuth2 Client Credentials integration

interface SalesforceTokenResponse {
  access_token: string
  instance_url: string
  token_type: string
}

export class SalesforceClient {
  private clientId: string
  private clientSecret: string
  private loginUrl: string
  private accessToken: string | null = null
  private instanceUrl: string | null = null

  constructor() {
    this.clientId = process.env.SALESFORCE_CLIENT_ID || ''
    this.clientSecret = process.env.SALESFORCE_CLIENT_SECRET || ''
    this.loginUrl = process.env.SALESFORCE_LOGIN_URL || 'https://login.salesforce.com'
  }

  private get isConfigured(): boolean {
    return !!(this.clientId && this.clientSecret)
  }

  async authenticate(): Promise<void> {
    if (!this.isConfigured) {
      throw new Error('Salesforce credentials not configured')
    }

    const tokenUrl = `${this.loginUrl.replace(/\/+$/, '')}/services/oauth2/token`
    console.log('Salesforce auth attempt:', tokenUrl)

    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    })

    let response: Response
    try {
      response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      })
    } catch (fetchError: any) {
      console.error('Salesforce fetch error:', fetchError.message, '| URL:', tokenUrl)
      throw new Error(`Salesforce fetch failed for ${tokenUrl}: ${fetchError.message}`)
    }

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Salesforce auth failed:', response.status, errorBody)
      throw new Error(`Salesforce authentication failed: ${response.status} ${errorBody}`)
    }

    const data: SalesforceTokenResponse = await response.json()
    this.accessToken = data.access_token
    this.instanceUrl = data.instance_url
    console.log('Salesforce authenticated, instance:', this.instanceUrl)
  }

  private async request(path: string, method: string, body?: any): Promise<any> {
    if (!this.accessToken || !this.instanceUrl) {
      await this.authenticate()
    }

    const response = await fetch(`${this.instanceUrl}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (response.status === 401) {
      // Token expired — re-authenticate and retry once
      await this.authenticate()
      const retry = await fetch(`${this.instanceUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      })
      if (!retry.ok) {
        const errorBody = await retry.text()
        throw new Error(`Salesforce API error (retry): ${retry.status} ${errorBody}`)
      }
      return retry.status === 204 ? null : retry.json()
    }

    if (!response.ok) {
      const errorBody = await response.text()
      throw new Error(`Salesforce API error: ${response.status} ${errorBody}`)
    }

    return response.status === 204 ? null : response.json()
  }

  /**
   * Create a Lead in Salesforce from a contact form submission.
   * Returns the new Lead's Salesforce ID.
   */
  async createLead(data: {
    fullName: string
    email: string
    phone?: string
    subject?: string
    message?: string
    source?: string
  }): Promise<string> {
    const nameParts = data.fullName.trim().split(/\s+/)
    const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : ''
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0]

    const leadPayload: Record<string, any> = {
      LastName: lastName,
      Email: data.email,
      LeadSource: data.source || 'Website - Contact Form',
      Company: '[Individual]',
    }

    if (firstName) leadPayload.FirstName = firstName
    if (data.phone) leadPayload.Phone = data.phone
    if (data.subject) leadPayload.Title = data.subject

    const result = await this.request(
      '/services/data/v62.0/sobjects/Lead',
      'POST',
      leadPayload
    )

    return result.id
  }

  /**
   * Create a Contact in Salesforce.
   * Returns the new Contact's Salesforce ID.
   */
  async createContact(data: {
    fullName: string
    email: string
    phone?: string
    description?: string
    accountId?: string
  }): Promise<string> {
    const nameParts = data.fullName.trim().split(/\s+/)
    const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : ''
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : nameParts[0]

    const contactPayload: Record<string, any> = {
      LastName: lastName,
    }

    if (firstName) contactPayload.FirstName = firstName
    if (data.email) contactPayload.Email = data.email
    if (data.phone) contactPayload.Phone = data.phone
    if (data.description) contactPayload.Description = data.description
    if (data.accountId) contactPayload.AccountId = data.accountId

    const result = await this.request(
      '/services/data/v62.0/sobjects/Contact',
      'POST',
      contactPayload
    )

    return result.id
  }
}

export function createSalesforceClient(): SalesforceClient | null {
  const clientId = process.env.SALESFORCE_CLIENT_ID
  const clientSecret = process.env.SALESFORCE_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    return null
  }
  return new SalesforceClient()
}
