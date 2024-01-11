import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Linking } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebase/config';
import JSZip from 'jszip';
import QRCode from 'qrcode';

const ViewQRScreen = ({ route }) => {
  const { documentId, numTables } = route.params || {};
  const [restaurantData, setRestaurantData] = useState(null);

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

    // Fetch the restaurant data
    fetchRestaurantData();
  }, [documentId]);

  // Function to generate the QR code URL for a specific table
  const generateQRCodeUrlForTable = async (tableNumber) => {
    try {
      const qrCodeUrl = `https://scanformenu.online/view/?id=${documentId}&table=${tableNumber}`;
      const qrCodeImageData = await QRCode.toDataURL(qrCodeUrl, { width: 300, format: 'png', errorCorrectionLevel: 'H',margin: 1, });
      return qrCodeImageData;
    } catch (error) {
      console.error(`Error generating QR code for table ${tableNumber}:`, error);
      return null;
    }
  };

  // Function to download a zip file containing the QR code for table 1
  const downloadQRCodeZip = async () => {
    const zip = new JSZip();

    // Generate QR code images and add to the zip
    for (let tableNumber = 1; tableNumber <= numTables; tableNumber++) {
      const qrCodeImageData = await generateQRCodeUrlForTable(tableNumber);

      if (qrCodeImageData) {
        zip.file(`QRCode_Table_${tableNumber}.png`, qrCodeImageData.split(',')[1], { base64: true });
      }
    }

    // Generate the zip file
    zip.generateAsync({ type: 'blob' }).then((blob) => {
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${restaurantData.restaurantName}_QRCode.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    });
  };

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

      {/* Button to download the QR codes as a zip file */}
      <Button title="Download QR Codes as ZIP" onPress={downloadQRCodeZip} />
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
});

export default ViewQRScreen;
