import React from "react";
import { Button, Divider, Form, Loader, Message, Modal, toaster } from 'rsuite';
import { Container, Row, Col } from 'react-grid-system';
import { AutoComplete, DataTable, ViewModal } from "../../controls";
import { MdAddCircleOutline, MdCheckCircleOutline, MdDelete } from "react-icons/md";
import { Service } from "../../service";
import { Loading } from "../../App";

import _ from "lodash";
import { Search } from "../../search";

import dayjs from 'dayjs'

class ViewEntradaSaida extends React.Component {

    viewModal = React.createRef()

    novaEntradaSaida = async (entradaSaida) => {
        if (this.state) for (const prop of Object.getOwnPropertyNames(this.state)) delete this.state[prop]
        this.setState({...entradaSaida})
        return this.viewModal.current.show()
    }

    editarEntradaSaida = async (transacao) => {
        Loading.Show();
        await new Service().Post('entrada-saida/editar', {transacao}).then(async (result) => {
            this.setState({...result.data})
            await this.onTipoOperacao(result.data.tipoEntSai.tipo)
        }).finally(() => Loading.Hide())
        return this.viewModal.current.show()
    }

    salvarEntradaSaida = async () => {
        this.setState({submting: true}, async () => {

            const unidade = _.pick(this.state, [
                'transacao',
                //'codentsai',
                //'descricao',
            ])

            await new Service().Post('entrada-saida/salvar', unidade).then(async (result) => {
                await toaster.push(<Message showIcon type='success'>Salvo com sucesso!</Message>, {placement: 'topEnd', duration: 5000 })
                this.viewModal.current?.close(result.data)
            }).finally(() => this.setState({submting: false}));
        })
    }

    onTipoOperacao = async (tipo) => {
        Loading.Show('Carregando operações...')
        this.setState({tipoEntSai: {tipo}})
        await new Service().Post('entrada-saida/tipo-operacoes', {tipo}).then((result) => this.setState({tipoOperacoes: result.data})).finally(() => Loading.Hide())
    }

    close(role) {
        this.viewModal.current?.close(role)
    }

    handleInputChange = (event) => {

        let inputValue = event.target.value;

        // Substitui a vírgula por ponto para permitir formato decimal
        inputValue = inputValue.replace(',', '.');

        // Verifica se o valor digitado é numérico e não está vazio
        if (!isNaN(inputValue) && inputValue !== '') {
        // Remover qualquer ponto ou vírgula antes de dividir, tratando os centavos como inteiros
        const numValue = inputValue.replace(/\D/g, '');

        // Se a string estiver vazia, deve retornar 0,00
        if (numValue === '') {
            this.setState({ total: '0.00' });
            return;
        }

        // Transformar o valor em número inteiro (com centavos) e formatar corretamente com 2 casas decimais
        const valueInCents = parseInt(numValue);
        const formattedValue = (valueInCents / 100).toFixed(2);

        // Atualiza o estado com o valor formatado
        this.setState({ total: formattedValue });
        } else {
        // Se não for um valor válido, exibe 0,00
        this.setState({ total: '0.00' });
        }

    }

