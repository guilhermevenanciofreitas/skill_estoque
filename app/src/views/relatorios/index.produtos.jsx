import React from 'react'
import { Badge, Button, HStack, IconButton, List, Nav, Panel, Popover, Stack, Whisper } from 'rsuite'

import dayjs from 'dayjs'

import PageContent from '../../components/PageContent'

import { CustomBreadcrumb, CustomPagination, CustomSearch } from '../../controls'
import { FaEllipsisV, FaFileDownload, FaPrint, FaUpload } from 'react-icons/fa'
import { Service } from '../../service'

import _ from 'lodash'
import { times } from 'lodash'
import DataTable from 'react-data-table-component'
import { Exception } from '../../utils/exception'
import { ReportViewer } from '../../controls/components/ReportViewer'
import { Loading } from '../../App'

const fields = [
  { label: 'Descrição', value: 'descricao' },
]

class RelatorioProduto extends React.Component {

  ReportViewer = React.createRef()

  componentDidMount = () => {
    this.onSearch()
  }

  onSearch = () => {
    this.setState({loading: true}, async () => {
      try {
        await new Service().Post('relatorios/produto/lista', this.state.request).then((result) => this.setState({...result.data})).finally(() => this.setState({loading: false}))
      } catch (error) {
        Exception.error(error.message)
      }
    })
  }

  onImprimir = async () => {
    try {

      Loading.Show('Imprimindo...')

      const report = await new Service().Post('relatorios/produto/imprimir', this.state.request)
      
      this.ReportViewer.current?.visualize(report.data.pdf)

    } catch (error) {
      Exception.error(error)
    } finally {
      Loading.Hide()
    }
  }

  ExpandedComponent = (produto) => {

    const columns = [
      { selector: (row) => row.local?.codloc, name: 'Local', minWidth: '100px', maxWidth: '100px'},
      { selector: (row) => row.local?.descricao, name: 'Descrição', minWidth: '250px', maxWidth: '250px'},
      { selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.saldo), name: 'Estoque', minWidth: '120px', maxWidth: '120px', right: true},
      //{ selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.saldo * row2.data.custo), name: 'Custo total', minWidth: '120px', maxWidth: '120px', right: true},
    ]
  
    return <DataTable columns={columns} data={produto.data.estoques} dense />
  
  }

  columns = [
    { selector: (row) => row.codprod, name: 'Código', minWidth: '100px', maxWidth: '100px'},
    { selector: (row) => row.descricao, name: 'Descrição', minWidth: '250px', maxWidth: '250px'},
    { selector: (row) => row.unidade, name: 'Unidade', minWidth: '100px', maxWidth: '100px'},
    { selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(_.sum(_.map(row.estoques, (c) => c.saldo))), name: 'Estoque', minWidth: '120px', maxWidth: '120px', right: true},
  ]

  render = () => {

    return (
      <PageContent>

        <ReportViewer ref={this.ReportViewer} />
        
        <Stack spacing={'6px'} direction={'row'} alignItems={'flex-start'} justifyContent={'space-between'}>
          <HStack>
            <CustomSearch loading={this.state?.loading} fields={fields} defaultPicker={'descricao'} value={this.state?.request?.search} onChange={(search) => this.setState({request: {search}}, () => this.onSearch())} />
          </HStack>
        </Stack>

        <hr></hr>
        
        <Nav appearance="subtle">
          <Nav.Item active={!this.state?.request?.bankAccount} onClick={() => this.setState({request: {...this.state.request, bankAccount: undefined}}, () => this.onSearch())}><center style={{width: 140}}>Todos<br></br>{this.state?.loading ? "-" : <>{this.state?.response?.count}</>}</center></Nav.Item>
          {_.map(this.state?.response?.bankAccounts, (bankAccount) => {
            return <Nav.Item eventKey="home" active={this.state?.request?.bankAccount?.id == bankAccount.id} onClick={() => this.setState({request: {...this.state.request, bankAccount: bankAccount}}, () => this.onSearch())}><center style={{width: 160}}>{<><img src={bankAccount?.bank?.image} style={{height: '16px'}} />&nbsp;&nbsp;{bankAccount.name || <>{bankAccount?.agency}-{bankAccount?.agencyDigit} / {bankAccount?.account}-{bankAccount?.accountDigit}</>}</>}<br></br>{this.state?.loading ? '-' : <>R$ {bankAccount.balance}</>}</center></Nav.Item>
          })}
        </Nav>

        <div style={{cursor: 'pointer', width: '100%', marginTop: '15px', maxHeight: '100%', height: 'calc(100vh - 360px)', overflow: 'auto'}}>
          <DataTable
            fixedHeader
            fixedHeaderScrollHeight='100%'
            dense
            columns={this.columns}
            data={this.state?.response?.rows || []}
            expandableRows={true}
            expandableRowsComponent={this.ExpandedComponent}
          />
        </div>

        <hr></hr>
        
        <Stack direction='row' alignItems='flexStart' justifyContent='space-between'>
          <Stack spacing={5}>
            <Button appearance='primary' color='blue' startIcon={<FaPrint />} onClick={this.onImprimir}>&nbsp;Imprimir</Button>
          </Stack>
        </Stack>
        
      </PageContent>
    )
  }
}

class Page extends React.Component {

  render = () => {
    return (
      <Panel header={<CustomBreadcrumb menu={'Relatórios'} title={'Produtos'} />}>
        <RelatorioProduto />
      </Panel>
    )
  }

}

export default Page;