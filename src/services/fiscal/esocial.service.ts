import { supabase } from '@/lib/supabase'

export interface eSocialEvent {
  id: string
  company_id: string
  event_type: 'employee' | 'admission' | 'separation' | 'payroll' | 'contribution'
  event_version: string
  xml_content: string
  transmission_date: string | null
  protocol_number: string | null
  status: 'draft' | 'transmitted' | 'error' | 'rejected'
  error_message: string | null
  created_at: string
  updated_at: string
}

export class eSocialService {
  static async generateAdmissionEvent(companyId: string, employeeData: any) {
    const xmlContent = this.generateAdmissionXML(employeeData)

    const { data, error } = await supabase
      .from('esocial_events')
      .insert([{
        company_id: companyId,
        event_type: 'admission',
        event_version: '2.5.0',
        xml_content: xmlContent,
        status: 'draft',
      }])
      .select()
      .single()

    if (error) throw error
    return data as eSocialEvent
  }

  static async transmitEvent(eventId: string) {
    const { data: event, error: eventError } = await supabase
      .from('esocial_events')
      .select('*')
      .eq('id', eventId)
      .single()

    if (eventError) throw eventError

    const response = await this.submitToeSocial(event.xml_content)

    const { error } = await supabase
      .from('esocial_events')
      .update({
        status: response.status,
        protocol_number: response.protocol,
        transmission_date: new Date().toISOString(),
        error_message: response.error,
      })
      .eq('id', eventId)

    if (error) throw error

    return response
  }

  private static generateAdmissionXML(employee: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<eSocial>
  <evtAdmissao Id="ID0202411290000000000180010001">
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>2</tpAmb>
      <procEmi>1</procEmi>
      <verProc>2.5.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${employee.company_cnpj}</nrInsc>
    </ideEmpregador>
    <infoDeficiencia>
      <defFisica>${employee.deficiency_physical ? 'S' : 'N'}</defFisica>
      <defAuditiva>${employee.deficiency_auditory ? 'S' : 'N'}</defAuditiva>
      <defVisual>${employee.deficiency_visual ? 'S' : 'N'}</defVisual>
      <defMental>${employee.deficiency_mental ? 'S' : 'N'}</defMental>
      <textoDeficiencia>${employee.deficiency_description || ''}</textoDeficiencia>
    </infoDeficiencia>
    <infoVinc>
      <matricula>${employee.registration_number}</matricula>
      <tpRegJor>1</tpRegJor>
      <dtAdmis>${employee.admission_date}</dtAdmis>
      <tpAdmis>1</tpAdmis>
      <procAdmis>1</procAdmis>
      <tpRegTrab>1</tpRegTrab>
      <tpReg>1</tpReg>
      <naturJurid>2038</naturJurid>
      <origemUnd>1</origemUnd>
      <tpLotacao>1</tpLotacao>
      <agentNocivo>${employee.hazardous ? 'S' : 'N'}</agentNocivo>
      <funcao>
        <codigoFuncao>102471</codigoFuncao>
        <apeFunc>${employee.function_name || 'Func'}</apeFunc>
        <descrFun>${employee.function_description || 'Funcionario'}</descrFun>
      </funcao>
    </infoVinc>
    <infoContr>
      <tpContr>1</tpContr>
      <indConstr>0</indConstr>
      <indForça>0</indForça>
    </infoContr>
    <salarioContrib>
      <tpSalEst>1</tpSalEst>
      <dSalEst>${employee.admission_date}</dSalEst>
      <vrSalEst>${employee.salary}</vrSalEst>
    </salarioContrib>
  </evtAdmissao>
</eSocial>`
  }

  private static generatePayrollXML(companyId: string, payrollData: any): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<eSocial>
  <evtInfoComplPer Id="ID0202411290000000000150011001">
    <ideEvento>
      <indRetif>1</indRetif>
      <tpAmb>2</tpAmb>
      <procEmi>1</procEmi>
      <verProc>2.5.0</verProc>
    </ideEvento>
    <ideEmpregador>
      <tpInsc>1</tpInsc>
      <nrInsc>${payrollData.company_cnpj}</nrInsc>
    </ideEmpregador>
    <infoCPRecalc>
      <perRef>${payrollData.period}</perRef>
      <infoBaseCS>
        <dtVenc>${payrollData.payment_date}</dtVenc>
        <vrBcCp>${payrollData.base}</vrBcCp>
        <vrBcCc>${payrollData.base}</vrBcCc>
        <vrBcIrrf>${payrollData.base}</vrBcIrrf>
      </infoBaseCS>
    </infoCPRecalc>
  </evtInfoComplPer>
</eSocial>`
  }

  private static async submitToeSocial(xmlContent: string) {
    try {
      // In production, implement real eSocial integration
      // For now, simulate transmission
      return {
        status: 'transmitted',
        protocol: `2024${Date.now()}`,
        error: null,
      }
    } catch (error) {
      return {
        status: 'error',
        protocol: null,
        error: error instanceof Error ? error.message : 'eSocial submission failed',
      }
    }
  }
}
