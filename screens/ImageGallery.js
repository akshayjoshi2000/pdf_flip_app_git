import React, { useState } from 'react';
import { View, Text, FlatList, Image, Button } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import imageCompression from 'browser-image-compression';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';
import { v4 as uuidv4 } from "uuid";

function ImageGallery({  onSaveImages, route }) {
  const [selectedImages, setSelectedImages] = useState(images);
  const [deleteMode, setDeleteMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const { images, folderName } = route.params;


  const handleAddImage = async () => {
    try {
      setIsLoading(true); // Start loading animation
  
      const inputElement = document.createElement('input');
      inputElement.type = 'file';
      inputElement.accept = 'image/*';
      inputElement.multiple = true;
  
      // Trigger a click event on the hidden input element
      inputElement.click();
  
      inputElement.onchange = async (e) => {
        const files = Array.from(e.target.files);
  
        // Limit the number of images to a maximum of 60
        if (files.length > 60) {
          alert('Please select a maximum of 60 images.');
          setIsLoading(false); // Stop loading animation
          return;
        }
  
        // Simulate an upload delay (you can replace this with actual upload logic)
        await simulateImageUpload(files);
  
        // Handle image compression and upload logic here
        // ...
  
        // Example logic for getting download URLs
        const uploadPromises = files.map(async (file) => {
          const webpImage = await imageCompression(file, {
            mimeType: 'image/webp',
            maxWidthOrHeight: 4000,
          });
  
         // Apply image compression to the converted WebP image
         const compressedWebpImage = await imageCompression(webpImage, {
            maxSizeMB: 0.4, 
            maxWidthOrHeight: 4000,  
          });
  
          const webpImageRef = ref(storage, `${folderName}/${uuidv4()}.webp`);
          await uploadBytes(webpImageRef, compressedWebpImage);
  
          const webpDownloadURL = await getDownloadURL(webpImageRef);
          return webpDownloadURL;
        });
  
        const downloadUrls = await Promise.all(uploadPromises);
        console.log("Uploaded URLs:", downloadUrls);
  
        // Display a success message
        alert('Images uploaded successfully.');
  
        setIsLoading(false); // Stop loading animation
      };
    } catch (error) {
      console.error("Error handling images:", error);
      setIsLoading(false); // Stop loading animation
    }
  };

  const simulateImageUpload = async (files) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate a delay for image upload
        resolve();
      }, 2000); // Simulate a 2-second delay (adjust as needed)
    });
  };
  

  const handleToggleDeleteMode = () => {
    setDeleteMode(!deleteMode);
  };

  const handleDeleteImage = (index) => {
    // Implement the logic to remove an image from selectedImages
    const updatedImages = [...selectedImages];
    updatedImages.splice(index, 1);
    setSelectedImages(updatedImages);
  };

  const handleSaveImages = () => {
    // Implement the logic to save the selectedImages and update Firebase reference URL
    onSaveImages(selectedImages);
  };

  const renderItem = ({ item, index }) => (
    <View>
      <Image source={{ uri: item.uri }} style={{ width: 200, height: 200 }} />
      {deleteMode && (
        <Button title="Delete" onPress={() => handleDeleteImage(index)} />
      )}
    </View>
  );

  return (
    <View>
      <FlatList
        data={selectedImages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
      />
      <Button title="Add Image" onPress={handleAddImage} />
      <Button
        title={deleteMode ? 'Done' : 'Delete Images'}
        onPress={handleToggleDeleteMode}
      />
      <Button title="Save Images" onPress={handleSaveImages} />
    </View>
  );
}

export default ImageGallery;
