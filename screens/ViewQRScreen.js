import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { ref, onChildAdded, off } from 'firebase/database';
import { database } from '../firebase/config';
import QRCode from 'react-native-qrcode-svg';

const ViewQRScreen = ({ route }) => {
  const { nodeId } = route.params || {};

  useEffect(() => {
    const nodeRef = ref(database, `restaurants/${nodeId}`);

    const onChildAddedListener = onChildAdded(nodeRef, (snapshot) => {
      const newNodeId = snapshot.key;
    });

    return () => {
      off(nodeRef, onChildAddedListener);
    };
  }, []);

  // Concatenate the node ID with the domain URL
  const qrCodeUrl = `https://scan-for-menu.vercel.app/?id=${nodeId}`;

  const handleOpenUrl = () => {
    Linking.openURL(qrCodeUrl); // Open the URL when clicked
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Fetching data for Node ID: {nodeId}</Text>
      <TouchableOpacity onPress={handleOpenUrl}>
        <Text style={styles.link}>Click to View Menu</Text>
      </TouchableOpacity>
      <QRCode
        value={qrCodeUrl} // Pass the qrCodeUrl as the value for generating the QR code
        size={200} // Set the size of the QR code
      />
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
