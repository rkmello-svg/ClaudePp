export type CommunicationChannel = 'whatsapp' | 'email' | 'sms' | 'instagram' | 'facebook' | 'telegram'

export interface ChannelConfig {
  channel: CommunicationChannel
  enabled: boolean
  credentials: Record<string, string>
  webhook_url?: string
}

export interface Message {
  id: string
  channel: CommunicationChannel
  contact_id: string
  direction: 'inbound' | 'outbound'
  content: string
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed'
  sent_at: string
  delivered_at?: string
  read_at?: string
  metadata?: Record<string, any>
}

export interface Contact {
  id: string
  company_id: string
  name: string
  emails: string[]
  phones: string[]
  whatsapp?: string
  instagram?: string
  facebook?: string
  telegram?: string
  last_contacted_at?: string
  tags?: string[]
  notes?: string
}

export interface Thread {
  id: string
  company_id: string
  contact_id: string
  channel: CommunicationChannel
  subject: string
  last_message_at: string
  unread_count: number
  status: 'open' | 'closed' | 'archived'
  messages: Message[]
}

export abstract class CommunicationChannelProvider {
  abstract channel: CommunicationChannel
  protected credentials: Record<string, string>

  constructor(credentials: Record<string, string>) {
    this.credentials = credentials
  }

  abstract sendMessage(to: string, message: string): Promise<string>
  abstract receiveWebhook(payload: Record<string, any>): Promise<Message>
  abstract validateCredentials(): Promise<boolean>
  abstract getStatus(): Promise<'connected' | 'disconnected' | 'error'>
}
