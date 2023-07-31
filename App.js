import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import DetailsScreen from './screens/DetailsScreen';
import ViewQRScreen from './screens/ViewQRScreen';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';


const Stack = createStackNavigator();

const HomeRoute = () => (
  <Route path="/home" component={Home} />
);

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home" >
        <Stack.Screen name="Details" component={DetailsScreen} options={{ title: 'Details' }} />  
       <Stack.Screen name="Home"  component={HomeScreen} options={{ title: 'PDF to Flipbook Converter' }} />
             
        <Stack.Screen name="ViewQR" component={ViewQRScreen} options={{ title: 'View QR Code Page' }} />
      </Stack.Navigator>
    </NavigationContainer>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
