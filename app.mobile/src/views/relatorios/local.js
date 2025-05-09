import React, { useEffect, useState, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView, RefreshControl
} from 'react-native';
import { Service } from '../../service';
import { CustomInput } from '../../controls/CustomInput';
import { codemp } from '../login/login';
import { Empresa } from '../../app';
import DisplayAlert from '../../controls/DisplayAlert';

export const RelatorioLocalList = () => {

  const [displayAlert, setDisplayAlert] = useState(false)

  const [search, setSearch] = useState('')

  const [selectedProductId, setSelectedProductId] = useState(null);
  const [locais, setLocais] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef(null);

  // Função para buscar os dados
  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await new Service().Post('relatorios/local/lista', {search: {picker: 'descricao', input: search}, codemp});
      setLocais(result.data?.response?.rows || []);

      if (result.data?.response?.rows.length == 0) {
        setDisplayAlert(true)
      }

    } catch (error) {
      alert('Erro ao carregar os dados: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Função para detectar scroll no navegador
  const handleScroll = (event) => {
    if (event.nativeEvent.contentOffset.y <= 0 && !loading) {
      fetchData();
    }
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedProductId === item.codloc;

    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={() => setSelectedProductId(isSelected ? null : item.codloc)}>
          <View style={styles.itemHeader}>
            <View style={styles.productInfo}>
              <Text>{item.codloc} - {item.descricao}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.sublist}>
            {item.estoques.map((local, index) => (
              <View key={index} style={[styles.sublistItem, index !== item.estoques.length - 1 && styles.sublistItemWithBorder]}>
                <View style={styles.sublistRow}>
                  <View style={styles.sublistInfo}>
                    <Text>{local.produto?.codprod} - {local.produto?.descricao}</Text>
                  </View>
                  <Text>{local.saldo.toFixed(2).replace('.', ',')}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>

      <DisplayAlert
        visible={displayAlert}
        title="Atenção"
        message="Nenhum registro encontrado!"
        onClose={() => setDisplayAlert(false)}
      />

      <View style={{padding: 10}}>
        Empresa: {Empresa()}
      </View>

      <CustomInput label={'Descrição'} value={search} onChangeText={(search) => {
        setSearch(search.toUpperCase())
        fetchData()
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
        <View style={{padding: 10}}>
          <TouchableOpacity>
            <View>
              <View>
                <Text>(Clique no item para exibir o estoque por produto)</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
        <View style={{padding: 10}}>
          <TouchableOpacity>
            <View style={styles.itemTitle}>
              <View style={styles.productInfo}>
                <Text style={styles.saldo}>DESCRIÇÃO</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={locais}
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