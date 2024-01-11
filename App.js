import React, { useState } from 'react';
import { View, StyleSheet, Text, Button, TextInput, Alert } from 'react-native';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WelcomePage from './screens/WelcomePage';
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';
import ViewQRScreen from './screens/ViewQRScreen';
import PhoneNumberPage from './screens/PhoneNumberPage';
import ImageGalleryPage from './screens/ImageGallery';

const Stack = createStackNavigator();


function LoginScreen({ navigation }) {
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Check if the password is correct (e.g., "secret" in this example)
    if (password === 'secret') {
      navigation.navigate('Home');
    } else {
      // Password is incorrect, show an error message
      Alert.alert('Incorrect password', 'Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter the password to access uploading:</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        onChangeText={(text) => setPassword(text)}
        value={password}
        placeholder="Password"
        placeholderTextColor="#888"
      />
      <Button
        title="Login"
        onPress={handleLogin}
        color="#007AFF" // Change the button color
      />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="WelcomePage">
        <Stack.Screen
          name="WelcomePage"
          component={WelcomePage}
          options={{ title: 'Welcome' }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ title: 'Login' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'PDF to Flipbook Converter' }}
        />
        <Stack.Screen
          name="Details"
          component={DetailsScreen}
          options={{ title: 'Details' }}
        />
        <Stack.Screen
          name="ViewQR"
          component={ViewQRScreen}
          options={{ title: 'Scan For Menu' }}
        />
        {/* Add screens for OG entrepreneurs here */}
        <Stack.Screen
          name="PhoneNumber"
          component={PhoneNumberPage}
          options={{ title: 'Phone Number Page' }}
          initialParams={{ navigation }} // Pass the navigation prop
        />

        <Stack.Screen
          name="ImageGallery" // Unique name for the ImageGallery screen
          component={ImageGalleryPage}
          options={{ title: 'ImageGallery' }}
        />
      </Stack.Navigator>

    </NavigationContainer>

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
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333', // Change the text color
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#007AFF', // Change the border color
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 5, // Add rounded corners
    color: '#333', // Change the text color
  },
});
