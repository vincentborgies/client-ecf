import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = ({ storeToken, eraseToken }) => {
  const navigation = useNavigation();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await fetch('http://192.168.1.63:3000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (data.error) {
        setError(data.error);
      } else {
        await eraseToken();
        await storeToken(data.token);
        navigation.navigate('Home');
      }
    } catch (error) {
      setError('Error: ' + error.message);
    }
  };

  const handleRegister = async () => {
    try {
      const response = await fetch('http://192.168.1.63:3000/addUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });
      const data = await response.json();
      if (data.erreur) {
        setError(JSON.stringify(data.erreur));
      } else {
        setIsLogin(true);
        setError('');
      }
    } catch (error) {
      setError('Error: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>
        <Text style={{ color: 'orange' }}>F</Text>IT <Text style={{ color: 'orange' }}>T</Text>RACK
      </Text>
      <Text style={styles.title}>{isLogin ? 'BIENVENUE' : 'INSCRIVEZ-VOUS'}</Text>
      <View style={styles.switchContainer}>
        <TouchableOpacity onPress={() => setIsLogin(true)} style={[styles.switchButton, isLogin && styles.activeButton]}>
          <Text style={[styles.switchButtonText, isLogin && styles.activeButtonText]}>Connexion</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsLogin(false)} style={[styles.switchButton, !isLogin && styles.activeButton]}>
          <Text style={[styles.switchButtonText, !isLogin && styles.activeButtonText]}>Inscription</Text>
        </TouchableOpacity>
      </View>
      {!isLogin && (
        <>
          <TextInput style={styles.input} onChangeText={setFirstName} value={firstName} placeholder="Prénom" />
          <TextInput style={styles.input} onChangeText={setLastName} value={lastName} placeholder="Nom de famille" />
        </>
      )}
      <TextInput style={styles.input} onChangeText={setEmail} value={email} placeholder="Email" keyboardType="email-address" />
      <TextInput style={styles.input} onChangeText={setPassword} value={password} placeholder="Mot de passe" secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={isLogin ? handleLogin : handleRegister}>
        <Text style={styles.buttonText}>{isLogin ? 'Connexion' : 'Inscription'}</Text>
      </TouchableOpacity>
      
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  input: { height: 50, width: '80%', marginVertical: 10, borderWidth: 1, padding: 10 },
  button: { backgroundColor: 'black', padding: 12, marginTop: 8, width: '80%' },
  buttonText: { color: 'white', textAlign: 'center' },
  switchContainer: { flexDirection: 'row', marginTop: 20 },
  switchButton: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#ccc' },
  switchButtonText: { fontWeight: 'bold' },
  activeButton: { backgroundColor: 'orange' },
  activeButtonText: { color: 'white' },
});

export default LoginScreen;
