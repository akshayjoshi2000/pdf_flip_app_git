import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import imageCompression from 'browser-image-compression';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import { v4 as uuidv4 } from "uuid";


const HomeScreen = ({ onConversionStart, onImagesSelected, navigation }) => {
  const [pdfUri, setPdfUri] = useState(null);
  const [imageUploads, setImageUploads] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Loading state


  const handleChooseFile = async () => {
    if (!pdfUri) {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/pdf',
        });

        if (result.type === 'success') {
          setPdfUri(result.uri);
          onConversionStart(); // Trigger the conversion start callback
        }
      } catch (err) {
        console.log('Error picking PDF:', err);
      }
    }
  };

  const ActivityIndicatorWrapper = ({ isLoading }) => (
    isLoading ? <ActivityIndicator size="large" color="#007bff" /> : null
  );

  const handleImageUpload = async (e) => {
    try {
      setIsLoading(true); // Start loading animation
      const files = Array.from(e.target.files);

      // Limit the number of images to a maximum of 20
      if (files.length > 20) {
        alert('Please select a maximum of 20 images.');
        setIsLoading(false); // Stop loading animation
        return;
      }

      // Compress and save the selected images in the state
      const compressedImages = await Promise.all(
        files.map(async (file) => {
          const compressedImage = await imageCompression(file, {
            maxSizeMB: 0.3, // Set the maximum size of the compressed image (0.3MB in this example)
            maxWidthOrHeight: 1080, // Set the maximum width or height of the compressed image (1080px in this example)
          });
          return compressedImage;
        })
      );
      setImageUploads(compressedImages);

      // Trigger the images selected callback with the compressed images
      onImagesSelected(compressedImages);
      setIsLoading(false); // Stop loading animation
    } catch (err) {
      console.log('Error picking images:', err);
      setIsLoading(false); // Stop loading animation
    }
  };

  const uploadFiles = () => {
    const timestamp = Date.now();
    const randomIdentifier = Math.random().toString(36).substring(2, 10);
    const folderName = `${timestamp}_${randomIdentifier}`;

    const uploadPromises = imageUploads.map((file) => {
      const imageRef = ref(
        storage,
        `${folderName}/${uuidv4()}`
      );
      return uploadBytes(imageRef, file).then((snapshot) => {
        return getDownloadURL(snapshot.ref);
      });
    });
    
    // Now you can handle the uploadPromises as needed (e.g., store the download URLs or trigger a callback)
    // For example, you can use Promise.all to wait for all uploads to complete:
    Promise.all(uploadPromises)
    .then((downloadUrls) => {
      // downloadUrls will contain an array of download URLs for the uploaded images
      console.log("Uploaded URLs:", downloadUrls);

      // Now you can navigate to the DetailsScreen and pass the bucket URLs as params
      navigation.navigate('Details', { bucketUrls: downloadUrls });
    })
    .catch((error) => {
      console.error("Error uploading images:", error);
    });

      
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>PDF to Flipbook Converter</Text>
      <View style={styles.buttonContainer}>
        <label htmlFor="image-upload" 
           style={styles.button}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
        >
          <Text style={styles.buttonText}>Choose Images</Text>
        </label>
        <input
          id="image-upload"
          type="file"
          multiple
          accept=".jpg, .jpeg, .png"
          onChange={handleImageUpload}
          style={{ display: 'none' }} // Hide the input element
        />
      </View>
      <ActivityIndicatorWrapper isLoading={isLoading} />
      <View style={styles.buttonContainer}>
      <View styles={styles.button}>        
          <TouchableOpacity onPress={uploadFiles} style={styles.button}>
            <Text style={styles.buttonText}>Upload Image To Firebase</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    marginTop: 5,
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#007bff',
  },
});

export default HomeScreen;
