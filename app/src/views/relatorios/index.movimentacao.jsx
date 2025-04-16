import React from 'react'
import { Badge, Button, HStack, IconButton, List, Loader, Nav, Panel, Popover, Stack, Whisper } from 'rsuite'

import dayjs from 'dayjs'

import PageContent from '../../components/PageContent'

import { AutoComplete, CustomBreadcrumb, CustomPagination, CustomSearch } from '../../controls'
import { FaEllipsisV, FaFileDownload, FaPrint, FaSearch, FaUpload } from 'react-icons/fa'
import { Service } from '../../service'

import _ from 'lodash'
import { times } from 'lodash'
import DataTable from 'react-data-table-component'
import { Exception } from '../../utils/exception'
import { ReportViewer } from '../../controls/components/ReportViewer'
import { Loading } from '../../App'
import { Search } from '../../search'

const fields = [
  { label: 'Descrição', value: 'descricao' },
]

export class RelatorioMovimentacao extends React.Component {

  state = {
    request: {
      inicio: dayjs().format('YYYY-MM-01'),
      final: dayjs().format('YYYY-MM-DD'),
    }
  }

  ReportViewer = React.createRef()

  componentDidMount = () => {
    //this.onSearch()
  }

  onSearch = () => {
    this.setState({loading: true}, async () => {
      try {
        await new Service().Post('relatorios/movimentacao/lista', this.state.request).then((result) => this.setState({...result.data})).finally(() => this.setState({loading: false}))
      } catch (error) {
        Exception.error(error.message)
      }
    })
  }

  onImprimir = async () => {
    try {

      Loading.Show('Imprimindo...')

      const report = await new Service().Post('relatorios/movimentacao/imprimir', this.state?.request)
      
      this.ReportViewer.current?.visualize(report.data.pdf)

    } catch (error) {
      Exception.error(error)
    } finally {
      Loading.Hide()
    }
  }

