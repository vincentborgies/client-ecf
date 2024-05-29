import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const Header = () => {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        <Text style={{ color: 'orange' }}>F</Text>IT <Text style={{ color: 'orange' }}>T</Text>RACK
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 25,
    backgroundColor: '#000',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});

export default Header;
