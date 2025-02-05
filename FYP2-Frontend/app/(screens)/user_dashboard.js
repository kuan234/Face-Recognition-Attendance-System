import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import axios from 'axios';
import { navigate } from 'expo-router/build/global-state/routing';

export default function DashboardScreen() {
    const params = useLocalSearchParams();
    const { name, id, roles } = params; // Get `name` and `id` from route params
    console.log('Dashboard Params:', params); // Debug: Log received params
    
    const [isCheckedIn, setIsCheckedIn] = useState(false);
    const [isCheckedOut, setIsCheckedOut] = useState(false);
    const [checkInTime, setCheckInTime] = useState('N/A');
    const [checkOutTime, setCheckOutTime] = useState('N/A');
    const [totalHours, setTotalHours] = useState('N/A');
    const [allowedCheckInStart, setAllowedCheckInStart] = useState('');
    const [allowedCheckInEnd, setAllowedCheckInEnd] = useState('');
    const [allowedCheckOutStart, setAllowedCheckOutStart] = useState('');
    const [allowedCheckOutEnd, setAllowedCheckOutEnd] = useState('');
    const [role, setRole] = useState(roles);
    const [refreshing, setRefreshing] = useState(false);
    const serverIP = '192.168.0.132';
    
    
    const getTodayDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const router = useRouter();

    const navigateToCamera = () => {
      if (!isCheckedIn) {
        setIsCheckedIn(true);
      } else if (isCheckedIn && !isCheckedOut) {
        setIsCheckedOut(true);
      }
      router.push({
        pathname: '/(screens)/camera',
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

    const handleLogout = () => {
      Alert.alert('Logout', 'You have been logged out successfully.');
      router.replace('/');
    };

    const fetchUserRole = async () => {
      try {
        const response = await axios.get(`http://${serverIP}:8000/get_user_role/${id}/`);
        if (response.data.role) {
          setRole(response.data.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };

    
      const fetchAllowedCheckInOutTime = async () => {
        try {
          const response = await axios.get(`http://${serverIP}:8000/get_times`);
          if (response.data.check_in_start) {
            setAllowedCheckInStart(response.data.check_in_start);
          }
          if (response.data.check_in_end) {
            setAllowedCheckInEnd(response.data.check_in_end);
          }
          if (response.data.check_out_start) {
            setAllowedCheckOutStart(response.data.check_out_start);
          }
          if (response.data.check_out_end) {
            setAllowedCheckOutEnd(response.data.check_out_end);
          }
        } catch (error) {
          console.error('Error fetching allowed check-in/out time:', error);
        }
      };

      const fetchCheckInStatus = async () => {
        try {
          const response = await axios.get(`http://${serverIP}:8000/get_check_in_status/${id}/`);
          if (response.data.checked_in !== undefined) {
            setIsCheckedIn(response.data.checked_in);
            setIsCheckedOut(response.data.checked_out);
          }
        } catch (error) {
          console.error('Error fetching check-in status:', error);
        }
      };

      const fetchAttendanceLog = async () => {
        try {
          const currentDate = getTodayDate();
          const response = await axios.get(`http://${serverIP}:8000/log`, {
            params: { date: currentDate, user_id: id },
          });
          if (response.data.logs && response.data.logs.length > 0) {
            const log = response.data.logs[0];
            setCheckInTime(log.check_in_time || 'N/A');
            setCheckOutTime(log.check_out_time || 'N/A');
            setTotalHours(log.total_hours || 'N/A'); 
          } else {
            setCheckInTime('N/A');
            setCheckOutTime('N/A');
            setTotalHours('N/A');
          }
        } catch (error) { 
          setCheckInTime('N/A');
          setCheckOutTime('N/A');
          setTotalHours('N/A');
        }
      };

      const onRefresh = async () => {
        setRefreshing(true);
        await fetchAllowedCheckInOutTime();
        await fetchCheckInStatus();
        await fetchAttendanceLog();
        await fetchUserRole();
        setRefreshing(false);
      };

      useEffect(() => {
      fetchAllowedCheckInOutTime();
      fetchCheckInStatus();
      fetchAttendanceLog();
      fetchUserRole();
    }, [id]);



    const handleCheckInOut = () => {
      navigateToCamera();
    };

    return (
      <View style={styles.container}>
        {/* Header Section */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="account-tie" size={80} color="black" style={styles.profileImage} />
          <Text style={styles.userName}> {name ? name.toUpperCase() : 'Welcome!'} </Text>
          <Text style={styles.userDetails}>
            Allowed Check-In: {allowedCheckInStart} - {allowedCheckInEnd} {'\n'}
            Allowed Check-Out: {allowedCheckOutStart} - {allowedCheckOutEnd}
          </Text>
          <TouchableOpacity
            style={[
              styles.statusButton,
              { backgroundColor: isCheckedIn && !isCheckedOut ? '#FF3B30' : '#4CAF50' },
            ]}
            onPress={handleCheckInOut}
          >
            <Text style={styles.statusButtonText}>
            {isCheckedIn && !isCheckedOut ? 'Check Out' : 'Check In'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <ScrollView contentContainerStyle={styles.statsContainer} refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }>
          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Check In</Text>
              <Text style={styles.cardValue}>{checkInTime}</Text>
              <Text style={styles.cardInfo}>on Time</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Check Out</Text>
              <Text style={styles.cardValue}>{checkOutTime}</Text>
              <Text style={styles.cardInfo}>on Time</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Total Hours</Text>
              <Text style={styles.cardValue}>{totalHours}</Text>
            </View>
          </View>
          {/* Recent Activity */}
          <View style={styles.recentActivity}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityRow}>
              <Text style={styles.activityText}>Check In</Text>
              <Text style={styles.activityTime}>{checkInTime}</Text>
            </View>
            <View style={styles.activityRow}>
              <Text style={styles.activityText}>Check Out</Text>
              <Text style={styles.activityTime}>{checkOutTime}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity 
          onPress={() => router.replace({
                        pathname: '/(screens)/user_dashboard',
                        params: { id, name, role },
                    })}>
            <MaterialCommunityIcons name="home" size={30} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToAttendance}>
            <MaterialCommunityIcons name="calendar" size={30} color="#7F8C8D" />
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    textAlign: 'center', // Center align the text
  },
  statusButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  statusButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  statsContainer: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    flex: 1,
    marginHorizontal: 5,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    color: '#666',
  },
  cardValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardInfo: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  recentActivity: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  activityText: {
    fontSize: 14,
    color: '#666',
  },
  activityTime: {
    fontSize: 14,
    color: '#333',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
});