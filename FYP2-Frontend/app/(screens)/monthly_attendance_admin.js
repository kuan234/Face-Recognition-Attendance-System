import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';

const MonthlyAttendance = () => {
    const serverIP = '192.168.0.132';
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [logData, setLogData] = useState([]);
    const [monthly, setMonthly] = useState([]);
    const router = useRouter();
    
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
    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthYear());
    const [selectedTab, setSelectedTab] = useState('monthly'); // Track selected tab (daily/monthly)
    
    // Fetch monthly users' attendance
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://${serverIP}:8000/admin_monthly_log`, {
                params: { month: selectedMonth },
            });
            const users = [...new Map(response.data.logs.map(item => [item.user_id, item])).values()];
            setMonthly(response.data.logs || []);
            setUserData(users || []);
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

    // Fetch data on mount and when selected month/date changes
    useEffect(() => {
        if (selectedTab === 'monthly') {
            fetchUsers();
        } else {
            fetchLogs();
        }
    }, [selectedTab, selectedMonth, selectedDate]);

    const renderUser = ({ item }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() =>
                router.push({
                    pathname: '/monthly_record_admin',
                    params: { userId: item.user_id, userName: item.user_name, month: selectedMonth },
                })
            }
        >
            <Text style={styles.cardText}>{item.user_name}</Text>
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
            const startMonth = year === currentYear ? currentMonth : 11; // Start from December for the previous year
    
            for (let month = startMonth; month >= 0; month--) {
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

            {/* Daily Tab Content */}
            {selectedTab === 'daily' && (
                <View>
                    <Text style={styles.selectedMonthText}>Selected Date: {selectedDate}</Text>

                    {/* Daily Calendar */}
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
                            ListEmptyComponent={<Text style={styles.noData}>No Data Available</Text>}
                        />
                    )}
                </View>
            )}

            {/* Monthly Tab Content */}
            {selectedTab === 'monthly' && (
                <View>
                    <Text style={styles.selectedMonthText}>{formatMonth(selectedMonth)}</Text>

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

                    {loading ? (
                        <ActivityIndicator size="large" color="#4CAF50" style={styles.loader} />
                    ) : (
                        <FlatList
                            data={userData}
                            renderItem={renderUser}
                            keyExtractor={(item) => item.user_id.toString()}
                            ListEmptyComponent={<Text style={styles.noData}>No records found for this month.</Text>}
                        />
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: 'white' },
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
    calendar: { marginBottom: 20 },
    loader: { marginTop: 20 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 2,
    },
    logText: { fontSize: 16, marginBottom: 5 },
    noData: { textAlign: 'center', marginTop: 20, color: 'gray' },
});

export default MonthlyAttendance;
