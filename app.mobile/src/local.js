import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';

const produtos = [
  { id: '1', codigo: 'P001', descricao: 'Produto 1', saldo: 100, locais: [{ codigoLocal: 'L001', descricaoLocal: 'Local 1', saldoLocal: 50 }, { codigoLocal: 'L002', descricaoLocal: 'Local 2', saldoLocal: 50 }] },
  { id: '2', codigo: 'P002', descricao: 'Produto 2', saldo: 200, locais: [{ codigoLocal: 'L003', descricaoLocal: 'Local 3', saldoLocal: 100 }, { codigoLocal: 'L004', descricaoLocal: 'Local 4', saldoLocal: 100 }] },
  { id: '3', codigo: 'P003', descricao: 'Produto 3', saldo: 300, locais: [{ codigoLocal: 'L005', descricaoLocal: 'Local 5', saldoLocal: 150 }, { codigoLocal: 'L006', descricaoLocal: 'Local 6', saldoLocal: 150 }] },
];

const LocalList = () => {
  const [selectedProductId, setSelectedProductId] = useState(null);

  const renderItem = ({ item }) => {
    const isSelected = selectedProductId === item.id;

    return (
      <View style={styles.itemContainer}>
        <TouchableOpacity onPress={() => setSelectedProductId(isSelected ? null : item.id)}>
          <View style={styles.itemHeader}>
            <View style={styles.productInfo}>
              <Text style={styles.productCode}>{item.codigo}</Text>
              <Text>{item.descricao}</Text>
            </View>
            <Text style={styles.saldo}>Saldo: {item.saldo}</Text>
          </View>
        </TouchableOpacity>

        {isSelected && (
          <View style={styles.sublist}>
            {item.locais.map((local, index) => (
              <View key={index} style={[styles.sublistItem, index !== item.locais.length - 1 && styles.sublistItemWithBorder]}>
                <View style={styles.sublistRow}>
                  <View style={styles.sublistInfo}>
                    <Text>Código Local: {local.codigoLocal}</Text>
                    <Text>Descrição Local: {local.descricaoLocal}</Text>
                  </View>
                  <Text style={styles.saldo}>{local.saldoLocal}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      data={produtos}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
    />
  );
};

const styles = StyleSheet.create({
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
  productCode: {
    fontWeight: 'bold',
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
    borderBottomColor: '#ccc',  // Cor cinza da linha
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

export default LocalList;
