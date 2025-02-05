import React, { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView, ActivityIndicator, ScrollView, Modal, TextInput, Button, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';

const EditProfileScreen = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [faceModalVisible, setFaceModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [croppedFace, setCroppedFace] = useState(null);
  const [newCrop, setNewCrop] = useState(null);
  const params = useLocalSearchParams();
  const { id, name, role } = params; 
  const serverIP = '192.168.0.132'; 

  const router = useRouter();

  const navigateToDashboard = () => {
    const pathname = (role === 'admin' || role === 'superadmin') ? '/(screens)/dashboard' : '/(screens)/user_dashboard';
    router.replace({
      pathname,
      params: { id, name, role },
    });
  };

  const navigateToUserList = () => {
    router.replace({
      pathname: '/(screens)/userlist',
      params: { id, name, role },
    });
  };

  const navigateToAttendance = () => {
    router.replace({
      pathname: '/(screens)/attendance_admin',
      params: { id, name, role },
    });
  };

  const navigateToEditProfile = () => {
    router.replace({
      pathname: '/(screens)/editprofile',
      params: { id, name, role },
    });
  };

  const navigateToUpdateTimes = () => {
    router.replace({
      pathname: '/(screens)/updateTimes',
      params: { id, name, role },
    });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'You have been logged out successfully.');
    router.replace('/');
  };


  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await axios.get(`http://${serverIP}:8000/get`, {
          params: { user_id: id },
        });
        setProfileData(response.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  const handleChangePassword = async () => {
    try {
      const response = await axios.post(`http://${serverIP}:8000/changePassword/`, {
        user_id: id,
        current_password: currentPassword,
        new_password: newPassword,
      });
      if (response.data.success) {
        alert('Password changed successfully');
        setModalVisible(false);
      } else {
        alert(response.data.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password');
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
        params: { user_id: id },
      });

      if (response.data.face_detected) {
        const annotated_image = response.data.annotated_image;
        const newcrop = response.data.cropped_image;
        setNewCrop(`http://${serverIP}:8000/${newcrop}`);
        setCroppedFace(`http://${serverIP}:8000/${annotated_image}?timestamp=${new Date().getTime()}`);
      } else {
        Alert.alert('No Face Detected', 'Please try another image.');
        setCroppedFace(null);
      }
    } catch (error) {
      console.error('Error detecting face:', error);
      Alert.alert('Error', 'Failed to detect face.');
    }
  };


  const handleUploadFaceData = async () => {
    if (!newCrop) {
      Alert.alert('No Image', 'Please capture a new face image first.');
      return;
    }

    try {
      const data = new FormData();
      data.append('faceImage', {
        uri: newCrop,
        type: 'image/jpeg',
        name: newCrop.split('/').pop(),
      });

      const response = await axios.post(`http://${serverIP}:8000/update_face_image/`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        params: { user_id: id },
      });

      if (response.status === 200) {
        Alert.alert('Success', 'Face image updated successfully.');
        setFaceModalVisible(false);
      } else {
        Alert.alert('Error', 'Failed to update face image.');
      }
    } catch (error) {
      console.error('Error uploading face image:', error);
      Alert.alert('Error', 'Failed to upload face image.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </SafeAreaView>
    );
  }

  if (!profileData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Failed to load profile data.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.header}>
          <Text style={styles.username}>{profileData.name}</Text>
        </View>

        <View style={styles.content}>
          <TouchableOpacity style={styles.item}>
            <Text style={styles.label}>Full Name</Text>
            <Text style={styles.value}>{profileData.name}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.item}>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{profileData.role.toUpperCase()}</Text>
          </TouchableOpacity>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Login & Security</Text>
          </View>

          <TouchableOpacity style={styles.item}>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{profileData.email}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => setModalVisible(true)}>
            <Text style={styles.label}>Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.item} onPress={() => setFaceModalVisible(true)}>
            <Text style={styles.label}>Update Face Data</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                      <Text style={styles.logoutButtonText}>Log Out</Text>
                      </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <View style={styles.buttonRow}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Change" onPress={handleChangePassword} />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={faceModalVisible}
        onRequestClose={() => {
          setFaceModalVisible(!faceModalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Update Face Data</Text>
            {croppedFace && (
              <Image
                source={{ uri: croppedFace }}
                style={styles.faceImage}
              />
            )}
            <TouchableOpacity style={[styles.modalButton, styles.captureButton]} onPress={handleOpenCamera}>
              <Text style={styles.modalButtonText}>Capture New Face Data</Text>
            </TouchableOpacity>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setFaceModalVisible(false)}>
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleUploadFaceData}>
                <Text style={styles.modalButtonText}>Save</Text>
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
            <MaterialCommunityIcons name="account-multiple" size={30} color="#7F8C8D" />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToUpdateTimes}>
            <MaterialCommunityIcons name="clock-edit" size={30} color="#7F8C8D" />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToEditProfile}>
            <MaterialCommunityIcons name="account" size={30} color="#007AFF" />
          </TouchableOpacity>
        </View>
    </SafeAreaView>

    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollViewContent: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#343a40',
  },
  content: {
    flex: 1,
  },
  item: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    color: '#6c757d',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#495057',
  },
  sectionHeader: {
    marginTop: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#343a40',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    marginVertical: 10,
    paddingVertical: 15, // Increase padding for better appearance
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center', // Center text vertically
    minHeight: 50, // Ensure button doesn't shrink too much
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  captureButton: {
    backgroundColor: '#007bff', // Blue color for the capture button
  },
  cancelButton: {
    backgroundColor: '#dc3545', // Red for cancel
  },
  saveButton: {
    backgroundColor: '#28a745', // Green for save
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16, // Ensure text is legible
    textAlign: 'center', // Center align the text
  },
  faceImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
  },
  bottomNav: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      paddingVertical: 15,
      borderTopWidth: 1,
      borderTopColor: '#E0E0E0',
      backgroundColor: '#FFFFFF',
    },
    logoutButton: {
      marginTop: 20,
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderRadius: 8,
      backgroundColor: '#FF3B30',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logoutButtonText: {
      color: '#FFF',
      fontWeight: 'bold',
    },
});

export default EditProfileScreen;