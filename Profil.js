import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Navbar from './components/Navbar';
import Header from './components/Header';

const Profile = ({ getToken, profileChanged }) => {
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState({ firstname: '', lastname: '', email: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();
      if (token) {
        try {
          const response = await fetch('http://192.168.1.63:3000/profil', {
            method: 'GET',
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json',
            }
          });

          if (!response.ok) {
            throw new Error('Failed to fetch profile');
          }

          const data = await response.json();
          if (data && data.data && data.data.length > 0) {
            setProfileData(data.data[0]);
          } else {
            throw new Error('No profile data available');
          }
        } catch (error) {
          setError('Error: ' + error.message);
        }
      } else {
        setError('No token available.');
      }
    };

    fetchData();
  }, [profileChanged]);

  return (
    <View style={styles.container}>
    <Header /> 
    <View style={styles.profile}>
      <View style={styles.avatarContainer}>
        <Text style={styles.avatar}>{profileData.firstname[0]}{profileData.lastname[0]}</Text>
      </View>
      <Text style={styles.name}>{profileData.firstname} {profileData.lastname}</Text>
      <Text style={styles.email}>{profileData.email}</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('UpdateProfile', { profileData })}>
        <Text style={styles.buttonText}>Modifier le profil</Text>
      </TouchableOpacity>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    flex: 1,
    backgroundColor: '#fff',
    
  },
  profile: {
    marginTop: 40,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    fontSize: 36,
    color: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5
  },
  email: {
    fontSize: 18,
    color: 'gray',
    marginBottom: 20
  },
  button: {
    backgroundColor: '#000',
    padding: 12,
    marginTop: 20,
    width: '90%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  error: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
  }
});

export default Profile;
