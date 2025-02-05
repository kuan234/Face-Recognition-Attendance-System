import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router'; // Import useRouter

export default function Index() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [userData, setUserData] = useState(null); // Store user data here
    const serverIP = '192.168.0.132';

    // Initialize useRouter hook
    const router = useRouter();

    const signIn = async () => {
        setLoading(true);
        if (!email || !password) {
            handleFailedLogin('Please enter your email and password.');
            setLoading(false);
            return;
        }
        try {
            const response = await axios.post(`http://${serverIP}:8000/login/`, {
                email: email,
                password: password,
            });

            // Check response status and handle accordingly
            if (response.status === 200) {
                // Login successful, navigate to appropriate dashboard
                setModalVisible(false); // Close the modal on successful login
                const { employee } = response.data;
                const { id, name, role } = employee;
                setUserData({ id, name }); // Store user data in the state or pass it to context

                // Navigate based on user role
                if (role === 'employee') {
                    router.replace({
                        pathname: '/(screens)/user_dashboard',
                        params: { id, name, role },
                    });
                    console.log(id,name,role);
                } else {
                    router.replace({
                        pathname: '/(screens)/dashboard',
                        params: { id, name, role },
                    });
                    console.log(id,name,role);

                }
            }
        } catch (error) {
            if (error.response) {
                // Handle different types of backend errors
                if (error.response.status === 404) {
                    handleFailedLogin('User not found. Please check your email.');
                } else {
                    handleFailedLogin('Invalid Email or Password. Please try again.');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const handleFailedLogin = (message) => {
        setErrorMessage(message);
        setModalVisible(true);
    };

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const navigateToForgotPassword = () => {
        router.push('/(screens)/forgotpassword');
    };

    return (
        <View style={styles.container}>
            {/* Updated image path */}
            <Image source={require('@/assets/images/sq.png')} style={styles.logo} />
            <Text style={styles.header}>Login To Continue</Text>
            
            <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                keyboardType="email-address"
            />

            <View style={styles.passwordContainer}>
                <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!passwordVisible}
                    placeholder="Password"
                />
                <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                    <MaterialCommunityIcons 
                        name={passwordVisible ? 'eye' : 'eye-off'} 
                        size={24} 
                        color="gray" 
                    />
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="small" color="#0000ff" />
            ) : (
                <TouchableOpacity style={styles.button} onPress={signIn}>
                    <Text style={styles.buttonText}>Sign In</Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.forgotPasswordButton} onPress={navigateToForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Modal for failed login */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>{errorMessage}</Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => setModalVisible(false)}
                        >
                            <Text style={styles.modalButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 20,
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 30,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        paddingLeft: 10,
        marginBottom: 20,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        position: 'relative',
    },
    passwordInput: {
        flex: 1,
    },
    eyeIcon: {
        position: 'absolute',
        right: 10,
        top: '35%', // Adjusted to center the icon vertically
        transform: [{ translateY: -12 }],
    },
    button: {
        backgroundColor: '#007bff',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotPasswordButton: {
        alignItems: 'center',
        marginTop: 10,
    },
    forgotPasswordText: {
        color: '#007bff',
        fontSize: 16,
        textDecorationLine: 'underline',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 8,
        width: '80%',
        alignItems: 'center',
    },
    modalText: {
        fontSize: 18,
        color: '#ff0000',
        marginBottom: 20,
    },
    modalButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    modalButtonText: {
        color: '#fff',
        fontSize: 16,
    },
});
