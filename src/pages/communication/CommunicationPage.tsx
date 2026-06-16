import { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import { CommunicationService } from '@/services/communication/communication.service'
import { ChannelConfig, CommunicationChannel, Thread } from '@/services/communication/channel'
import { Card } from '@/components/Card'
import { MessageCircle, Mail, Phone, MessageSquare, Facebook, Instagram } from 'lucide-react'

const CHANNELS: { id: CommunicationChannel; label: string; icon: React.ReactNode }[] = [
  { id: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-6 h-6" /> },
  { id: 'email', label: 'Email', icon: <Mail className="w-6 h-6" /> },
  { id: 'sms', label: 'SMS', icon: <Phone className="w-6 h-6" /> },
  { id: 'instagram', label: 'Instagram', icon: <Instagram className="w-6 h-6" /> },
  { id: 'facebook', label: 'Facebook', icon: <Facebook className="w-6 h-6" /> },
  { id: 'telegram', label: 'Telegram', icon: <MessageSquare className="w-6 h-6" /> },
]

export default function CommunicationPage() {
  const { company } = useAuthStore()
  const [channels, setChannels] = useState<ChannelConfig[]>([])
  const [threads, setThreads] = useState<Thread[]>([])
  const [selectedChannel, setSelectedChannel] = useState<CommunicationChannel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (company?.id) {
      loadData()
    }
  }, [company?.id])

  const loadData = async () => {
    try {
      const [channelsData, threadsData] = await Promise.all([
        CommunicationService.getChannels(company!.id),
        CommunicationService.getThreads(company!.id),
      ])

      setChannels(channelsData)
      setThreads(threadsData)

      if (!selectedChannel && threadsData.length > 0) {
        setSelectedChannel(threadsData[0].channel)
      }
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="p-8">Carregando...</div>
  }

  const filteredThreads = selectedChannel ? threads.filter((t) => t.channel === selectedChannel) : threads

  return (
    <div className="grid grid-cols-4 gap-6 h-[600px]">
      {/* Channels */}
      <div className="col-span-1 space-y-3">
        <h3 className="text-lg font-semibold">Canais</h3>
        <div className="space-y-2">
          {CHANNELS.map((ch) => {
            const config = channels.find((c) => c.channel === ch.id)
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition ${
                  selectedChannel === ch.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {ch.icon}
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium">{ch.label}</p>
                  {config?.enabled ? (
                    <p className="text-xs text-green-600">Conectado</p>
                  ) : (
                    <p className="text-xs text-gray-500">Desconectado</p>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Threads */}
      <div className="col-span-1 border-l overflow-y-auto">
        <h3 className="text-lg font-semibold p-4 border-b">Conversas</h3>
        <div className="divide-y">
          {filteredThreads.length === 0 ? (
            <p className="text-center text-gray-500 p-4">Nenhuma conversa</p>
          ) : (
            filteredThreads.map((thread) => (
              <div key={thread.id} className="p-3 hover:bg-gray-50 cursor-pointer border-b">
                <p className="font-medium text-sm">{thread.subject}</p>
                <p className="text-xs text-gray-500">
                  {new Date(thread.last_message_at).toLocaleDateString()}
                </p>
                {thread.unread_count > 0 && (
                  <span className="inline-block mt-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {thread.unread_count}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="col-span-2 border-l flex flex-col">
        <h3 className="text-lg font-semibold p-4 border-b">Mensagens</h3>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedChannel ? (
            <Card className="text-center text-gray-500 py-8">
              Selecione uma conversa para ver as mensagens
            </Card>
          ) : (
            <Card className="text-center text-gray-500 py-8">
              Selecione um canal para começar
            </Card>
          )}
        </div>
        <div className="border-t p-4">
          <input
            type="text"
            placeholder="Digite sua mensagem..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>
    </div>
  )
}
