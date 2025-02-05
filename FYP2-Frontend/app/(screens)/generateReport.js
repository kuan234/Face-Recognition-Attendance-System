import React, { useState, useEffect } from 'react';
import {
  Button,
  Dimensions,
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Feather';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const { width: screenWidth } = Dimensions.get('window');

const MonthlyAttendance = () => {
  const serverIP = '192.168.0.132';
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [logData, setLogData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const params = useLocalSearchParams();
  const { name, id, role } = params;

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCurrentMonthYear = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
  const [selectedTab, setSelectedTab] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://${serverIP}:8000/admin_monthly_log`, {
        params: { month: selectedMonth },
      });
      const users = [...new Map(response.data.logs.map((item) => [item.user_id, item])).values()];
      setUserData(users || []);
    } catch (error) {
      setUserData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://${serverIP}:8000/admin_log`, {
        params: { date: selectedDate },
      });
      setLogData(response.data.logs || []);
    } catch (error) {
      setLogData([]);
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = async () => {
    let dataToExport;
    let filename;
  
    // Format data for daily or monthly report
    if (selectedTab === 'daily') {
      dataToExport = logData.map((item) => ({
        UserID: item.user_id,
        Username: item.user_name,
        CheckIn: item.check_in_time,
        CheckOut: item.check_out_time,
        TotalHours: item.total_hours,
      }));
      filename = `Daily_Attendance_${selectedDate}.csv`;
    } else {
      dataToExport = userData.map((item) => ({
        UserID: item.user_id,
        Username: item.user_name,
        Date: item.date,
        CheckIn: item.check_in_time,
        CheckOut: item.check_out_time,
        TotalHours: item.total_hours,
      }));
      filename = `Monthly_Attendance_${selectedMonth}.csv`;
    }
  
    // Manually create the CSV string
    const header = Object.keys(dataToExport[0]).join(','); // Get the header from the keys of the first item
    const rows = dataToExport.map((row) => Object.values(row).join(',')); // Convert each row to a CSV line
    const csvString = [header, ...rows].join('\n'); // Combine header and rows with newlines
  
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
  
    try {
      // Write the CSV string to a file
      await FileSystem.writeAsStringAsync(fileUri, csvString, { encoding: FileSystem.EncodingType.UTF8 });
      alert(`Report saved as ${filename}`);
      
      // Share the file using expo-sharing
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri);
      } else {
        alert('Sharing is not available on this device.');
      }
    } catch (error) {
      console.error('Error writing CSV file:', error);
      alert('Failed to save report.');
    }
  };

  useEffect(() => {
    if (selectedTab === 'monthly') {
      fetchUsers();
    } else {
      fetchLogs();
    }
  }, [selectedTab, selectedMonth, selectedDate]);

  const filteredUserData = userData.filter((user) =>
    user.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderUser = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() =>
        router.replace({
          pathname: '/monthly_record_admin',
          params: { userId: item.user_id, userName: item.user_name, month: selectedMonth },
        })
      }
    >
      <Text style={styles.cardText}>{item.user_name}</Text>
      <Icon name="chevron-right" size={20} color="#2196F3" />
    </TouchableOpacity>
  );

  const renderLog = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.logText}>User ID: {item.user_id}</Text>
      <Text style={styles.logText}>Username: {item.user_name}</Text>
      <Text style={styles.logText}>Check-in: {item.check_in_time}</Text>
      <Text style={styles.logText}>Check-out: {item.check_out_time}</Text>
      <Text style={styles.logText}>Total Hours: {item.total_hours}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'daily' && styles.activeTab]}
          onPress={() => setSelectedTab('daily')}
        >
          <Text style={[styles.tabText, selectedTab === 'daily' && styles.activeTabText]}>Daily</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'monthly' && styles.activeTab]}
          onPress={() => setSelectedTab('monthly')}
        >
          <Text style={[styles.tabText, selectedTab === 'monthly' && styles.activeTabText]}>Monthly</Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'daily' && (
        <FlatList
          data={logData}
          renderItem={renderLog}
          keyExtractor={(item, index) => index.toString()}
          ListHeaderComponent={() => (
            <>
              <Text style={styles.selectedMonthText}>Selected Date: {selectedDate}</Text>
              <Button title="Generate Daily Report" onPress={generateCSV} color="#007AFF" />
              <Calendar
                onDayPress={(day) => setSelectedDate(day.dateString)}
                markedDates={{
                  [selectedDate]: { selected: true, marked: true, selectedColor: 'blue' },
                }}
              />
            </>
          )}
        />
      )}

      {selectedTab === 'monthly' && (
        <View>
          <Text style={styles.selectedMonthText}>Month: {selectedMonth}</Text>
          <Button title="Generate Monthly Report" onPress={generateCSV} color="#007AFF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by username"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <FlatList
            data={filteredUserData}
            renderItem={renderUser}
            keyExtractor={(item) => item.user_id.toString()}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Define all required styles here
});
export default MonthlyAttendance;
