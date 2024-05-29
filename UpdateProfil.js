import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Navbar from './components/Navbar';
import Header from './components/Header';

// Fonction pour obtenir les initiales à partir du prénom et du nom
const getInitials = (firstname, lastname) => {
  const initials = `${firstname[0]}${lastname[0]}`;
  return initials.toUpperCase();
};

const UpdateProfile = ({ route, getToken, setProfileChanged, profileChanged }) => {
    const navigation = useNavigation();
    const [profileData, setProfileData] = useState({ firstname: '', lastname: '', email: '' });
    const [editableData, setEditableData] = useState(profileData);
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
                        setEditableData(data.data[0]);
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
    }, [getToken]); 

    const saveProfile = async () => {
        const token = await getToken();
        if (!token) {
            setError('Authentication token is not available.');
            return;
        }

        const payload = {};
        ['firstname', 'lastname', 'email'].forEach(field => {
            if (editableData[field] !== profileData[field]) {
                payload[field] = editableData[field];
            }
        });

        if (Object.keys(payload).length === 0) {
            setError('No changes to save.');
            return;
        }

        try {
            const response = await fetch(`http://192.168.1.63:3000/updateProfil/${profileData.id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('La mise à jour du profil a échoué.');
            }

            const result = await response.json();
            if (result.valid) {
                setProfileChanged(profileChanged+1);
                navigation.goBack();
            } else {
                setError(result.message || 'La mise à jour du profil a échoué.');
            }
        } catch (error) {
            setError('Error: ' + error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Header />
            <View style={styles.profile}>
                <View style={styles.avatarContainer}>
                    <Text style={styles.avatar}>{getInitials(editableData.firstname, editableData.lastname)}</Text>
                </View>
                <TextInput
                    style={styles.input}
                    value={editableData.firstname}
                    onChangeText={text => setEditableData({ ...editableData, firstname: text })}
                />
                <TextInput
                    style={styles.input}
                    value={editableData.lastname}
                    onChangeText={text => setEditableData({ ...editableData, lastname: text })}
                />
                <TextInput
                    style={styles.input}
                    value={editableData.email}
                    onChangeText={text => setEditableData({ ...editableData, email: text })}
                />
                <TouchableOpacity style={styles.button} onPress={saveProfile}>
                    <Text style={styles.buttonText}>Enregistrer</Text>
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
    input: {
        height: 40,
        width: '90%',
        marginVertical: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        backgroundColor: '#fff',
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

export default UpdateProfile;
