import React, { useState, useEffect } from 'react';
import { Modal, View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Navbar from './components/Navbar';
import Header from './components/Header';

const formatDate = (date) => {
  const d = new Date(date);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return `le ${d.toLocaleDateString('fr-FR', options)}`;
};

const Home = ({ getToken }) => {
  const [workouts, setWorkouts] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [addFormError, setAddFormError] = useState('');

  const [editFormData, setEditFormData] = useState({
    date: new Date(),
    activity_name: '',
    time: '',
    comment: ''
  });
  const [addFormData, setAddFormData] = useState({
    date: new Date(),
    activity_name: '',
    time: '',
    comment: ''
  });
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAddDatePicker, setShowAddDatePicker] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const token = await getToken();
      if (token) {
        try {
          const response = await fetch('http://192.168.1.63:3000/getTrainings', {
            method: 'GET',
            headers: {
              'Authorization': token,
              'Content-Type': 'application/json',
            }
          });

          if (!response.ok) {
            throw new Error('Échec de la récupération des entraînements');
          }

          const data = await response.json();
          if (data && data.data && data.data.length > 0) {
            setWorkouts(data.data);
          } else {
            throw new Error('Aucune donnée d\'entraînement disponible');
          }
        } catch (error) {
          setError('Erreur: ' + error.message);
        }
      } else {
        setError('Aucun token disponible');
      }
    };

    fetchData();
  }, [getToken]);

  const handleDelete = (id) => {
    setModalVisible(true);
    setSelectedId(id);
  };

  const confirmDelete = async () => {
    const token = await getToken();
    const response = await fetch(`http://192.168.1.63:3000/trainings/${selectedId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      }
    });

    if (response.ok) {
      setWorkouts(prevWorkouts => prevWorkouts.filter(workout => workout.id !== selectedId));
      setModalVisible(false);
      setSelectedId(null);
    } else {
      console.error('Échec de la suppression de l\'entraînement');
    }
  };

  const handleEditIconClick = (workout) => {
    setEditFormData({
      date: new Date(workout.date),
      activity_name: workout.activity_name,
      time: workout.time,
      comment: workout.comment
    });
    setSelectedId(workout.id);
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    const token = await getToken();
    const response = await fetch(`http://192.168.1.63:3000/trainings/${selectedId}`, {
      method: 'PUT',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...editFormData,
        date: editFormData.date.toISOString().split('T')[0] // Format date to YYYY-MM-DD
      })
    });

    if (response.ok) {
      const updatedWorkouts = workouts.map(workout => {
        if (workout.id === selectedId) {
          return { ...workout, ...editFormData, date: editFormData.date.toISOString().split('T')[0] };
        }
        return workout;
      });
      setWorkouts(updatedWorkouts);
      setEditModalVisible(false);
    } else {
      console.error('Échec de la mise à jour de l\'entraînement');
    }
  };

  const showDatepicker = () => {
    setShowDatePicker(true);
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || editFormData.date;
    setShowDatePicker(Platform.OS === 'ios');
    setEditFormData({ ...editFormData, date: currentDate });
  };

  const showAddDatepicker = () => {
    setShowAddDatePicker(true);
  };

  const onAddDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || addFormData.date;
    setShowAddDatePicker(Platform.OS === 'ios');
    setAddFormData({ ...addFormData, date: currentDate });
  };

  const handleAdd = async () => {
    if (!addFormData.activity_name || !addFormData.time || !addFormData.comment) {
      setAddFormError('Tous les champs doivent être remplis.');
      return;
    }
    const token = await getToken();
    const response = await fetch('http://192.168.1.63:3000/addTraining', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...addFormData,
        date: addFormData.date.toISOString().split('T')[0] // Format date to YYYY-MM-DD
      })
    });
  
    if (response.ok) {
      const newWorkout = await response.json();
      setWorkouts([...workouts, { ...addFormData, id: newWorkout.id, date: formatDate(addFormData.date) }]);
      setAddModalVisible(false);
      setAddFormData({
        date: new Date(),
        activity_name: '',
        time: '',
        comment: ''
      });
      
      setAddFormError('');
    } else {
      console.error('Échec de l\'ajout de l\'entraînement');
    }
  };

  return (
    <View style={styles.container}>
      <Header />
      <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}>
        <Icon name="add" size={24} color="#000" />
        <Text style={styles.addButtonText}>Ajouter un entraînement</Text>
      </TouchableOpacity>
      {/* Delete Confirmation Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Confirmation de suppression</Text>
            <Text style={styles.modalText}>Êtes-vous sûr de vouloir supprimer cet entraînement ?</Text>
            <TouchableOpacity
              style={styles.buttonClose}
              onPress={() => setModalVisible(!modalVisible)}>
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonDelete}
              onPress={confirmDelete}>
              <Text style={styles.buttonText}>Supprimer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Edit Workout Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => {
          setEditModalVisible(!editModalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Modifier l'entraînement</Text>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity onPress={showDatepicker} style={styles.dateInput}>
              <Text style={styles.dateText}>
                {formatDate(editFormData.date)}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={editFormData.date}
                mode="date"
                display="default"
                onChange={onDateChange}
              />
            )}
            <Text style={styles.label}>Nom de l'activité</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setEditFormData({ ...editFormData, activity_name: text })}
              value={editFormData.activity_name}
              placeholder="Nom de l'activité"
            />
            <Text style={styles.label}>Durée (minutes)</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setEditFormData({ ...editFormData, time: text })}
              value={editFormData.time}
              placeholder="Durée (minutes)"
              keyboardType="numeric"
            />
            <Text style={styles.label}>Commentaire</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setEditFormData({ ...editFormData, comment: text })}
              value={editFormData.comment}
              placeholder="Commentaire"
            />
            <TouchableOpacity
              style={styles.buttonClose}
              onPress={() => setEditModalVisible(false)}>
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonUpdate}
              onPress={handleUpdate}>
              <Text style={styles.buttonText}>Mettre à jour</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {/* Add Workout Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={addModalVisible}
        onRequestClose={() => {
          setAddModalVisible(!addModalVisible);
        }}>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Ajouter un nouvel entraînement</Text>
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity onPress={showAddDatepicker} style={styles.dateInput}>
              <Text style={styles.dateText}>
                {formatDate(addFormData.date)}
              </Text>
            </TouchableOpacity>
            {showAddDatePicker && (
              <DateTimePicker
                value={addFormData.date}
                mode="date"
                display="default"
                onChange={onAddDateChange}
              />
            )}
            <Text style={styles.label}>Nom de l'activité</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setAddFormData({ ...addFormData, activity_name: text })}
              value={addFormData.activity_name}
              placeholder="Nom de l'activité"
            />
            <Text style={styles.label}>Durée (minutes)</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setAddFormData({ ...addFormData, time: text })}
              value={addFormData.time}
              placeholder="Durée (minutes)"
              keyboardType="numeric"
            />
            <Text style={styles.label}>Commentaire</Text>
            <TextInput
              style={styles.input}
              onChangeText={(text) => setAddFormData({ ...addFormData, comment: text })}
              value={addFormData.comment}
              placeholder="Commentaire"
            />
            <TouchableOpacity
              style={styles.buttonClose}
              onPress={() => setAddModalVisible(false)}>
              <Text style={styles.buttonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.buttonUpdate}
              onPress={handleAdd}>
              <Text style={styles.buttonText}>Ajouter</Text>
            </TouchableOpacity>
            {addFormError ? <Text style={styles.error}>{addFormError}</Text> : null}
          </View>
        </View>
      </Modal>
      {workouts.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollView}>
          {workouts.map((workout) => (
            <View key={workout.id} style={styles.workoutCard}>
              <Text style={styles.workoutDate}>{formatDate(workout.date)}</Text>
              <View style={styles.cardHeader}>
                <Text style={styles.workoutTitle}>{workout.activity_name}</Text>
                <View style={styles.icons}>
                  <TouchableOpacity onPress={() => handleEditIconClick(workout)}>
                    <Icon name="edit" size={20} color="#000" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(workout.id)} style={styles.deleteIcon}>
                    <Icon name="delete" size={20} color="#FF0000" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.workoutDuration}>{workout.time} min</Text>
              <Text style={styles.workoutDescription}>{workout.comment}</Text>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Text style={styles.error}>Aucun entraînement disponible</Text>
      )}
      <Navbar />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    flex: 1,
    backgroundColor: '#fff',
    paddingBottom: 60,
  },
  scrollView: {
    padding: 20,
    alignItems: 'center',
  },
  workoutCard: {
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  workoutDate: {
    color: '#A9A9A9',
    marginBottom: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  icons: {
    flexDirection: 'row',
  },
  deleteIcon: {
    marginLeft: 25,
  },
  workoutDuration: {
    color: '#555',
    marginBottom: 5,
  },
  workoutDescription: {
    fontSize: 14,
    color: '#555',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 10,
  },
  addButtonText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  buttonClose: {
    backgroundColor: '#000',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    marginBottom: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonDelete: {
    backgroundColor: '#000',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: '80%',
    alignItems: 'center',
  },
  buttonUpdate: {
    backgroundColor: '#000',
    borderRadius: 20,
    padding: 10,
    elevation: 2,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    width: '80%',
  },
  label: {
    alignSelf: 'flex-start',
    marginLeft: 35,
    marginBottom: -5,
    marginTop: 5,
    fontSize: 16,
    color: '#555',
  },
  dateInput: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    justifyContent: 'center',
    width: '80%',
  },
  dateText: {
    fontSize: 16,
  },
  error: {
    marginTop: 20,
    fontSize: 16,
    color: 'red',
  },
});

export default Home;
