import React, { useState, useEffect } from 'react';
import { Modal, Switch, View, Text, Button, TextInput, FlatList, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
import { firestore, storage } from '../firebase/config';
import { getFirestore, collection, query, where, getDocs, addDoc, setDoc, doc, updateDoc, getDoc, arrayUnion } from 'firebase/firestore';
import { ref, getDownloadURL, listAll, uploadBytes, deleteObject } from 'firebase/storage';
import imageCompression from 'browser-image-compression';
import { v4 as uuidv4 } from "uuid";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import FetchingExistingAds from './FetchingExistingAds';



function PhoneNumberPage({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [restaurantData, setRestaurantData] = useState([]);
  const [imageUrl, setImageUrl] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [bucketId, setBucketId] = useState('');
  const [documentId, setdocumentId] = useState('');
  const [bucketUrls, setBucketUrls] = useState({});

  const [advertisementData, setAdvertisementData] = useState([]);
  const [showAddAdvertisementPopup, setShowAddAdvertisementPopup] = useState(false);
  const [newAdvertisementData, setNewAdvertisementData] = useState({
    title: '',
    url: '',
    impressions: 1000,
    boostAd: false,
    boostUntil: null,
    targetProperty: 'State', // Default value is 'State'
    state: 'state', // Set a default state value here
    // ... other fields
  });





  const fetchRestaurantData = async () => {
    if (!phoneNumber) {
      setErrorMessage('Please enter a phone number.');
      return;
    }

    // Declare an empty array for imageUrls
    const imageUrls = [];

    try {
      const firestore = getFirestore();
      const restaurantsRef = collection(firestore, 'restaurants');

      const q = query(restaurantsRef, where('phoneNumber', '==', phoneNumber));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const restaurants = querySnapshot.docs.map((doc) => doc.data());
        setRestaurantData(restaurants);
        setErrorMessage('');

        const matchedDoc = querySnapshot.docs[0]; // Get the first matching document
        const documentId = matchedDoc.id;
        setdocumentId(documentId)
        console.log('Document ID:', documentId);

        // Fetch the image URL for each restaurant
        for (const restaurant of restaurants) {
          if (restaurant.BucketUrl) {
            const bucketUrl = restaurant.BucketUrl;
            const urlParts = bucketUrl.split('/');
            const bucketId = urlParts[urlParts.length - 1].split('%2F')[0];
            const folderRef = ref(storage, bucketId);
            const listResult = await listAll(folderRef);
            setBucketId(bucketId);
            for (const itemRef of listResult.items) {
              const imageUrl = await getDownloadURL(itemRef);
              imageUrls.push(imageUrl);
            }
          }
        }

        <FetchingExistingAds documentId={documentId} getDoc={getDoc} />;

        // Now you have an array of image URLs to display
        setImageUrl(imageUrls);
      } else {
        setRestaurantData([]);
        setErrorMessage('No restaurants registered with that phone number.');
      }
    } catch (error) {
      console.error('Error fetching data from Firestore:', error);
      setErrorMessage('An error occurred while fetching data.');
    }
  };

  const ActivityIndicatorWrapper = ({ isLoading }) => (
    isLoading ? <ActivityIndicator size="large" color="#007bff" /> : null
  );

  const handleAddImage = async (bucketId) => {
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
          const timestamp = Date.now();
          const webpImageRef = ref(storage, `${bucketId}/${timestamp}_${uuidv4()}.webp`);
          await uploadBytes(webpImageRef, compressedWebpImage);

          const webpDownloadURL = await getDownloadURL(webpImageRef);
          return webpDownloadURL;
        });

        const downloadUrls = await Promise.all(uploadPromises);
        console.log("Uploaded URLs:", downloadUrls);

        // Display a success message
        alert('Images uploaded successfully.');

        setIsLoading(false); // Stop loading animation
        fetchRestaurantData();
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

  const handleSaveImage = async () => {
    if (!documentId) {
      console.error("No document ID provided.");
      return;
    }

    const firestore = getFirestore();
    const restaurantsRef = collection(firestore, 'restaurants');
    const restaurantDocRef = doc(restaurantsRef, documentId);

    try {
      // Create an array to store the image URLs to be saved in Firestore
      const updatedImageUrls = [];

      // Fetch the list of items in the bucket and get their download URLs
      const folderRef = ref(storage, bucketId);
      const listResult = await listAll(folderRef);

      for (const itemRef of listResult.items) {
        const imageUrl = await getDownloadURL(itemRef);
        updatedImageUrls.push(imageUrl);
      }

      // Update the Firestore document with the ordered image URLs
      await updateDoc(restaurantDocRef, {
        imagesBucketURL: updatedImageUrls,
      });

      alert('Images saved successfully.');
    } catch (error) {
      console.error("Error updating document in Firestore:", error);
    }
  };

  const handleDeleteImage = async (imageUrl, index) => {
    // Display a confirmation dialog before deletion
    const confirmed = window.confirm('Are you sure you want to delete this image?');
    if (confirmed) {
      try {
        // Log the image URL and index for debugging
        console.log("Deleting image:", imageUrl[index]);
        console.log("Image index:", index);

        // Remove the image URL from the imageUrl state
        const updatedImageUrls = [...imageUrl];
        updatedImageUrls.splice(index, 1);
        setImageUrl(updatedImageUrls);

        // Delete the image from Firebase Storage using its URL
        await deleteImageFromStorage(imageUrl[index]);
      } catch (error) {
        console.error("Error deleting image:", error);
      }
    }
  };

  const deleteImageFromStorage = async (imageURL) => {
    const imageRef = ref(storage, imageURL);

    try {
      // Delete the image from Firebase Storage
      await deleteObject(imageRef);
      console.log("Image deleted:", imageURL);
    } catch (error) {
      console.error("Error deleting image from storage:", error);
    }
  };

  //--------Advertising FUnctions-------------------------------------------
  const handleAddAdvertisement = async (bucketId) => {
    try {
      setIsLoading(true); // Start loading animation

      const inputElement = document.createElement('input');
      inputElement.type = 'file';
      inputElement.accept = 'image/*';

      // Trigger a click event on the hidden input element
      inputElement.click();

      inputElement.onchange = async (e) => {
        const files = Array.from(e.target.files);

        // Ensure only one image is selected for an advertisement
        if (files.length !== 1) {
          alert('Please select one image for the advertisement.');
          setIsLoading(false); // Stop loading animation
          return;
        }

        const file = files[0];

        // Apply image compression to the selected image
        const compressedWebpImage = await imageCompression(file, {
          mimeType: 'image/webp',
          maxWidth: 300,
          maxSizeMB: 0.4,
        });

        const timestamp = Date.now();
        const advertisementStorageRef = ref(storage, `${bucketId}/advertisement_storage/${timestamp}_${uuidv4()}.webp`);

        // Upload the compressed image to the specified bucket path
        await uploadBytes(advertisementStorageRef, compressedWebpImage);

        const advertisementDownloadURL = await getDownloadURL(advertisementStorageRef);

        // Update the imageUrl field in newAdvertisementData
        setNewAdvertisementData({ ...newAdvertisementData, imageUrl: advertisementDownloadURL });

        // Display a success message
        alert('Advertisement uploaded successfully.');

        setIsLoading(false); // Stop loading animation
        fetchRestaurantData();
      };
    } catch (error) {
      console.error("Error handling advertisements:", error);
      setIsLoading(false); // Stop loading animation
    }
  };

  const increaseImpressions = () => {
    // Logic to increase impressions
    setNewAdvertisementData({
      ...newAdvertisementData,
      impressions: newAdvertisementData.impressions + 1000,
    });
  };

  const decreaseImpressions = () => {
    // Logic to decrease impressions
    if (newAdvertisementData.impressions > 1000) {
      setNewAdvertisementData({
        ...newAdvertisementData,
        impressions: newAdvertisementData.impressions - 1000,
      });
    }
  };

  const saveAdvertisement = async () => {
    try {
      setIsLoading(true); // Start loading animation

      // Fetch the restaurant document to access its fields
      const restaurantDoc = await getDoc(doc(collection(firestore, 'restaurants'), documentId));
      const restaurantData = restaurantDoc.data();

      // Create a new advertisement document
      const adsDocRef = await addDoc(collection(firestore, 'advertisements'), {
        imageUrl: newAdvertisementData.imageUrl, // Save the image URL
        linkUrl: newAdvertisementData.url, // Save the link URL
        targetProperty: newAdvertisementData.targetProperty, // Save the target property
        impressions_left: newAdvertisementData.impressions, // Save impressions_left
        impressions_count: 0, // Default value for impressions_count
        Ad_click: 0, // Default value for ad_click
        ctr: 0, // Default value for ctr
        restaurant: doc(collection(firestore, 'restaurants'), documentId), // Save restaurant reference
        state: restaurantData.state, // Copy state from restaurant
        district: restaurantData.district,
        locality: restaurantData.locality,
        pincode: restaurantData.pincode, // Copy district from restaurant
        // Include other fields from the restaurant as needed
      });

      // Get the ID of the new advertisement document
      const adsDocId = adsDocRef.id;

      // Reference to the new advertisement document
      const adsReference = doc(collection(firestore, 'advertisements'), adsDocId);

      // Update the restaurant document with the reference to the new advertisement
      const restaurantDocRef = doc(collection(firestore, 'restaurants'), documentId);
      await updateDoc(restaurantDocRef, {
        ads_reference: arrayUnion(adsReference),
      });

      // Display a success message
      alert('Advertisement saved successfully');

      setIsLoading(false); // Stop loading animation
      fetchRestaurantData();
      setShowAddAdvertisementPopup(false); // Close the popup
    } catch (error) {
      console.error('Error saving advertisement:', error);
      setIsLoading(false); // Stop loading animation
    }
  };

//-----------------experimenting-----------------


  return (
    <View>
      <Text>Enter Phone Number:</Text>
      <TextInput
        placeholder="Phone Number"
        value={phoneNumber}
        onChangeText={(text) => setPhoneNumber(text)}
      />
      <Button title="Fetch Details" onPress={fetchRestaurantData} />

      {restaurantData.length > 0 && (
        <ScrollView>
          {restaurantData.map((item, index) => (
            <View key={item.id}>
              <Text>Restaurant Details:</Text>
              <Text>Phone: {item.phoneNumber}</Text>
              <Text>Email: {item.email}</Text>
              <Text>Name: {item.name}</Text>
              <Text>State: {item.state}</Text>
              <Text>District: {item.district}</Text>
              <Text>Pincode: {item.pincode}</Text>
              <Text>Address: {item.address}</Text>
              <ActivityIndicatorWrapper isLoading={isLoading} />
              <ScrollView horizontal style={styles.imagesContainer}>
                {imageUrl.map((image, index) => (
                  <View key={index} style={styles.imageContainer}>
                    <Image
                      source={{ uri: image }}
                      style={{ width: 200, height: 200 }}
                    />
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteImage(imageUrl, index)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                <TouchableOpacity style={styles.addButtonContainer} onPress={() => handleAddImage(bucketId)}>
                  <View style={styles.addImageContainer}>
                    <Text style={styles.addImageText}>+</Text>
                  </View>
                  <TouchableOpacity style={styles.addButton} onPress={() => handleAddImage(bucketId)}>
                    <Text style={styles.addImageButtonText}>Add Image</Text>
                  </TouchableOpacity>
                </TouchableOpacity>

              </ScrollView>
              <Text style={{ alignItems: 'center', }}>Click Save to Update images after Adding or Deleting</Text>
              <Button
                title="Save"
                onPress={() => handleSaveImage(documentId)}
              />

              {/* Advertisement Section */}
              <FetchingExistingAds restaurantData={restaurantData} getDoc={getDoc} />


              {/* Add Advertisement Button */}
              <TouchableOpacity
                style={styles.addADButton}
                onPress={() => setShowAddAdvertisementPopup(true)}
              >
                <Text style={styles.addADButtonText}>Add Advertisement</Text>
              </TouchableOpacity>
            </View>

          ))}
        </ScrollView>
      )}

      <Text style={{ color: 'red' }}>{errorMessage}</Text>
      <Modal
        visible={showAddAdvertisementPopup}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalBackground}>
          <View style={styles.addAdvertisementPopup}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAddAdvertisementPopup(false)}
            >
              <Text style={styles.closeButtonText}>X</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="Title"
              value={newAdvertisementData.title}
              onChangeText={(text) => setNewAdvertisementData({ ...newAdvertisementData, title: text })}
            />

            {/* + icon to add banner advertisement image */}
            <TouchableOpacity
              style={styles.uploadAdButton}
              onPress={() => handleAddAdvertisement(bucketId)}
            >
              <Text style={styles.uploadAdButtonText}>Upload Ad Image</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.textInput}
              placeholder="URL"
              value={newAdvertisementData.url}
              onChangeText={(text) => setNewAdvertisementData({ ...newAdvertisementData, url: text })}
            />
            <View>
              <Text>Impressions</Text>
              <View style={styles.impressionsContainer}>

                <TouchableOpacity
                  style={styles.impressionsButton}
                  onPress={() => decreaseImpressions()}
                >
                  <Text style={styles.buttonText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.impressionsText}>{newAdvertisementData.impressions}</Text>
                <TouchableOpacity
                  style={styles.impressionsButton}
                  onPress={() => increaseImpressions()}
                >
                  <Text style={styles.buttonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/*Boost Ad Reach*/}
            <View style={styles.boostAdToggle}>
              <Text>Boost Ad:</Text>
              <Switch
                value={newAdvertisementData.boostAd}
                onValueChange={(value) => setNewAdvertisementData({ ...newAdvertisementData, boostAd: value })}
              />
            </View>
            {newAdvertisementData.boostAd && (
              <DatePicker
                selected={newAdvertisementData.boostUntil}
                onChange={(date) => setNewAdvertisementData({ ...newAdvertisementData, boostUntil: date })}

              />
            )}
            <TouchableOpacity
              style={styles.addAdvertisementButton}
              onPress={() => handleAddAdvertisement()}
            >
              <Text style={styles.addImageButtonText}>Save Advertisement</Text>
            </TouchableOpacity>


            {/* Radio button group for Target Audience */}
            <View style={styles.targetAudienceContainer}>
              <Text>Target Audience:</Text>
              <View style={styles.radioRow}>
                <RadioForm formHorizontal={true} animation={true}>
                  {[
                    { label: 'State', value: 'State' },
                    { label: 'City', value: 'City' },
                  ].map((obj, i) => (
                    <RadioButton labelHorizontal={true} key={i}>
                      <RadioButtonInput
                        obj={obj}
                        index={i}
                        isSelected={newAdvertisementData.targetProperty === obj.value}
                        onPress={() => setNewAdvertisementData({ ...newAdvertisementData, targetProperty: obj.value })}
                      />
                      <RadioButtonLabel
                        obj={obj}
                        index={i}
                        labelHorizontal={true}
                        onPress={() => setNewAdvertisementData({ ...newAdvertisementData, targetProperty: obj.value })}
                      />
                    </RadioButton>
                  ))}
                </RadioForm>
              </View>
              <View style={styles.radioRow}>
                <RadioForm formHorizontal={true} animation={true}>
                  {[
                    { label: 'Locality', value: 'Locality' },
                    { label: 'Pincode', value: 'Pincode' },
                  ].map((obj, i) => (
                    <RadioButton labelHorizontal={true} key={i}>
                      <RadioButtonInput
                        obj={obj}
                        index={i}
                        isSelected={newAdvertisementData.targetProperty === obj.value}
                        onPress={() => setNewAdvertisementData({ ...newAdvertisementData, targetProperty: obj.value })}
                      />
                      <RadioButtonLabel
                        obj={obj}
                        index={i}
                        labelHorizontal={true}
                        onPress={() => setNewAdvertisementData({ ...newAdvertisementData, targetProperty: obj.value })}
                      />
                    </RadioButton>
                  ))}
                </RadioForm>
              </View>
            </View>

            {/*Saving Button*/}
            <TouchableOpacity
              style={styles.uploadAdButton}
              onPress={() => saveAdvertisement()}
            >
              <Text style={{ color: 'white' }}>Save Advertisement</Text>
            </TouchableOpacity>


          </View>
        </View>
      </Modal>

      
    </View>
  );
}

