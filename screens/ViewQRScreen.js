import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Button } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/config';
import QRCode from 'qrcode.react';

const ViewQRScreen = ({ route }) => {
  const { documentId } = route.params || {};
  const qrCodeRef = useRef(null);
  const [imageDataUrl, setImageDataUrl] = useState(null);
  const [restaurantData, setRestaurantData] = useState(null);

  const generateQRCode = () => {
    // Generate the QR code value here if needed
  };

  useEffect(() => {
    const fetchRestaurantData = async () => {
      try {
        const docRef = doc(firestore, 'restaurants', documentId);
        const docSnapshot = await getDoc(docRef);
        
        if (docSnapshot.exists()) {
          const data = docSnapshot.data();
          setRestaurantData(data);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching restaurant data:', error);
      }
    };

    fetchRestaurantData();
  }, [documentId]);

  // Concatenate the node ID with the domain URL
  const qrCodeUrl = `https://scan-for-menu.vercel.app/view/?id=${documentId}`;

  const handleOpenUrl = () => {
    Linking.openURL(qrCodeUrl); // Open the URL when clicked
  };

  const downloadQRCode = () => {
    const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`;
    
    fetch(qrCodeImageUrl)
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'QRcode.jpg';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
      })
      .catch(error => {
        console.error('Error downloading QR code:', error);
      });
  }

  return (
    <View style={styles.container}>
      {restaurantData ? (
        <>
          <Text style={styles.text}>Restaurant Name: {restaurantData.restaurantName}</Text>
          <Text style={styles.text}>Address: {restaurantData.address}</Text>
          <Text style={styles.text}>Phone Number: {restaurantData.phoneNumber}</Text>
          {/* Add more fields as needed */}
        </>
      ) : (
        <Text style={styles.text}>Fetching data for Node ID: {documentId}</Text>
      )}
      
      <TouchableOpacity onPress={handleOpenUrl}>
        <Text style={styles.link}>Click to View Menu</Text>
      </TouchableOpacity>
      <QRCode
        value={qrCodeUrl} // Pass the qrCodeUrl as the value for generating the QR code
        size={200} // Set the size of the QR code
      />
      <Button title="Download QR Code" onPress={downloadQRCode} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
  },
  link: {
    color: 'blue',
    textDecorationLine: 'underline',
    marginBottom: 10,
  },
});

export default ViewQRScreen;
