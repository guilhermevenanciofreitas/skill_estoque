import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView, RefreshControl
} from 'react-native';
import { Service } from '../../service';
import DateRangePicker from '../../controls/DateRangePicker';

export const RelatorioResumoList = () => {
  
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

  // Função para buscar os dados
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await new Service().Post('relatorios/resumo/lista', {inicio: startDate, final: endDate});
      setProdutos(result.data?.response?.resumo || []);
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
            <Text style={styles.saldo}>Valor: {item.valor.toFixed(2).replace('.', ',')}</Text>
          </View>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>

      <DateRangePicker startDate={startDate} endDate={endDate} onChange={(startDate, endDate) => {
        setStartDate(startDate)
        setEndDate(endDate)
      }} />

      {/* Botão de Recarregar */}
      <TouchableOpacity style={styles.refreshButton} onPress={fetchData} disabled={loading}>
        <Text style={styles.refreshButtonText}>{loading ? 'Atualizando...' : 'Recarregar'}</Text>
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