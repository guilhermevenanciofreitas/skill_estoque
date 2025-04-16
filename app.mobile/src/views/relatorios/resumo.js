import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView, RefreshControl
} from 'react-native';
import { Service } from '../../service';
import DateRangePicker from '../../controls/DateRangePicker';
import SelectInput from '../../controls/CustomSelect';
import { codemp } from '../login/login';
import { Empresa } from '../../app';
import DisplayAlert from '../../controls/DisplayAlert';

export const RelatorioResumoList = () => {
  
  const [displayAlert, setDisplayAlert] = useState(false)
  const [displayMessage, setDisplayMessage] = useState('')

  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState();

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

  // Função para buscar os dados
  const fetchData = async () => {

    if (!startDate) {
      setDisplayMessage("Informe a data inicial!")
      setDisplayAlert(true)
      return
    }

    if (!endDate) {
      setDisplayMessage("Informe a data final!")
      setDisplayAlert(true)
      return
    }

    setLoading(true);
    try {
      const result = await new Service().Post('relatorios/resumo/lista', {inicio: startDate, final: endDate, codemp: codemp});
      setProdutos(result.data?.response?.resumo || []);

      if (result.data?.response?.resumo.length == 0) {
        setDisplayMessage("Nenhum resultado encontrado!")
        setDisplayAlert(true)
      }
      
    } catch (error) {
      alert('Erro ao carregar os dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  /*
  useEffect(() => {
    fetchData();
  }, []);
  */

  // Função para detectar scroll no navegador
  const handleScroll = (event) => {
    if (event.nativeEvent.contentOffset.y <= 0 && !loading) {
      fetchData();
    }
  };

  const renderItem = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity>
          <View style={styles.itemHeader}>
            <View style={styles.productInfo}>
              <Text>{item.codentsai} - {item.operacao}</Text>
            </View>
            <Text>{new Intl.NumberFormat('pt-BR', {style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2}).format(parseFloat(item.valor))}</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>

      <DisplayAlert
        visible={displayAlert}
        title="Atenção"
        message={displayMessage}
        onClose={() => setDisplayAlert(false)}
      />

      <View style={{padding: 10}}>
        Empresa: {Empresa()}
      </View>

      <DateRangePicker startDate={startDate} endDate={endDate} onChange={(startDate, endDate) => {
        setStartDate(startDate)
        setEndDate(endDate)
      }} />

      {/* Botão de Recarregar */}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchData} disabled={loading}>
        <Text style={styles.refreshButtonText}>{loading ? 'Buscando...' : 'Buscar'}</Text>
      </TouchableOpacity>

      {/* ScrollView para Navegador */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} />
        }
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >

        <View style={styles.itemContainerTitle}>
          <TouchableOpacity>
            <View style={styles.itemTitle}>
              <View style={styles.productInfo}>
                <Text style={styles.saldo}>OPERAÇÃO</Text>
              </View>
              <Text style={styles.saldo}>VALOR</Text>
            </View>
          </TouchableOpacity>
        </View>

        <FlatList
          data={produtos}
          renderItem={renderItem}
          keyExtractor={(item) => item.id?.toString()}
        />
      </ScrollView>
    </View>
  );

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  refreshButton: {
    backgroundColor: '#6200EE',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  refreshButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  itemContainerTitle: {
    padding: 10,
  },
  itemContainer: {
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
  },
  itemHeader: {

    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    alignItems: 'center',
  },
  itemTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flexDirection: 'column',
  },
  saldo: {
    fontWeight: 'bold',
  },
  sublist: {
    marginTop: 10,
    paddingLeft: 10,
  },
  sublistItem: {
    paddingVertical: 10,
  },
  sublistItemWithBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  sublistRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sublistInfo: {
    flexDirection: 'column',
  },
});