// src/screens/ViewQRScreen.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ViewQRScreen = () => {
  return (
    <View style={styles.container}>
      <Text>View QR Code Page</Text>
      {/* Add your content for the view QR code page here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ViewQRScreen;
