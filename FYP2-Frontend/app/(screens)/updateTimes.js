import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button, Alert, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons

const { width: screenWidth } = Dimensions.get('window');

export default function UpdateTimesScreen() {
  const params = useLocalSearchParams();
  const { id, name, role } = params; // Get `id` and `name` from route params
  const [checkInStartHour, setCheckInStartHour] = useState('00');
  const [checkInStartMinute, setCheckInStartMinute] = useState('00');
  const [checkInEndHour, setCheckInEndHour] = useState('00');
  const [checkInEndMinute, setCheckInEndMinute] = useState('00');
  const [checkOutStartHour, setCheckOutStartHour] = useState('00');
  const [checkOutStartMinute, setCheckOutStartMinute] = useState('00');
  const [checkOutEndHour, setCheckOutEndHour] = useState('00');
  const [checkOutEndMinute, setCheckOutEndMinute] = useState('00');
  const router = useRouter();
  const serverIP = '192.168.0.132'; 

  const navigateToUserList = () => {
    router.replace({
      pathname: '/(screens)/userlist',
      params: { id, name, role },
    });
  };

  const navigateToDashboard = () => {
    router.replace({
      pathname: '/(screens)/dashboard',
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



  useEffect(() => {
    const fetchTimes = async () => {
      try {
        const response = await axios.get(`http://${serverIP}:8000/get_times/`);
        if (response.data) {
          const { check_in_start, check_in_end, check_out_start, check_out_end } = response.data;
          const [checkInStartHour, checkInStartMinute] = check_in_start.split(':');
          const [checkInEndHour, checkInEndMinute] = check_in_end.split(':');
          const [checkOutStartHour, checkOutStartMinute] = check_out_start.split(':');
          const [checkOutEndHour, checkOutEndMinute] = check_out_end.split(':');
          setCheckInStartHour(checkInStartHour);
          setCheckInStartMinute(checkInStartMinute);
          setCheckInEndHour(checkInEndHour);
          setCheckInEndMinute(checkInEndMinute);
          setCheckOutStartHour(checkOutStartHour);
          setCheckOutStartMinute(checkOutStartMinute);
          setCheckOutEndHour(checkOutEndHour);
          setCheckOutEndMinute(checkOutEndMinute);
        }
      } catch (error) {
        console.error('Error fetching times:', error);
      }
    };

    fetchTimes();
  }, []);

  const handleUpdateTimes = async () => {
    const checkInStart = `${checkInStartHour}:${checkInStartMinute}`;
    const checkInEnd = `${checkInEndHour}:${checkInEndMinute}`;
    const checkOutStart = `${checkOutStartHour}:${checkOutStartMinute}`;
    const checkOutEnd = `${checkOutEndHour}:${checkOutEndMinute}`;

    if (!checkInStartHour || !checkInStartMinute || !checkInEndHour || !checkInEndMinute || !checkOutStartHour || !checkOutStartMinute || !checkOutEndHour || !checkOutEndMinute) {
      Alert.alert('Error', 'All time fields are required');
      return;
    }

    // Validate times
    if (checkInEnd <= checkInStart) {
      Alert.alert('Invalid Time', 'Check-in end time must be more than check-in start time.');
      return;
    }
    if (checkOutEnd <= checkOutStart) {
      Alert.alert('Invalid Time', 'Check-out end time must be more than check-out start time.');
      return;
    }

    if (checkOutStart < checkInEnd) {
      Alert.alert('Invalid Time', 'Check Out Must More Than Check In time.');
      return;
    }

    if (checkOutStart == checkInEnd) {
      Alert.alert('Invalid Time', 'checkOutStart and checkInEnd cannot be the same.');
      return;
    }

    try {
      const response = await axios.post(`http://${serverIP}:8000/update_times/`, {
        check_in_start: checkInStart,
        check_in_end: checkInEnd,
        check_out_start: checkOutStart,
        check_out_end: checkOutEnd,
      });
      if (response.data.success) {
        Alert.alert('Success', 'Check-in and check-out times updated successfully');
        navigateToDashboard();
      } else {
        Alert.alert('Error', response.data.error || 'Failed to update times');
      }
    } catch (error) {
      console.error('Error updating times:', error);
      Alert.alert('Error', 'Failed to update times');
    }
  };

  const renderPickerItems = (start, end) => {
    const items = [];
    for (let i = start; i <= end; i++) {
      items.push(<Picker.Item key={i} label={i.toString().padStart(2, '0')} value={i.toString().padStart(2, '0')} />);
    }
    return items;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Change Check-In and Check-Out Times</Text>
      
      <Text style={styles.label}>Check-In Start Time</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={checkInStartHour}
          style={styles.picker}
          onValueChange={(itemValue) => setCheckInStartHour(itemValue)}
        >
          {renderPickerItems(0, 23)}
        </Picker>
        <Picker
          selectedValue={checkInStartMinute}
          style={styles.picker}
          onValueChange={(itemValue) => setCheckInStartMinute(itemValue)}
        >
          {renderPickerItems(0, 59)}
        </Picker>
      </View>

      <Text style={styles.label}>Check-In End Time</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={checkInEndHour}
          style={styles.picker}
          onValueChange={(itemValue) => setCheckInEndHour(itemValue)}
        >
          {renderPickerItems(0, 23)}
        </Picker>
        <Picker
          selectedValue={checkInEndMinute}
          style={styles.picker}
          onValueChange={(itemValue) => setCheckInEndMinute(itemValue)}
        >
          {renderPickerItems(0, 59)}
        </Picker>
      </View>

      <Text style={styles.label}>Check-Out Start Time</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={checkOutStartHour}
          style={styles.picker}
          onValueChange={(itemValue) => setCheckOutStartHour(itemValue)}
        >
          {renderPickerItems(0, 23)}
        </Picker>
        <Picker
          selectedValue={checkOutStartMinute}
          style={styles.picker}
          onValueChange={(itemValue) => setCheckOutStartMinute(itemValue)}
        >
          {renderPickerItems(0, 59)}
        </Picker>
      </View>

      <Text style={styles.label}>Check-Out End Time</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={checkOutEndHour}
          style={styles.picker}
          onValueChange={(itemValue) => setCheckOutEndHour(itemValue)}
        >
          {renderPickerItems(0, 23)}
        </Picker>
        <Picker
          selectedValue={checkOutEndMinute}
          style={styles.picker}
          onValueChange={(itemValue) => setCheckOutEndMinute(itemValue)}
        >
          {renderPickerItems(0, 59)}
        </Picker>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.updateButton]} onPress={handleUpdateTimes}>
          <Text style={styles.buttonText}>Update</Text>
        </TouchableOpacity>
      </View>

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
            <MaterialCommunityIcons name="clock-edit" size={30} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToEditProfile}>
            <MaterialCommunityIcons name="account" size={30} color="#7F8C8D" />
          </TouchableOpacity>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f4f7',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  picker: {
    flex: 1,
    height: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#d9534f',
  },
  updateButton: {
    backgroundColor: '#5cb85c',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
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