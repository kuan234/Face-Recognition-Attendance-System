import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';

const UserMonthlyRecord = () => {
    const serverIP = '192.168.0.132';
    const params = useLocalSearchParams();
    const { userId, userName, month } = params;

    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchUserRecords = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://${serverIP}:8000/admin_monthly_log`, {
                params: { month },
            });
            const userRecords = response.data.logs.filter((log) => log.user_id.toString() === userId);
            setRecords(userRecords || []);
        } catch (error) {
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserRecords();
    }, [month]);

    const renderRecord = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.logText}>Date: {item.date}</Text>
            <Text style={styles.logText}>Check-in: {item.check_in_time}</Text>
            <Text style={styles.logText}>Check-out: {item.check_out_time}</Text>
            <Text style={styles.logText}>Total Hours: {item.total_hours}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>{`Attendance for ${userName}`}</Text>
            <Text style={styles.subHeaderText}>{`Month: ${month}`}</Text>

            {loading ? (
                <ActivityIndicator size="large" color="blue" style={styles.loader} />
            ) : (
                <FlatList
                    data={records}
                    renderItem={renderRecord}
                    keyExtractor={(item, index) => index.toString()}
                    ListEmptyComponent={<Text style={styles.noData}>No Records Found</Text>}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: 'white' },
    headerText: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
    subHeaderText: { fontSize: 16, marginBottom: 20 },
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
    logText: { fontSize: 16 },
    noData: { textAlign: 'center', marginTop: 20, color: 'gray' },
    loader: { marginTop: 20 },
});

export default UserMonthlyRecord;
