import { supabase } from '@/lib/supabase'

export interface NFe {
  id: string
  company_id: string
  invoice_id: string
  nfe_number: string
  nfe_series: string
  nfe_key: string
  xml_content: string
  status: 'draft' | 'authorized' | 'cancelled' | 'rejected'
  authorization_date: string | null
  authorization_protocol: string | null
  pdf_url: string | null
  error_message: string | null
  created_at: string
  updated_at: string
}

export class NFeService {
  static async generateNFe(companyId: string, invoiceId: string) {
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('*, customer:customers(*), items:invoice_items(*)')
      .eq('id', invoiceId)
      .single()

    if (invoiceError) throw invoiceError

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (companyError) throw companyError

    const nfeKey = this.generateNFeKey(
      company.state || 'SP',
      invoice.issue_date,
      company.cnpj,
      invoice.series || '1',
      invoice.number,
    )

    const xmlContent = this.generateNFeXML(invoice, company, nfeKey)

    const { data, error } = await supabase
      .from('nfe')
      .insert([{
        company_id: companyId,
        invoice_id: invoiceId,
        nfe_number: invoice.number,
        nfe_series: invoice.series || '1',
        nfe_key: nfeKey,
        xml_content: xmlContent,
        status: 'draft',
      }])
      .select()
      .single()

    if (error) throw error
    return data as NFe
  }

  static async authorizeNFe(nfeId: string) {
    const { data: nfe, error: nfeError } = await supabase
      .from('nfe')
      .select('*')
      .eq('id', nfeId)
      .single()

    if (nfeError) throw nfeError

    // Call SEFAZ API (simulation)
    const response = await this.submitToSEFAZ(nfe.xml_content, nfe.nfe_key)

    const { error } = await supabase
      .from('nfe')
      .update({
        status: response.status,
        authorization_protocol: response.protocol,
        authorization_date: new Date().toISOString(),
        error_message: response.error,
      })
      .eq('id', nfeId)

    if (error) throw error

    // Update invoice status
    if (response.status === 'authorized') {
      await supabase
        .from('invoices')
        .update({
          nfe_key: nfe.nfe_key,
          nfe_number: nfe.nfe_number,
          nfe_status: 'authorized',
        })
        .eq('id', nfe.invoice_id)
    }

    return response
  }

  static async cancelNFe(nfeId: string, reason: string) {
    const { data: nfe, error: nfeError } = await supabase
      .from('nfe')
      .select('*')
      .eq('id', nfeId)
      .single()

    if (nfeError) throw nfeError

    if (nfe.status !== 'authorized') {
      throw new Error('Apenas NF-es autorizadas podem ser canceladas')
    }

    // Generate cancellation XML
    const cancellationXML = this.generateCancellationXML(nfe, reason)

    // Submit to SEFAZ
    const response = await this.submitCancellationToSEFAZ(cancellationXML)

    const { error } = await supabase
      .from('nfe')
      .update({
        status: 'cancelled',
        error_message: response.error || null,
      })
      .eq('id', nfeId)

    if (error) throw error

    return response
  }

  private static generateNFeKey(state: string, issueDate: string, cnpj: string, series: string, number: string) {
    const stateCode = this.getStateCode(state)
    const datePart = issueDate.replace(/-/g, '').slice(2, 8)
    const cnpjPart = cnpj.replace(/\D/g, '')
    const seriesNumber = `${series.padStart(3, '0')}${number.padStart(9, '0')}`

    // Simplified key generation (real implementation needs CFe algorithm)
    const key = `${stateCode}${datePart}${cnpjPart}55${seriesNumber}00000000`
    const checkDigit = this.calculateNFeKeyCheckDigit(key)

    return `${key}${checkDigit}`
  }

