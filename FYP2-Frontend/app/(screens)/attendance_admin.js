import React, { useState, useEffect } from 'react';
import { Button, Dimensions, View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/Feather';  // Import icon
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const { width: screenWidth } = Dimensions.get('window');

const MonthlyAttendance = () => {
    const serverIP = '192.168.0.132';
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [logData, setLogData] = useState([]);
    const [searchQuery, setSearchQuery] = useState(''); // State to track the search input
    const router = useRouter();
    const params = useLocalSearchParams();
    const { name, id, role } = params; // Get `name` and `id` from route params
    const [monthly, setMonthly] = useState([]);
    

    // Helper to get today's date
    const getTodayDate = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // Helper to get current month and year
    const getCurrentMonthYear = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      return `${year}-${month}`;
    };

    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
    const [selectedTab, setSelectedTab] = useState('daily'); // Default to 'daily'
    const [selectedDate, setSelectedDate] = useState(getTodayDate());
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
          dataToExport = monthly.map((item) => ({
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

    // Fetch monthly users' attendance
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://${serverIP}:8000/admin_monthly_log`, {
                params: { month: selectedMonth },
            });
            const users = [...new Map(response.data.logs.map(item => [item.user_id, item])).values()];
            setUserData(users || []);
            setMonthly(response.data.logs || []);
        } catch (error) {
            setUserData([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch daily attendance logs
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

      // Navigation function to generate report
    const navigateToGenerateReport = () => {
      router.push({
          pathname: '/(screens)/generateReport',
          params: { selectedTab, selectedDate, selectedMonth },
      });
  };




    // Fetch data on mount and when selected month/date changes
    useEffect(() => {
        if (selectedTab === 'monthly') {
            fetchUsers();
        } else {
            fetchLogs();
        }
    }, [selectedTab, selectedMonth, selectedDate]);

    // Filter users based on search query
    const filteredUserData = userData.filter(user =>
        user.user_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderUser = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, styles.userCard]} // Add styles for the user card
            onPress={() =>
                router.replace({
                    pathname: '/monthly_record_admin',
                    params: { userId: item.user_id, userName: item.user_name, month: selectedMonth },
                })
            }
        >
            <Text style={styles.cardText}>
              {item.user_name}
            </Text>
            <Text><Icon name="chevron-right" size={20} color="#2196F3" style={styles.icon} /> </Text>
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

    const generateMonths = () => {
        const months = [];
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth(); // Current month (0-indexed)
    
        // Loop through the last 12 months
        for (let year = currentYear - 1; year <= currentYear; year++) {
            const startMonth = year === currentYear-1 ? 0 : 0; 
    
            for (let month = startMonth; month < 12; month++) {
                if (year === currentYear && month > currentMonth) {
                    break;
                }
                const value = `${year}-${String(month + 1).padStart(2, '0')}`;
                const label = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' });
                months.push({ value, label });
            }
        }
        return months;
    };

    const formatMonth = (monthValue) => {
        const [year, month] = monthValue.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };

    return (
        <View style={styles.container}>
            {/* Tab Container */}
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
                          
                          {/* Daily Calendar */}
                          <Calendar
                              onDayPress={(day) => {
                                  setSelectedDate(day.dateString);  // Update selected date
                              }}
                              markedDates={{
                                  [selectedDate]: { selected: true, marked: true, selectedColor: 'blue' },
                              }}
                              style={styles.calendar}
                              current={selectedDate} // Keeps the calendar on the selected date
                          />
                      </>
                  )}
                  ListEmptyComponent={<Text style={styles.noData}>No Data Available</Text>}
                  ListFooterComponent={loading ? <ActivityIndicator size="large" color="blue" style={styles.loader} /> : null}
                  contentContainerStyle={styles.dailyContent}
              />
            )}

            {/* Monthly Tab Content */}
            {selectedTab === 'monthly' && (
                <View>
                    <Text style={styles.selectedMonthText}>{formatMonth(selectedMonth)}</Text>
                    <Button title="Generate Monthly Report" onPress={generateCSV} color="#007AFF" />
                  
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedMonth}
                            style={styles.picker}
                            onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                        >
                            {generateMonths().map((month) => (
                                <Picker.Item label={month.label} value={month.value} key={month.value} />
                            ))}
                        </Picker>
                    </View>


                    {/* Search Input */}
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by username"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />

                    <View style={styles.tableContainer}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableHeaderText}>Username</Text>
                        </View>

                        {loading ? (
                            <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
                        ) : (
                            <FlatList
                                data={filteredUserData}
                                renderItem={renderUser}
                                keyExtractor={(item) => item.user_id.toString()}
                                ListEmptyComponent={<Text style={styles.noData}>No records found for this month.</Text>}
                            />
                        )}
                    </View>
                 </View>
              )}
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
            <MaterialCommunityIcons name="calendar" size={30} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToUserList}>
            <MaterialCommunityIcons name="account-multiple" size={30} color="#7F8C8D" />
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
  container: { flex: 1, padding: 20, backgroundColor: '#f4f7fc' },
  tabContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginBottom: 20,
      borderBottomWidth: 2,
      borderBottomColor: '#ddd',
  },
  tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
  },
  activeTab: {
      borderBottomWidth: 3,
      borderBottomColor: '#2196F3',
  },
  tabText: {
      fontSize: 18,
      color: '#555',
  },
  activeTabText: {
      color: '#2196F3',
      fontWeight: 'bold',
  },
  selectedMonthText: { fontSize: 18, fontWeight: '600', color: '#555', marginBottom: 10 },
  calendar: { 
    marginBottom: 20,
    borderWidth: 1,        // Add border width
    borderColor: '#ccc',  // Add border color
    borderRadius: 8,      // Optional: add rounded corners
  },
  loader: { marginTop: 20 },
  tableContainer: {
    marginBottom: 20,
    borderWidth: 1, // Border for the whole table container
    borderColor: '#ccc', // Same border color as the card
    borderRadius: 8,
    overflow: 'hidden', // Prevent overflow from the rounded corners
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderBottomWidth: 1, // Border between header and content
    borderBottomColor: '#ccc',
  },
  tableHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  userCard: {
    flexDirection: 'row',  // Align username and icon horizontally
    justifyContent: 'space-between', // Space between username and icon
    borderBottomWidth: 1, // Border between user cards
    borderBottomColor: '#ccc',
    padding: 15,
    marginVertical: 0, // Remove margin between cards, only use border for separation
  },
  cardText: {
    fontSize: 16,
    color: '#2196F3',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  cardText: { fontSize: 16, color: '#2196F3' },
  icon: {
    alignSelf: 'center',  // Align icon vertically centered with the text
    marginLeft: -15,       // Add some spacing between text and icon
  },
  logText: { fontSize: 16, marginBottom: 5 },
  noData: { textAlign: 'center', marginTop: 20, color: 'gray' },
  dailyContent: {
    paddingBottom: 20, // Make sure there's some space for scrolling
  },
  pickerContainer: {
    borderWidth: 1,        // Add border width for the Picker
    borderColor: '#ccc',  // Add border color for the Picker
    borderRadius: 8,      // Optional: add rounded corners
    marginBottom: 20,     // Add some spacing between Picker and content
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
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

export default MonthlyAttendance;
