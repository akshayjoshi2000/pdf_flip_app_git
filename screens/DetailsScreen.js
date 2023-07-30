import React, { useState , useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Picker } from 'react-native';
import { States, Districts } from "state-district-component";
import Select from 'react-select';



const cuisineOptions = [
  { value: 'South Indian', label: 'South Indian' },
  { value: 'North Indian', label: 'North Indian' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Continental', label: 'Continental' },
  { value: 'Thai', label: 'Thai' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Mexican', label: 'Mexican' },
  { value: 'Middle Eastern', label: 'Middle Eastern' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Mediterranean', label: 'Mediterranean' },
  { value: 'Street Food', label: 'Street Food' },
  { value: 'Mughlai', label: 'Mughlai' },
  { value: 'Mangalorean', label: 'Mangalorean' },
  { value: 'Kerala', label: 'Kerala' },
  { value: 'Punjabi', label: 'Punjabi' },
  { value: 'Gujarati', label: 'Gujarati' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Rajasthani', label: 'Rajasthani' },
  { value: 'Goan', label: 'Goan' },
  { value: 'Multicusine', label: 'Multicusine' },
  { value: 'Other', label: 'Other' },
];

const DetailsScreen = ({ navigation , firebase }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('IN'); // Default country code to India
  const [address, setAddress] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  // State and District Selection Handlers
  const [state, setState] = useState({
    value: 'Karnataka', // Default state to Karnataka
    label: 'Karnataka',
  });
  const [district, setDistrict] = useState({
    value: 'Bengaluru (Bangalore) Rural',
    label: 'Bengaluru (Bangalore) Rural'
  });


  useEffect(() => {
    // Load Indian states on component mount
    setState('Karnataka');
    setDistrict(null);
  }, []);

  

  const handleContinue = () => {
    // Validate input fields (you can add more validation logic here)
    if (!name || !phoneNumber || phoneNumber.length !== 10 || !state || !district) {
      alert('Please fill in mandatory fields and ensure Phone Number is 10 digits.');
      return;
    }

    // Navigate to HomeScreen
    navigation.navigate('Home');
  };

  const handleStateChange = (selectedOption) => {
    setState(selectedOption);
    setDistrict(null);
  };

  const handleDistrictChange = (selectedOption) => {
    setDistrict(selectedOption);
  };

  const handleCuisineChange = (selectedOptions) => {
    setSelectedCuisines(selectedOptions);
  };

  const handleUploadToDatabase = () => {
   console.log("in handleUploadToDatabase")
  };




  return (
    <View style={styles.container}>
      <Text style={styles.header}>Details</Text>
      <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
       <View style={styles.phoneContainer}>
        <Picker
          selectedValue={countryCode}
          style={styles.countryCode}
          onValueChange={(itemValue) => setCountryCode(itemValue)}
        >
          <Picker.Item label="India (+91)" value="IN" />
          <Picker.Item label="United States (+1)" value="US" />
          {/* Add more countries as needed */}
        </Picker>
        <TextInput
          style={styles.phoneNumber}
          placeholder="Phone Number"
          value={phoneNumber}
          onChangeText={(text) => {
            // Ensure only 10 digits for phone number
            if (/^\d{0,10}$/.test(text)) {
              setPhoneNumber(text);
            }
          }}
          keyboardType="phone-pad"
          maxLength={10} // Limit the input to 10 characters
        />
      </View>
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
    {/* State and District Selection */}
    <View style={styles.stateDistrictContainer}>
        <View  style={styles.stateContainer}  >
          <Text style={styles.label}  >State:</Text>
          <States styles={styles.stateSelect} 
          onChange={setState} 
          value={state} 
           />
        </View>
        <View style={styles.districtContainer}>
          <Text style={styles.label} editable={false} >District:</Text>
          {state && (
            <Districts
              state={state}
              styles={styles.districtSelect}
              onChange={setDistrict}
              value={district}
              
            />
          )}
        </View>
      </View>
      <View style={styles.cuisineContainer}>
        <Select
          isMulti
          options={cuisineOptions}
          value={selectedCuisines}
          onChange={handleCuisineChange}
          placeholder="Select up to 5 cuisines"
        />
      </View>
      <TouchableOpacity onPress={() => {
          handleContinue();
          handleUploadToDatabase();
        }} style={styles.button}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width: '80%', // Set width to around 80% of the screen
  },
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '80%', // Set width to around 80% of the screen
  },
  countryCode: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    paddingHorizontal: 5,
    marginRight: 5,
    height: 40, // Set the height to match the other input fields
    flex: 1, // To take up the available space
  },
  phoneNumber: {
    flex: 2,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    height: 40, // Set the height to match the other input fields
  },
  cuisineContainer: {
    width: '80%', // Set width to around 80% of the screen
    marginBottom: 10,
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
  
  stateDistrictContainer: {
    flexDirection: 'row',
    width: '80%',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  stateContainer: {
    width:'50%',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
   // height: 40, // Set the same height for both State and District dropdowns
  },
  districtContainer: {
    width:'50%',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
   // height: 40, // Set the same height for both State and District dropdowns
  },
});


export default DetailsScreen;