    columns = [
        { selector: (row) => row.transacao, name: 'Cod. ID', minWidth: '100px', maxWidth: '100px'},
        { selector: (row) => row.tipoEntSai.tipo, name: 'Tipo', minWidth: '100px', maxWidth: '100px'},
        { selector: (row) => row.tipoEntSai.descricao, name: 'Descrição do tipo', minWidth: '220px', maxWidth: '220px'},
        { selector: (row) => row.parceiro.nome, name: 'Parceiro', minWidth: '280px', maxWidth: '280px'},
        { selector: (row) => dayjs(row.emissao).format('DD/MM/YYYY'), name: 'Emissão', minWidth: '120px', maxWidth: '120px'},
        { selector: (row) => dayjs(row.dtmov).format('DD/MM/YYYY'), name: 'Entrada', minWidth: '120px', maxWidth: '120px'},
        { selector: (row) => row.numdoc, name: 'Num.docto', minWidth: '120px', maxWidth: '120px'},
        { selector: (row) => new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row.total), name: 'Valor', minWidth: '120px', maxWidth: '120px', right: true},
        { selector: (row) => row.obs, name: 'Obs.', minWidth: '300px', maxWidth: '300px'},
    ]

    render = () => {
        
        return (
            <Form autoComplete='off' onSubmit={this.submit}>
                <ViewModal ref={this.viewModal} size={900}>
                    <Modal.Header><Modal.Title><Container>Entrada/Saída</Container></Modal.Title></Modal.Header>
                    <Modal.Body>
                        <Row gutterWidth={0}>
                            <Col md={4}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.transacao} readOnly />
                                        <span>N.Transação</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={dayjs(this.state?.inclusao).format('DD/MM/YYYY HH:mm')} readOnly />
                                        <span>Dt.inclusão</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.alteracao ? dayjs(this.state?.alteracao).format('DD/MM/YYYY HH:mm') : ''} readOnly />
                                        <span>Ult. alteração</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className='form-control'>
                                    <label className="textfield-filled">
                                        <select value={this.state?.tipoEntSai?.tipo} onChange={(event) => this.onTipoOperacao(event.target.value)} >
                                            <option value="">[Selecione]</option>
                                            <option value="E">Entrada</option>
                                            <option value="S">Saída</option>
                                            <option value="A">Transferência</option>
                                        </select>
                                        <span>Tipo operação</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={9}>
                                <div className='form-control'>
                                    <label className="textfield-filled">
                                        <select value={this.state?.tipoEntSai?.codentsai} onChange={(event) => this.setState({orig: event.target.value})} >
                                            <option value="">[Selecione]</option>
                                            {_.map(this.state?.tipoOperacoes, (c) => <option value={c.codentsai}>{c.descricao}</option>)}
                                        </select>
                                        <span>Descrição</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={12}>
                                <div className='form-control'>
                                    <AutoComplete label='Parceiro' value={this.state?.parceiro} text={(item) => `${item.codparc} - ${item.nome}`} onChange={(parceiro) => this.setState({parceiro})} onSearch={async (search) => await Search.parceiro(search, this.state?.tipoEntSai?.tipo)}>
                                        <AutoComplete.Result>
                                            {(item) => <span>{item.codparc} - {item.nome}</span>}
                                        </AutoComplete.Result>
                                    </AutoComplete>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='date' value={this.state?.emissao} onChange={(event) => this.setState({emissao: event.target.value})} />
                                        <span>Dt.emissão</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='date' value={this.state?.dtmov} onChange={(event) => this.setState({dtmov: event.target.value})} />
                                        <span>Dt.Ent/Saí</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={4}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.transacao} readOnly />
                                        <span>Nº Doc</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={3}>
                                <div className='form-control'>
                                    <label className="textfield-filled">
                                        <input
                                        type="text"
                                        value={new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }).format(this.state?.total ?? 0)}
                                        //onChange={this.handleInputChange}
                                        readOnly
                                        style={{textAlign: 'right'}}
                                        />
                                        <span>Valor total</span>
                                    </label>
                                </div>
                            </Col>
                            <Col md={9}>
                                <div className='form-control'>
                                    <label class="textfield-filled">
                                        <input type='text' value={this.state?.obs} onChange={(event) => this.setState({obs: event.target.value.toUpperCase()})} />
                                        <span>Observação</span>
                                    </label>
                                </div>
                            </Col>

                            <Divider />

                            
                            <Col md={6}>
                                <div className='form-control'>
                                    <AutoComplete label='Produto' value={this.state?.produto} text={(item) => `${item.codprod} - ${item.descricao}`} onChange={(produto) => this.setState({produto})} onSearch={async (search) => await Search.produto(search)}>
                                        <AutoComplete.Result>
                                            {(item) => <span>{item.codprod} - {item.descricao}</span>}
                                        </AutoComplete.Result>
                                    </AutoComplete>
                                </div>
                            </Col>
                            <Col md={6}>
                                <Row gutterWidth={0}>
                                    <Col md={4}>
                                        <div className='form-control'>
                                            <label className="textfield-filled">
                                                <input
                                                type="text"
                                                value={new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }).format(this.state?.total ?? 0)}
                                                //onChange={this.handleInputChange}
                                                readOnly
                                                style={{textAlign: 'right'}}
                                                />
                                                <span>Quantidade</span>
                                            </label>
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div className='form-control'>
                                            <label className="textfield-filled">
                                                <input
                                                type="text"
                                                value={new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }).format(this.state?.total ?? 0)}
                                                //onChange={this.handleInputChange}
                                                readOnly
                                                style={{textAlign: 'right'}}
                                                />
                                                <span>Preço Un.</span>
                                            </label>
                                        </div>
                                    </Col>
                                    <Col md={4}>
                                        <div className='form-control'>
                                            <label className="textfield-filled">
                                                <input
                                                type="text"
                                                value={new Intl.NumberFormat('pt-BR', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false }).format(this.state?.total ?? 0)}
                                                //onChange={this.handleInputChange}
                                                readOnly
                                                style={{textAlign: 'right'}}
                                                />
                                                <span>Total</span>
                                            </label>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                            
                            <Col md={12}>
                                <Row gutterWidth={0}>
                                    <Col md={5}>
                                        <div className='form-control'>
                                            <label className="textfield-filled">
                                                <select value={this.state?.tipoEntSai?.tipo} onChange={(event) => this.onTipoOperacao(event.target.value)} >
                                                    <option value="">[Selecione]</option>
                                                    <option value="E">Entrada</option>
                                                    <option value="S">Saída</option>
                                                    <option value="A">Transferência</option>
                                                </select>
                                                <span>Origem</span>
                                            </label>
                                        </div>
                                    </Col>
                                    <Col md={5}>
                                        <div className='form-control'>
                                            <label className="textfield-filled">
                                                <select value={this.state?.tipoEntSai?.tipo} onChange={(event) => this.onTipoOperacao(event.target.value)} >
                                                    <option value="">[Selecione]</option>
                                                    <option value="E">Entrada</option>
                                                    <option value="S">Saída</option>
                                                    <option value="A">Transferência</option>
                                                </select>
                                                <span>Destino</span>
                                            </label>
                                        </div>
                                    </Col>
                                            
                                    <Col md={1}>
                                        <Button style={{marginTop: '10px'}} appearance="primary" color='blue' onClick={this.salvarEntradaSaida} disabled={this.state?.submting}><MdAddCircleOutline /> &nbsp;Inc.</Button>
                                    </Col>
                                    <Col md={1}>
                                        <Button style={{marginTop: '10px'}} appearance="primary" color='red' onClick={this.salvarEntradaSaida} disabled={this.state?.submting}><MdDelete /> &nbsp;Exc</Button>
                                    </Col>

                                </Row>
                            </Col>

                            <Col md={12}>
                                <div style={{height: '250px'}}>
                                    <table>
                                        <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Descrição</th>
                                            <th>Unid.</th>
                                            <th>Qtde</th>
                                            <th>Preço Un.</th>
                                            <th>Total</th>
                                            <th>Origem</th>
                                            <th>Destino</th>
                                        </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>1</td>
                                                <td>LARANJA</td>
                                                <td>KG</td>
                                                <td>10,00</td>
                                                <td>1</td>
                                                <td>10,00</td>
                                                <td></td>
                                                <td>DEPÓSITO</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </Col>
                        </Row>
                        
                    </Modal.Body>
                    <Modal.Footer>
                        <Button appearance="primary" color='green' onClick={this.salvarEntradaSaida} disabled={this.state?.submting}>{this.state?.submting ? <><Loader /> &nbsp; Salvando...</> : <><MdCheckCircleOutline /> &nbsp; Salvar</>}</Button>
                    </Modal.Footer>
                </ViewModal>
            </Form>
        )

    }

}

export default ViewEntradaSaida;