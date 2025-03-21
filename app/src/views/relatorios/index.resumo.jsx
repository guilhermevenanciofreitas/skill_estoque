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

export class RelatorioResumo extends React.Component {

  ReportViewer = React.createRef()

  componentDidMount = () => {
    //this.onSearch()
  }

  onSearch = () => {
    this.setState({loading: true}, async () => {
      try {
        await new Service().Post('relatorios/resumo/lista', this.state.request).then((result) => this.setState({...result.data})).finally(() => this.setState({loading: false}))
      } catch (error) {
        Exception.error(error.message)
      }
    })
  }

  onImprimir = async () => {
    try {

      Loading.Show('Imprimindo...')

      const report = await new Service().Post('relatorios/resumo/imprimir', this.state?.request)
      
      this.ReportViewer.current?.visualize(report.data.pdf)

    } catch (error) {
      Exception.error(error)
    } finally {
      Loading.Hide()
    }
  }

  columns = [
    { selector: (row) => row.codentsai, name: 'Cod.ID', minWidth: '100px', maxWidth: '100px'},
    { selector: (row) => row.operacao, name: 'Operação', minWidth: '300px', maxWidth: '300px'},
    { selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.valor), name: 'Valor', minWidth: '100px', maxWidth: '100px', right: true},
  ]

  render = () => {

    return (
      <Panel header={<CustomBreadcrumb menu={'Relatórios'} title={'Resumo'} />}>
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
              data={this.state?.response?.resumo || []}
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