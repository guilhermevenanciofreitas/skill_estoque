import React from 'react';
import { View, StyleSheet } from 'react-native';
import SelectInput from '../../controls/CustomSelect';

export var codemp = 0

export const Login = ({onChange}) => {

  return (
    <View style={styles.container}>
      <SelectInput onChange={(value) => {
        codemp = value
        if (value == '0') {
          return
        }
        onChange()
      }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
});