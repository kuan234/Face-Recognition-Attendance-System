import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef } from 'react';
import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import axios from 'axios';

export default function App() {
  const [facing, setFacing] = useState<CameraType>('front');
  const [faces, setFaces] = useState([]); // Store detected faces
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const serverIP = '192.168.0.105';

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


  //capture image
  const captureImage = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync();
      const { uri, width, height } = photo;
  
      const formData = new FormData();
      formData.append('image', {
        uri,
        name: 'photo.jpg',
        type: 'image/jpeg',
      });
      formData.append('width', width.toString());
      formData.append('height', height.toString());
  
      try {
        const response = await axios.post(`http://${serverIP}:8000/detect_face/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
  
        console.log('Faces received:', response.data.faces);
  
        if (response.data.face_detected) {
          // Correct scaling of bounding boxes based on original dimensions
          const scaledFaces = response.data.faces.map((face) => {
            const { x, y, width, height } = face;
            
            // Scale the bounding box to match the original camera size
            return {
              x: x,
              y: y,
              width: width,
              height: height,
            };
          });
  
          setFaces(scaledFaces); // Update state with scaled faces
        } else {
          alert('No face detected!');
          setFaces([]); // Clear faces if none are detected
        }
      } catch (error) {
        console.error('Error detecting face:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing} ref={cameraRef}>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={captureImage}>
            <Text style={styles.text}>Capture</Text>
          </TouchableOpacity>
        </View>
      </CameraView>
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
});
