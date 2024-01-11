import React from 'react';
import { View, StyleSheet, Text, Button } from 'react-native';

function WelcomePage({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Our ScanForMenu</Text>
      <Text style={styles.subtitle}>For the Internal Team</Text>
      <Button
        title="Nourish the App"
        onPress={() => navigation.navigate('Login')}
        color="#007AFF" // Change the button color
      />
      <Text style={styles.subtitle}>For the OG Restaurant Owners</Text>
      <Button
        title="Freshen Up the Menu"
        onPress={() => navigation.replace('PhoneNumber')}
        color="#007AFF" // Change the button color
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff', // Change the background color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333', // Change the text color
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333', // Change the text color
  },
});

export default WelcomePage;