  columns = [
    { selector: (row) => row.movCab?.transacao, name: 'Cod.ID', minWidth: '100px', maxWidth: '100px', style: {padding: '0px'}},
    { selector: (row) => row.movCab?.emissao ? dayjs(row.emissao).format('DD/MM/YYYY') : '', name: 'Emissão', minWidth: '90px', maxWidth: '90px', style: {padding: '0px'}},
    { selector: (row) => row.produto?.codprod, name: 'Código', center: true, minWidth: '100px', maxWidth: '100px', style: {padding: '0px'}},
    { selector: (row) => row.produto?.descricao, name: 'Descrição', minWidth: '250px', maxWidth: '250px', style: {padding: '0px'}},
    { selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.qtde), name: 'Qtde', minWidth: '100px', maxWidth: '100px', right: true, style: {padding: '0px'}},
    { selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.punit), name: 'Preço Un.', minWidth: '100px', maxWidth: '100px', right: true, style: {padding: '0px'}},
    { selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(parseFloat(row.qtde) * parseFloat(row.punit)), name: 'Total', minWidth: '100px', maxWidth: '100px', right: true, style: {padding: '0px'}},
    //{ selector: (row) => row.movCab?.parceiro?.nome, name: 'Parceiro', minWidth: '250px', maxWidth: '250px', style: {padding: '0px'}},
    { selector: (row) => row.orig?.descricao, name: 'Origem', minWidth: '220px', maxWidth: '220px', style: {paddingLeft: '15px'}},
    { selector: (row) => row.dest?.descricao, name: 'Destino', minWidth: '220px', maxWidth: '220px', style: {paddingLeft: '15px'}},
  ]

  render = () => {

    return (
      <Panel header={<CustomBreadcrumb menu={'Relatórios'} title={'Movimentação'} />}>
        <PageContent>

          <ReportViewer ref={this.ReportViewer} />
          
          <Stack spacing={'6px'} direction={'row'} alignItems={'flex-start'} justifyContent={'space-between'}>
            <HStack>
              <div className='form-control'>
                  <label class="textfield-filled">
                      <input type='date' value={this.state?.request?.inicio} onChange={(event) => this.setState({request: {...this.state?.request, inicio: event.target.value}})} />
                      <span>Inicio</span>
                  </label>
              </div>
              <div className='form-control'>
                  <label class="textfield-filled">
                      <input type='date' value={this.state?.request?.final} onChange={(event) => this.setState({request: {...this.state?.request, final: event.target.value}})} />
                      <span>Final</span>
                  </label>
              </div>
              <div className='form-control' style={{width: '280px'}}>
                <AutoComplete label='Tipo de entrada/saída' value={this.state?.request?.tipoEntSai} text={(item) => `${item.descricao}`} onChange={(tipoEntSai) => this.setState({request: {...this.state?.request, tipoEntSai}})} onSearch={async (search) => await Search.tipoEntradaSaida(search)}>
                    <AutoComplete.Result>
                      {(item) => <span>{item.descricao}</span>}
                    </AutoComplete.Result>
                </AutoComplete>
              </div>
              <div className='form-control' style={{width: '350px'}}>
                <AutoComplete label='Produto' value={this.state?.request?.produto} text={(item) => `${item.codprod} - ${item.descricao}`} onChange={(produto) => this.setState({request: {...this.state?.request, produto}})} onSearch={async (search) => await Search.produto(search)}>
                    <AutoComplete.Result>
                      {(item) => <span>{item.codprod} - {item.descricao}</span>}
                    </AutoComplete.Result>
                </AutoComplete>
              </div>
              <Button appearance="primary" color='blue' onClick={() => this.setState({request: {...this.state?.request, filter: this.state?.request.filter}}, () => this.onSearch())} disabled={this.state?.loading}>{this.state?.loading ? <><Loader /> &nbsp; Buscando...</> : <><FaSearch /> &nbsp; Buscar</>}</Button>
            </HStack>
          </Stack>

          <hr></hr>
          
          <Nav appearance="subtle">
            <Nav.Item active={!this.state?.request?.bankAccount} onClick={() => this.setState({request: {...this.state.request, bankAccount: undefined}}, () => this.onSearch())}><center style={{width: 140}}>Todos<br></br>{this.state?.loading ? "-" : <>{this.state?.response?.count}</>}</center></Nav.Item>
            {_.map(this.state?.response?.bankAccounts, (bankAccount) => {
              return <Nav.Item eventKey="home" active={this.state?.request?.bankAccount?.id == bankAccount.id} onClick={() => this.setState({request: {...this.state.request, bankAccount: bankAccount}}, () => this.onSearch())}><center style={{width: 160}}>{<><img src={bankAccount?.bank?.image} style={{height: '16px'}} />&nbsp;&nbsp;{bankAccount.name || <>{bankAccount?.agency}-{bankAccount?.agencyDigit} / {bankAccount?.account}-{bankAccount?.accountDigit}</>}</>}<br></br>{this.state?.loading ? '-' : <>R$ {bankAccount.balance}</>}</center></Nav.Item>
            })}
          </Nav>

          <div style={{cursor: 'pointer', width: '100%', marginTop: '15px', maxHeight: '100%', height: 'calc(100vh - 400px)', overflow: 'auto'}}>
            <DataTable
              fixedHeader
              fixedHeaderScrollHeight='100%'
              dense
              columns={this.columns}
              data={this.state?.response?.rows || []}
            />
          </div>

          <hr></hr>
          
          <Stack direction='row' alignItems='flexStart' justifyContent='space-between'>
            <Stack spacing={5}>
              <Button appearance='primary' color='blue' startIcon={<FaPrint />} onClick={this.onImprimir}>&nbsp;Imprimir</Button>
            </Stack>
          </Stack>
          
        </PageContent>
      </Panel>
    )
  }
}