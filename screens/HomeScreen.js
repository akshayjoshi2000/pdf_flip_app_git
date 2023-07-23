import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, Linking } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';

const HomeScreen = () => {
  const [pdfUri, setPdfUri] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [convertedMessage, setConvertedMessage] = useState('');

  useEffect(() => {
    if (isConverting) {
      // Simulate conversion progress with setInterval
      const progressInterval = setInterval(() => {
        setProgress(prevProgress => {
          const newProgress = prevProgress + 10;
          return newProgress <= 100 ? newProgress : 100;
        });
      }, 1000); // Adjust the interval time based on actual conversion time

      // Simulate conversion completion with setTimeout
      setTimeout(() => {
        setIsConverting(false);
        clearInterval(progressInterval);
        setConvertedMessage('PDF successfully converted to a flipbook!');
        setPdfUri(null); // Reset pdfUri once the flipbook is displayed
        downloadConvertedFlipbook(); // Download the converted flipbook
      }, 10000); // Adjust the timeout value based on actual conversion time
    }
  }, [isConverting]);

  const handleChooseFile = async () => {
    if (!pdfUri) {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/pdf',
        });

        if (result.type === 'success') {
          setPdfUri(result.uri);
          setIsConverting(true);
          setProgress(0);

          // Save PDF to a temporary folder
          const tempDir = `${FileSystem.cacheDirectory}pdfs/`;
          await FileSystem.makeDirectoryAsync(tempDir, { intermediates: true });
          const fileName = result.uri.split('/').pop();
          const newUri = `${tempDir}${fileName}`;
          await FileSystem.copyAsync({ from: result.uri, to: newUri });
        }
      } catch (err) {
        console.log('Error picking PDF:', err);
      }
    }
  };

  const downloadConvertedFlipbook = async () => {
    // Simulate generating flipbook content
    const flipbookContent = '<div>PDF Content Converted to Flipbook</div>';
    const flipbookFileName = 'flipbook.html';

    // Save flipbook to the device's file system
    await FileSystem.writeAsStringAsync(
      `${FileSystem.documentDirectory}${flipbookFileName}`,
      flipbookContent
    );

    // Trigger the download
    if (Platform.OS === 'web') {
      // For web platform
      const link = document.createElement('a');
      link.href = `${FileSystem.documentDirectory}${flipbookFileName}`;
      link.download = flipbookFileName;
      link.click();
      setConvertedMessage(''); // Reset converted message after download
    } else if (Platform.OS === 'android') {
      // For Android platform
      const fileUri = `file://${FileSystem.documentDirectory}${flipbookFileName}`;
      Linking.openURL(fileUri);
      setConvertedMessage(''); // Reset converted message after download
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>PDF to Flipbook Converter</Text>
      {pdfUri ? (
        <Text style={styles.message}>PDF file uploaded!</Text>
      ) : (
        <TouchableOpacity onPress={handleChooseFile} style={styles.button}>
          <Text style={styles.buttonText}>Choose PDF File</Text>
        </TouchableOpacity>
      )}
      {isConverting && (
        <View style={styles.progressBar}>
          <View
            style={{ width: `${progress}%`, height: 10, backgroundColor: '#007bff', borderRadius: 5 }}
          />
          <Text style={styles.progressText}>{`${progress}%`}</Text>
        </View>
      )}
      {convertedMessage !== '' && !isConverting && (
        <Text style={styles.message}>{convertedMessage}</Text>
      )}
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
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    marginTop: 20,
    fontSize: 18,
    color: '#007bff',
    fontWeight: 'bold',
  },
  progressBar: {
    width: '80%',
    height: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressText: {
    marginTop: 5,
    textAlign: 'center',
  },
});

export default HomeScreen;
