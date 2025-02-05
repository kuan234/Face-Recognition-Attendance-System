import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { Button, ScrollView, StyleSheet, Text, TouchableOpacity, View, Image, Modal, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import { MaterialCommunityIcons } from '@expo/vector-icons'; // Import icons

export default function App() {
  const [facing, setFacing] = useState<CameraType>('front');
  const [faces, setFaces] = useState([]); // Store detected faces
  const [permission, requestPermission] = useCameraPermissions();
  const [verificationResults, setVerificationResults] = useState([]); // Initialize as an empty array
  const [detectedImage, setDetectedImage] = useState(null); // Store detected faces image path
  const [attendanceInfo, setAttendanceInfo] = useState(null); // Store attendance info
  const [modalVisible, setModalVisible] = useState(false); // State for success modal visibility
  const [errorModalVisible, setErrorModalVisible] = useState(false); // State for error modal visibility
  const [spoofModalVisible, setSpoofModalVisible] = useState(false); // State for spoof modal visibility
  const [trueResultReceived, setTrueResultReceived] = useState(false); // Flag to track if a TRUE result has been received
  const serverIP = '192.168.0.132';
  // const serverIP = '10.193.27.209';


  const cameraRef = useRef(null);
  const params = useLocalSearchParams();
  const { id, name, role } = params; // Extract the `id` and `name` parameters
  const router = useRouter(); // Initialize the router

  const navigatetoDashboard = () => {
    if (role === 'employee') {
      router.replace({
        pathname: '/(screens)/user_dashboard',
        params: { id, name, role },
      });
    } else {
      router.replace({
        pathname: '/(screens)/dashboard',
        params: { id, name, role },
      });
    }
  };

  const [isCapturing, setIsCapturing] = useState(false); // Flag to start/stop capturing frames
  const [isProcessing, setIsProcessing] = useState(false); // Flag to indicate if an image is being processed
  const [imageQueue, setImageQueue] = useState<FormData[]>([]); // Queue to store captured images

  useEffect(() => {
    // Setup interval to send frames every second
    let interval;
    
    if (isCapturing && !trueResultReceived) {
      interval = setInterval(() => {
        if (!isProcessing && !trueResultReceived) {
          captureImage();
        }
      }, 700); // Capture a frame every second
    }
    return () => clearInterval(interval); // Cleanup the interval when component unmounts or when isCapturing changes
  }, [isCapturing, isProcessing, trueResultReceived]);

  useEffect(() => {
    // Process the next image in the queue if not already processing
    if (!isProcessing && imageQueue.length > 0 && !trueResultReceived) {
      processImage(imageQueue.shift());
    }
  }, [imageQueue, isProcessing, trueResultReceived]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  // Capture image
  const captureImage = async () => {
    if (cameraRef.current && !trueResultReceived) {

      const photo = await cameraRef.current.takePictureAsync({quality:0.5});
      const { uri, width, height } = photo;
  
      const formData = new FormData();
      formData.append('image', {
        uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });
      formData.append('width', width.toString());
      formData.append('height', height.toString());
      formData.append('user_id', id);  // Correctly append employee_id
      console.log(photo.uri);

      // Add the captured image to the queue
      setImageQueue(prevQueue => [...prevQueue, formData]);
    }
  };

  // Process image
  const processImage = async (formData) => {
    // if (isProcessing) return;  // Prevent multiple submissions

    setIsProcessing(true);
    try {
      const response = await axios.post(`http://${serverIP}:8000/verify_face/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const { verification_results, detected_image_path, message, check_in_time, check_out_time, } = response.data;
      const newDetectedImage = `http://${serverIP}:8000/${detected_image_path}?t=${new Date().getTime()}`;

      // Update state with verification results and detected image
      setVerificationResults(verification_results || []); // Ensure it's an array
      setDetectedImage(newDetectedImage);
      setAttendanceInfo({ message, check_in_time, check_out_time });
      console.log(newDetectedImage);
      
      // Check if any verification result is TRUE or if attendance is already logged
      if ((verification_results && Array.isArray(verification_results) && verification_results.some(result => result.verified)) || message === 'Check-in successful' || message === 'Check-out successful') {
        setIsCapturing(false); // Stop capturing frames
        setModalVisible(true); // Show success modal
        setTrueResultReceived(true); // Set the flag to indicate a TRUE result has been received
      } else if (message === 'Attendance already logged for today') {
        setIsCapturing(false); // Stop capturing frames
        setModalVisible(true); // Show success modal
      } else if (message.includes('Check-in is only allowed') || message.includes('Check-out is only allowed')) {
        setIsCapturing(false); // Stop capturing frames
        setErrorModalVisible(true); // Show error modal
      }else if (message.includes('Spoof Image Detected')) {
        setIsCapturing(false); // Stop capturing frames
        setSpoofModalVisible(true); // Show spoof modal
      }
    } catch (error) {
      setIsCapturing(false); // Stop capturing frames
    } finally {
      setIsProcessing(false); // Reset processing flag
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef} animateShutter={false}
                  onCameraReady={() => setIsCapturing(true)} // Set the camera to ready when initialized
      >
      </CameraView>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="check-circle" size={50} color="green" />
            <Text style={styles.modalText}>{attendanceInfo?.message}</Text>
            <Text style={styles.modalText}>Check-In Time: {attendanceInfo?.check_in_time || 'N/A'}</Text>
            <Text style={styles.modalText}>Check-Out Time: {attendanceInfo?.check_out_time || 'N/A'}</Text>
            <Button
              title="Close"
              onPress={() => {
                setModalVisible(false); // First action
                navigatetoDashboard();       // Second action
              }}
            />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={false}
        visible={errorModalVisible}
        onRequestClose={() => {
          setErrorModalVisible(!errorModalVisible);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <MaterialCommunityIcons name="alert-circle" size={50} color="red" />
            <Text style={styles.modalText}>Error: {attendanceInfo?.message}</Text>
            <Button
              title="Close"
              onPress={() => {
                setErrorModalVisible(false); // First action
                navigatetoDashboard();       // Second action
              }}
            />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={spoofModalVisible}
        onRequestClose={() => {
          setSpoofModalVisible(!spoofModalVisible);
        }}
      >
        <View style={styles.spoofModalContainer}>
          <View style={styles.spoofModalContent}>
            <MaterialCommunityIcons name="alert-circle" size={50} color="red" />
            <Text style={styles.spoofModalText}>Spoof Image Detected</Text>
            <Button
              title="Close"
              onPress={() => {
                setSpoofModalVisible(false);
                navigatetoDashboard(); 
              }}
            />
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
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  camera: {
    flex: 1,
    width: 350, // Set a fixed width
    borderRadius: 150, // Make it circular (width/2)
    overflow: 'hidden', // Ensure content stays within the circle
    alignSelf: 'center', // Center the camera on the screen
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  resultsContainer: {
    alignItems: 'center',
    padding: 16,
  },
  detectedImage: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
    marginBottom: 16,
  },
  resultHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultItem: {
    marginBottom: 16,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '90%',
  },
  attendanceInfoContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  successIcon: {
    marginBottom: 10,
  },
  attendanceMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    marginBottom: 10,
  },
  attendanceDetails: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  attendanceText: {
    fontSize: 16,
    marginBottom: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  spoofModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  spoofModalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  spoofModalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: 'red',
  },
});