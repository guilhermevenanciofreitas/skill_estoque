import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function SelectInput({label, onChange}) {

  const [selectedValue, setSelectedValue] = useState('0');

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Picker
        selectedValue={selectedValue}
        style={styles.picker}
        onValueChange={(itemValue, itemIndex) => {
          setSelectedValue(itemValue)
          onChange(itemValue)
        }}
      >
        <Picker.Item label="[Empresa]" value="0" />
        <Picker.Item label="GASTROBAR" value="1" />
        <Picker.Item label="RESTAURANTE GUARANY" value="2" />
        <Picker.Item label="RESTAURANTE 242" value="3" />
      </Picker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    padding: 10,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  picker: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
});