  private static getStateCode(state: string): string {
    const codes: Record<string, string> = {
      SP: '35', RJ: '20', MG: '31', BA: '29', SC: '24', RS: '43', PR: '41',
      PE: '26', GO: '52', PA: '23', CE: '23', PB: '21', MA: '11', MT: '28',
      MS: '10', ES: '32', PI: '16', RN: '24', AL: '27', AC: '04', AM: '16',
      AP: '16', DF: '26', RO: '23', RR: '24', TO: '29',
    }
    return codes[state] || '35'
  }

  private static calculateNFeKeyCheckDigit(key: string): string {
    const multipliers = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5, 6, 7, 8, 9, 2]
    let sum = 0

    for (let i = 0; i < 25; i++) {
      sum += parseInt(key[i]) * multipliers[i]
    }

    const remainder = sum % 11
    const digit = remainder === 0 ? 0 : remainder === 1 ? 0 : 11 - remainder

    return String(digit)
  }

  private static generateNFeXML(invoice: any, company: any, nfeKey: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<NFe xmlns="http://www.portalfiscal.inf.br/nfe">
  <infNFe Id="NFe${nfeKey}" versao="4.00">
    <ide>
      <cUF>${this.getStateCode(company.state)}</cUF>
      <CNPJ>${company.cnpj}</CNPJ>
      <nNF>${invoice.number}</nNF>
      <serie>${invoice.series}</serie>
      <dEmi>${invoice.issue_date}</dEmi>
      <hEmi>12:00:00</hEmi>
      <natOp>Venda de Mercadoria</natOp>
      <indPag>0</indPag>
      <tpNF>1</tpNF>
      <idDest>1</idDest>
      <indFinal>0</indFinal>
      <indPres>1</indPres>
      <procEmi>0</procEmi>
      <verProc>4.0</verProc>
    </ide>
    <emit>
      <CNPJ>${company.cnpj}</CNPJ>
      <xNome>${company.name}</xNome>
      <xFant>${company.name}</xFant>
      <enderEmit>
        <xLgr>Rua Exemplo</xLgr>
        <nro>0</nro>
        <xCpl></xCpl>
        <xBairro>Centro</xBairro>
        <cMun>3550308</cMun>
        <xMun>Sao Paulo</xMun>
        <UF>${company.state}</UF>
        <CEP>01000000</CEP>
        <cPais>1058</cPais>
        <xPais>Brasil</xPais>
        <fone>1133334444</fone>
      </enderEmit>
    </emit>
    <dest>
      <CNPJ>${invoice.customer?.cpf_cnpj || '00000000000191'}</CNPJ>
      <xNome>${invoice.customer?.name || 'Consumidor'}</xNome>
      <enderDest>
        <xLgr>${invoice.customer?.address || 'Rua Exemplo'}</xLgr>
        <nro>0</nro>
        <xBairro>${invoice.customer?.city || 'Centro'}</xBairro>
        <cMun>3550308</cMun>
        <xMun>${invoice.customer?.city || 'Sao Paulo'}</xMun>
        <UF>${invoice.customer?.state || 'SP'}</UF>
        <CEP>${invoice.customer?.zip_code || '01000000'}</CEP>
        <cPais>1058</cPais>
        <xPais>Brasil</xPais>
      </enderDest>
    </dest>
    <det nItem="1">
      <prod>
        <code>0001</code>
        <xProd>Produto Exemplo</xProd>
        <NCM>00000000</NCM>
        <CFOP>5102</CFOP>
        <uCom>UN</uCom>
        <qCom>1.0000</qCom>
        <vUnCom>${invoice.total_amount}</vUnCom>
        <vProd>${invoice.total_amount}</vProd>
      </prod>
      <imposto>
        <ICMS>
          <ICMS00>
            <Orig>0</Orig>
            <CST>00</CST>
            <modBC>0</modBC>
            <vBC>${invoice.total_amount}</vBC>
            <pICMS>18.0000</pICMS>
            <vICMS>${(invoice.total_amount * 0.18).toFixed(2)}</vICMS>
          </ICMS00>
        </ICMS>
        <PIS>
          <PISAliq>
            <CST>01</CST>
            <vBC>${invoice.total_amount}</vBC>
            <pPIS>7.6500</pPIS>
            <vPIS>${(invoice.total_amount * 0.0765).toFixed(2)}</vPIS>
          </PISAliq>
        </PIS>
        <COFINS>
          <COFINSAliq>
            <CST>01</CST>
            <vBC>${invoice.total_amount}</vBC>
            <pCOFINS>7.6000</pCOFINS>
            <vCOFINS>${(invoice.total_amount * 0.076).toFixed(2)}</vCOFINS>
          </COFINSAliq>
        </COFINS>
      </imposto>
      <infAdProd></infAdProd>
    </det>
    <total>
      <ICMSTot>
        <vBC>${invoice.total_amount}</vBC>
        <vICMS>${(invoice.total_amount * 0.18).toFixed(2)}</vICMS>
        <vICMSDeson>0.00</vICMSDeson>
        <vFCP>0.00</vFCP>
        <vBCST>0.00</vBCST>
        <vST>0.00</vST>
        <vFCPST>0.00</vFCPST>
        <vFCPSTRet>0.00</vFCPSTRet>
        <vProd>${invoice.total_amount}</vProd>
        <vFrete>0.00</vFrete>
        <vSeg>0.00</vSeg>
        <vDesc>0.00</vDesc>
        <vII>0.00</vII>
        <vIPI>0.00</vIPI>
        <vIPIDevol>0.00</vIPIDevol>
        <vPIS>${(invoice.total_amount * 0.0765).toFixed(2)}</vPIS>
        <vCOFINS>${(invoice.total_amount * 0.076).toFixed(2)}</vCOFINS>
        <vOutro>0.00</vOutro>
        <vNF>${invoice.total_amount}</vNF>
      </ICMSTot>
    </total>
    <transp>
      <modFrete>9</modFrete>
    </transp>
    <pag>
      <detPag>
        <tPag>01</tPag>
        <vPag>${invoice.total_amount}</vPag>
      </detPag>
    </pag>
    <infAdic>
      <infCpl>ERP Enterprise OS</infCpl>
    </infAdic>
  </infNFe>
</NFe>`
  }

  private static generateCancellationXML(nfe: NFe, reason: string): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<eventoCancNFe>
  <infEvento Id="ID${nfe.nfe_key}01">
    <cOrgao>35</cOrgao>
    <tpAmb>2</tpAmb>
    <CNPJ>00000000000191</CNPJ>
    <chNFe>${nfe.nfe_key}</chNFe>
    <dhEvent>${new Date().toISOString()}</dhEvent>
    <tpEvento>110140</tpEvento>
    <nSeqEvento>1</nSeqEvento>
    <verEvento>1.00</verEvento>
    <detEvento versaoEvento="1.00">
      <descEvento>Cancelamento</descEvento>
      <xJust>${reason}</xJust>
    </detEvento>
  </infEvento>
</eventoCancNFe>`
  }

  private static async submitToSEFAZ(_xmlContent: string, _nfeKey: string) {
    try {
      // In production, implement real SEFAZ integration
      // For now, simulate authorization
      return {
        status: 'authorized',
        protocol: `${Date.now()}000001`,
        error: null,
      }
    } catch (error) {
      return {
        status: 'rejected',
        protocol: null,
        error: error instanceof Error ? error.message : 'SEFAZ submission failed',
      }
    }
  }

  private static async submitCancellationToSEFAZ(_cancellationXML: string) {
    try {
      return {
        status: 'cancelled',
        protocol: `${Date.now()}000001`,
        error: null,
      }
    } catch (error) {
      return {
        status: 'error',
        protocol: null,
        error: error instanceof Error ? error.message : 'Cancellation failed',
      }
    }
  }
}