const styles = {
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  imageContainer: {
    marginHorizontal: 5,
  },
  image: {
    width: 150,
    height: 100,
  },
  addImageContainer: {
    width: 70,
    height: 100,
    backgroundColor: 'lightgray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageText: {
    fontSize: 40,
  },
  deleteButton: {
    backgroundColor: 'red',
    width: 100,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: 'white',
    alignItems: 'center',
  },
  uploadAdButton: {
    backgroundColor: '#007BFF', // Set your desired background color
    borderRadius: 8, // Adjust the border radius as needed
    padding: 10, // Add padding to make the button more clickable
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadAdButtonText: {
    color: 'white', // Set the text color
    fontSize: 16, // Adjust the font size as needed
  },
  addButton: {
    backgroundColor: 'green',
    width: 100,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addImageButtonText: {
    color: 'white',
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  addAdvertisementPopup: {
    backgroundColor: 'white',
    padding: 20,
    width: 300,
    borderRadius: 10,
  },

  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 10,
    backgroundColor: 'transparent',
  },
  closeButtonText: {
    fontSize: 20,
    color: 'red',
  },

  addButtonBanner: {
    backgroundColor: 'green',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  addImageButtonText: {
    fontSize: 20,
    color: 'white',
  },
  closePopupButton: {
    backgroundColor: 'red', // Example background color
    padding: 10,
  },
  impressionsContainer: {
    flexDirection: 'row', // Arrange items horizontally
    alignItems: 'center', // Center items vertically
    justifyContent: 'center', // Center items horizontally
    marginVertical: 10, // Adjust the margin as needed
  },
  impressionsButton: {
    backgroundColor: '#007BFF', // Set your desired background color
    borderRadius: 20, // Make it round to create a button appearance
    padding: 10, // Add padding to make the button more clickable
    alignItems: 'center',
    justifyContent: 'center',
  },
  impressionsText: {
    fontSize: 16, // Adjust the font size as needed
    marginHorizontal: 10, // Add spacing between text and buttons
  },
  buttonText: {
    color: 'white', // Set the text color
    fontSize: 20, // Adjust the font size as needed
  },
  textInput: {
    borderWidth: 1, // Add a border
    borderColor: '#ccc', // Border color
    borderRadius: 5, // Add rounded corners
    padding: 10, // Add padding for spacing
    marginBottom: 10, // Add margin at the bottom
  },
  radioRow: {
    justifyContent: 'center',
  },
  addADButton: {
    width: 150,
    height: 30,
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginTop: 20,
  },
  addADButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
};
export default PhoneNumberPage;
