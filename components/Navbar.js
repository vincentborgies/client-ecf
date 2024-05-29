import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const Navbar = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.navbar}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Icon name="home" size={30} color="#FFA500" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
        <Icon name="person" size={30} color="#FFA500" />
        </TouchableOpacity>

      <TouchableOpacity onPress={() => {
      
        navigation.navigate('Login');
      }}>
        <Icon name="logout" size={30} color="#FFA500" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: 60,
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    borderTopWidth: 0,
  }
});

export default Navbar;
