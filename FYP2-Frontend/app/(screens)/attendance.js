import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';


const AttendanceLog = () => {
    const router = useRouter();
    const serverIP = '192.168.0.132';
    const params = useLocalSearchParams();
    const { id, name, role } = params; 

    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [logData, setLogData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTab, setSelectedTab] = useState('daily');
    const [selectedMonth, setSelectedMonth] = useState(getTodayDate().slice(0, 7));

    const fetchLogs = async (date) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://${serverIP}:8000/log`, {
                params: { date, user_id: id },
            });
            setLogData(response.data.logs || []);
        } catch (error) {
            setLogData([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchMonthlyLogs = async (month) => {
        setLoading(true);
        try {
            const response = await axios.get(`http://${serverIP}:8000/monthly_log`, {
                params: { month, user_id: id },
            });
            setLogData(response.data.logs || []);
        } catch (error) {
            setLogData([]);
        } finally {
            setLoading(false);
        }
    };

    const navigateToDashboard = () => {
        const pathname = (role === 'admin' || role === 'superadmin') ? '/(screens)/dashboard' : '/(screens)/user_dashboard';
        router.replace({
          pathname,
          params: { id, name, role },
        });
      };
  
  const navigateToAttendance = () => {
        const pathname = (role === 'admin' || role === 'superadmin') ? '/(screens)/attendance_admin' : '/(screens)/attendance';
        router.replace({
          pathname,
          params: { id, name, role },
        });
      };
  
      const navigateToEditProfile = () => {
        router.replace({
          pathname: '/(screens)/user_editprofile',
          params: { id, name, role },
        });
      };

    useEffect(() => {
        if (selectedTab === 'daily') {
            fetchLogs(selectedDate);
        } else {
            fetchMonthlyLogs(selectedMonth);
        }
    }, [selectedTab, selectedDate, selectedMonth]);

    const getLast12Months = () => {
        const months = [];
        const today = new Date();
        for (let i = 0; i < 12; i++) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const label = date.toLocaleString('default', { month: 'long' });
            months.push({ label: `${label} ${year}`, value: `${year}-${month}` });
        }
        return months.reverse(); // Reverse to display in chronological order
    };

    const renderLog = ({ item }) => (
        <View style={styles.logRow}>
            <Text style={styles.logText}>Check-in: {item.check_in_time}</Text>
            <Text style={styles.logText}>Check-out: {item.check_out_time}</Text>
            <Text style={styles.logText}>Total Hours: {item.total_hours}</Text>
        </View>
    );

    const renderMonthlyLog = ({ item }) => (
        <View style={styles.logRow}>
            <Text style={styles.logText}>Date: {item.date}</Text>
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
                <View style={styles.dailyContainer}>
                    <Text style={styles.selectedDateText}>Selected Date: {selectedDate}</Text>
                    <Calendar
                        onDayPress={(day) => setSelectedDate(day.dateString)}
                        markedDates={{
                            [selectedDate]: { selected: true, marked: true, selectedColor: 'blue' },
                        }}
                        style={styles.calendar}
                    />
                    {loading ? (
                        <ActivityIndicator size="large" color="blue" style={styles.loader} />
                    ) : (
                        <FlatList
                            data={logData}
                            renderItem={renderLog}
                            keyExtractor={(item, index) => index.toString()}
                            ListEmptyComponent={<Text style={styles.noData}>No Attendance Record</Text>}
                        />
                    )}
                </View>
            )}

            {selectedTab === 'monthly' && (
                <View style={styles.monthlyContainer}>
                    <Picker
                        selectedValue={selectedMonth}
                        style={styles.picker}
                        onValueChange={(itemValue) => setSelectedMonth(itemValue)}
                    >
                        {getLast12Months().map((month) => (
                            <Picker.Item label={month.label} value={month.value} key={month.value} />
                        ))}
                    </Picker>
                    {loading ? (
                        <ActivityIndicator size="large" color="blue" style={styles.loader} />
                    ) : (
                        <FlatList
                            data={logData}
                            renderItem={renderMonthlyLog}
                            keyExtractor={(item, index) => index.toString()}
                            ListEmptyComponent={<Text style={styles.noData}>No Attendance Record in this month.</Text>}
                        />
                    )}
                </View>
            )}
        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
          onPress={() => router.replace({
                        pathname: '/(screens)/user_dashboard',
                        params: { id, name, role },
                    })}>
            <MaterialCommunityIcons name="home" size={30} color="#7F8C8D" />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToAttendance}>
            <MaterialCommunityIcons name="calendar" size={30} color="#007AFF" />
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
    tabContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 20, borderBottomWidth: 2, borderBottomColor: '#ddd' },
    tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
    activeTab: { backgroundColor: '#2196F3' },
    tabText: { fontSize: 18, color: '#555', fontWeight: '600' },
    activeTabText: { color: '#fff' },
    dailyContainer: { flex: 1 },
    monthlyContainer: { flex: 1 },
    selectedDateText: { fontSize: 16, color: '#333', marginBottom: 10 },
    calendar: { marginBottom: 20 },
    logRow: { flexDirection: 'column', padding: 15, marginBottom: 10, backgroundColor: '#fff', borderRadius: 8, shadowColor: '#ccc', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 },
    logText: { fontSize: 16, color: '#333' },
    noData: { textAlign: 'center', marginTop: 20, color: 'gray' },
    loader: { marginTop: 20 },
    picker: { marginBottom: 20, height: 50 },
    bottomNav: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
      },
});

export default AttendanceLog;
