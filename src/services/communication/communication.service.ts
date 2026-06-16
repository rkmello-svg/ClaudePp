import { supabase } from '@/lib/supabase'
import { Contact, Thread, Message, CommunicationChannel, ChannelConfig } from './channel'

export class CommunicationService {
  static async getChannels(company_id: string): Promise<ChannelConfig[]> {
    const { data, error } = await supabase
      .from('communication_channels')
      .select('*')
      .eq('company_id', company_id)

    if (error) throw error
    return data || []
  }

  static async updateChannelConfig(
    company_id: string,
    channel: CommunicationChannel,
    config: Partial<ChannelConfig>,
  ): Promise<ChannelConfig> {
    const { data, error } = await supabase
      .from('communication_channels')
      .upsert(
        {
          company_id,
          channel,
          ...config,
        },
        { onConflict: 'company_id,channel' },
      )
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getContacts(company_id: string, search?: string): Promise<Contact[]> {
    let query = supabase.from('communication_contacts').select('*').eq('company_id', company_id)

    if (search) {
      query = query.or(`name.ilike.%${search}%,emails.cs.{"${search}"*}`)
    }

    const { data, error } = await query.order('last_contacted_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async createContact(company_id: string, contact: Omit<Contact, 'id' | 'company_id'>) {
    const { data, error } = await supabase
      .from('communication_contacts')
      .insert({ company_id, ...contact })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getThreads(company_id: string, channel?: CommunicationChannel): Promise<Thread[]> {
    let query = supabase
      .from('communication_threads')
      .select('*')
      .eq('company_id', company_id)

    if (channel) {
      query = query.eq('channel', channel)
    }

    const { data, error } = await query.order('last_message_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getThreadMessages(thread_id: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('communication_messages')
      .select('*')
      .eq('thread_id', thread_id)
      .order('sent_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  static async saveMessage(
    thread_id: string,
    message: Omit<Message, 'id' | 'sent_at'>,
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('communication_messages')
      .insert({
        thread_id,
        ...message,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async updateMessageStatus(
    message_id: string,
    status: Message['status'],
    delivered_at?: string,
    read_at?: string,
  ): Promise<Message> {
    const { data, error } = await supabase
      .from('communication_messages')
      .update({
        status,
        delivered_at,
        read_at,
      })
      .eq('id', message_id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async closeThread(thread_id: string): Promise<void> {
    const { error } = await supabase
      .from('communication_threads')
      .update({ status: 'closed' })
      .eq('id', thread_id)

    if (error) throw error
  }

  static async getConversationSummary(
    company_id: string,
    days: number = 30,
  ): Promise<{
    total_messages: number
    total_threads: number
    channels_breakdown: Record<CommunicationChannel, number>
    active_contacts: number
  }> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

    const [messagesResult, threadsResult, channelsResult] = await Promise.all([
      supabase
        .from('communication_messages')
        .select('*', { count: 'exact' })
        .eq('company_id', company_id)
        .gte('sent_at', since),
      supabase
        .from('communication_threads')
        .select('*', { count: 'exact' })
        .eq('company_id', company_id)
        .gte('last_message_at', since),
      supabase
        .from('communication_messages')
        .select('channel')
        .eq('company_id', company_id)
        .gte('sent_at', since),
    ])

    const channels: Record<string, number> = {}
    ;(channelsResult.data || []).forEach((msg: any) => {
      channels[msg.channel] = (channels[msg.channel] || 0) + 1
    })

    const contactsResult = await supabase
      .from('communication_contacts')
      .select('*', { count: 'exact' })
      .eq('company_id', company_id)
      .gte('last_contacted_at', since)

    return {
      total_messages: messagesResult.count || 0,
      total_threads: threadsResult.count || 0,
      channels_breakdown: channels as Record<CommunicationChannel, number>,
      active_contacts: contactsResult.count || 0,
    }
  }
}
