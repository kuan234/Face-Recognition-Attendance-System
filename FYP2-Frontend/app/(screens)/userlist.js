import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, Image, Dimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';

const { width: screenWidth } = Dimensions.get('window');

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    department: '',
  });
  const [faceImage, setFaceImage] = useState(null);
  const [croppedFace, setCroppedFace] = useState(null);
  const [newcrop, setNewCrop] = useState(null);

  const serverIP = '192.168.0.132';
  const router = useRouter();

  useEffect(() => {
    fetch(`http://${serverIP}:8000/get/`)
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => {
        console.error('Error fetching users:', error);
      });
  }, []);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleOpenImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'You need to allow access to your photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setFaceImage(result.assets[0]);
      handleDetectFace(result.assets[0]);
    } else {
      Alert.alert('Error', 'You did not select any image.');
    }
  };

  const handleOpenCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Denied', 'You need to allow access to your camera.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      setFaceImage(result.assets[0]);
      handleDetectFace(result.assets[0]);
    } else {
      Alert.alert('Error', 'You did not capture any image.');
    }
  };

  const handleDetectFace = async (image) => {
    try {
      const data = new FormData();
      data.append('image', {
        uri: image.uri,
        type: 'image/jpeg',
        name: image.uri.split('/').pop(),
      });

      const response = await axios.post(`http://${serverIP}:8000/detect_face/`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.face_detected) {
        const annotated_image = response.data.annotated_image;
        const newcrop = response.data.cropped_image;
        console.log('[DEBUG] Face face: ', newcrop);
        setNewCrop(`http://${serverIP}:8000/${newcrop}`);
        setCroppedFace(`http://${serverIP}:8000/${annotated_image}?timestamp=${new Date().getTime()}`);
      } else {
        Alert.alert('No Face Detected', 'Please try another image.');
        setCroppedFace(null);
      }
    } catch (error) {
      Alert.alert('Please select a Face Image.');
    }
  };

  const handleAddEmployee = async () => {
    console.log('[DEBUG] newCrop: ', newcrop);
    if (!newcrop) {
      Alert.alert('Error', 'Please upload a valid image with a face.');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('password', formData.password);
    data.append('role', formData.role);
    data.append('department', formData.department);

    data.append('image', {
      uri: newcrop,
      type: 'image/jpeg', // Ensure the correct type
      name: newcrop.split('/').pop(),
    });
    console.log('[DEBUG] Form data being sent:', formData);

    try {
      const response = await axios.post(`http://${serverIP}:8000/add/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === 201) {
        Alert.alert('Success', 'Employee added successfully!');
        setModalVisible(false);
        setFormData({ name: '', email: '', password: '', role: 'employee', department: '' });
        setFaceImage(null);
        setCroppedFace(null);
        setUsers([...users, response.data]);
        setNewCrop(null);
      } else {
        Alert.alert('Error','Fill in all fields');
      }
    } catch (error) {
      Alert.alert('Error', 'Fill in all fields.');
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await axios.delete(`http://${serverIP}:8000/delete_user/${userId}/`);
      if (response.status === 200) {
        Alert.alert('Success', 'User deleted successfully');
        setUsers(users.filter(user => user.id !== userId));
      } else {
        Alert.alert('Error', 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      Alert.alert('Error', 'Failed to delete user.');
    }
  };

  const confirmDeleteUser = (userId) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => handleDeleteUser(userId) },
      ],
      { cancelable: true }
    );
  };


  const renderItem = ({ item }) => (
    <View style={styles.userRow}>
      <Text style={styles.userName}>{item.name}</Text>
      <Text style={styles.userName}>{item.role}</Text>
      <TouchableOpacity onPress={() => confirmDeleteUser(item.id)}>
        <MaterialCommunityIcons name="delete" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  const params = useLocalSearchParams();
  const { name, id, role } = params; // Get `name` and `id` from route params

  const navigateToDashboard = () => {
    router.replace({
      pathname: '/(screens)/dashboard',
      params: { id, name, role },
    });  };

  const navigateToAttendance = () => {
    router.replace({
      pathname: '/(screens)/attendance_admin',
      params: { id, name, role },
    });  };

  const navigateToEditProfile = () => {
    router.replace({
      pathname: '/(screens)/editprofile',
      params: { id, name, role },
    });  };

  const navigateToUpdateTimes = () => {
    router.replace({
      pathname: '/(screens)/updateTimes',
      params: { id, name, role },
    });
  };

  const navigateToUserList = () => {
    router.replace({
      pathname: '/(screens)/userlist',
      params: { id, name, role },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>Add Employee</Text>
      </TouchableOpacity>

      <FlatList
        data={users}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={<Text>No users available</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Employee</Text>

            <TextInput
              style={styles.input}
              placeholder="Name"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              secureTextEntry
            />
            <View style={styles.dropdownContainer}>
              <Text style={styles.dropdownLabel}>Role:</Text>
              <Picker
                selectedValue={formData.role}
                onValueChange={(value) => handleInputChange('role', value)}
                style={styles.dropdown}
              >
                <Picker.Item label="Employee" value="employee" />
                <Picker.Item label="Admin" value="admin" />
              </Picker>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Department"
              value={formData.department}
              onChangeText={(text) => handleInputChange('department', text)}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.imageButton} onPress={handleOpenImagePicker}>
                <Text style={styles.imageButtonText}>Upload Image</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.imageButton} onPress={handleOpenCamera}>
                <Text style={styles.imageButtonText}>Capture Image</Text>
              </TouchableOpacity>
            </View>
            {croppedFace && <Image source={{ uri: croppedFace }} style={styles.previewImage} />}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.actionText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.saveButton]}
                onPress={handleAddEmployee}
              >
                <Text style={styles.actionText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
          onPress={() => router.replace({
                        pathname: '/(screens)/dashboard',
                        params: { id, name, role },
                    })}>
            <MaterialCommunityIcons name="home" size={30} color="#7F8C8D" />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToAttendance}>
            <MaterialCommunityIcons name="calendar" size={30} color="#7F8C8D" />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToUserList}>
            <MaterialCommunityIcons name="account-multiple" size={30} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToUpdateTimes}>
            <MaterialCommunityIcons name="clock-edit" size={30} color="#7F8C8D" />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToEditProfile}>
            <MaterialCommunityIcons name="account" size={30} color="#7F8C8D" />
          </TouchableOpacity>
        </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 1,
  },
  userName: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  imageButton: {
    marginBottom: 20,
    backgroundColor: '#e7e7e7',
    padding: 10,
    borderRadius: 5,
  },
  imageButtonText: {
    fontSize: 16,
    color: '#555',
  },
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 15,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#007bff',
  },
  actionText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dropdownContainer: {
    width: '100%',
    marginBottom: 15,
  },
  dropdownLabel: {
    marginBottom: 5,
    fontSize: 16,
    color: '#333',
  },
  dropdown: {
    height: 50,
    backgroundColor: '#f9f9f9',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center', // Align the text vertically
  },
  dropdownItem: {
    fontSize: 16, // Adjust font size for better readability
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 10,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: screenWidth,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
});

export default UserList;