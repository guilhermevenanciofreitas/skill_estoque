import React from 'react'
import { Badge, Button, HStack, IconButton, List, Nav, Panel, Popover, Stack, Whisper } from 'rsuite'

import dayjs from 'dayjs'

import PageContent from '../../../components/PageContent'

import { CustomBreadcrumb, CustomPagination, CustomSearch, DataTable } from '../../../controls'
import { FaEdit, FaEllipsisV, FaFileDownload, FaPlusCircle, FaPrint, FaTrash, FaUpload } from 'react-icons/fa'
import { Service } from '../../../service'

import ViewProduto from './view.produto'

import _ from 'lodash'
import { times } from 'lodash'
import { Exception } from '../../../utils/exception'

const fields = [
  { label: 'Descrição', value: 'descricao' },
]

class FinanceBankAccounts extends React.Component {

  ViewProduto = React.createRef()

  componentDidMount = () => {
    this.onSearch()
  }

  onApplyDate = (date) => {
    //this.setState({request: {date}})
  }

  onApplyFilter = (filter) => {
    this.setState({request: {filter}}, () => this.onSearch())
  }

  onSearch = () => {
    this.setState({loading: true}, async () => {
      try {
        
        const result = await new Service().Post('cadastros/produto/lista', this.state.request)
        this.setState({...result.data})
        
      } catch (error) {
        Exception.error(error)
      } finally {
        this.setState({loading: false})
      }
    })
  }

  onEditaProduto = async (codprod) => {
    this.ViewProduto.current.editaProduto(codprod).then((produto) => {
      if (produto) this.onSearch()
    })
  }

  onNovoProduto = () => {
    this.ViewProduto.current.novoProduto().then((produto) => {
      if (produto) this.onSearch()
    })
  }

  columns = [
    { selector: (row) => row.codprod, name: 'Código', minWidth: '100px', maxWidth: '100px'},
    { selector: (row) => row.descricao, name: 'Descrição', minWidth: '280px', maxWidth: '280px'},
    { selector: (row) => row.unidade, name: 'Unid', minWidth: '80px', maxWidth: '80px'},
    { selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.custo), name: 'Custo', minWidth: '100px', maxWidth: '100px', right: true},
  ]

  render = () => {

    return (
      <>

        <ViewProduto ref={this.ViewProduto} />

        <PageContent>
          
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

          <DataTable columns={this.columns} rows={this.state?.response?.rows} loading={this.state?.loading} onItem={(row) => this.onEditaProduto(row.codprod)} selectedRows={true} onSelected={(selecteds) => this.setState({selecteds})} />
      
          <hr></hr>
          
          <Stack direction='row' alignItems='flexStart' justifyContent='space-between'>
          
            <div>
              <Button appearance='primary' color='blue' startIcon={<FaPlusCircle />} onClick={this.onNovoProduto}>&nbsp;Novo</Button>
              <Button appearance='primary' color='blue' startIcon={<FaEdit />} disabled={_.size(this.state?.selecteds) != 1} style={{marginLeft: '10px'}} onClick={() => this.onEditaProduto(this.state?.selecteds[0]?.codprod)}>&nbsp;Editar</Button>
              <Button appearance='primary' color='blue' startIcon={<FaTrash />} disabled={_.size(this.state?.selecteds) == 0} style={{marginLeft: '10px'}}>&nbsp;Excluir {_.size(this.state?.selecteds)} registro(s)</Button>
            </div>
            
            <CustomPagination isLoading={this.state?.loading} total={this.state?.response?.count} limit={this.state?.request?.limit} activePage={this.state?.request?.offset + 1}
              onChangePage={(offset) => this.setState({request: {...this.state.request, offset: offset - 1}}, () => this.onSearch())}
              onChangeLimit={(limit) => this.setState({request: {...this.state.request, limit}}, () => this.onSearch())}
            />

          </Stack>
          
        </PageContent>
      </>
    )
  }
}

class Page extends React.Component {

  render = () => {
    return (
      <Panel header={<CustomBreadcrumb menu={'Cadastros'} title={'Produtos'} />}>
        <FinanceBankAccounts />
      </Panel>
    )
  }

}

export default Page;