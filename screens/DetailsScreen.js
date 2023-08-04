import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Picker } from 'react-native';
import { States, Districts } from "state-district-component";
import Select from 'react-select';
import { ref, push } from "firebase/database";
import { database } from "../firebase/config";
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';

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

const radioOptions = [
  { label: 'Vegetarian', value: 0 },
  { label: 'Non-Vegetarian', value: 1 },
  { label: 'Egg + Veg', value: 2 },
  { label: 'Both', value: 3 },
];

const DetailsScreen = ({ navigation, route  }) => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [restaurantName, setRestaurantName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState([]);
  const [state, setState] = useState('Karnataka');
  const [district, setDistrict] = useState('Bengaluru (Bangalore) Urban');
  const [pincode, setPincode] = useState('');
  const [selectedOption, setSelectedOption] = useState(0);
   // Extract the bucketUrls from the route.params object
  const { bucketUrls } = route.params || {};
 // console.log("bucket url", bucketUrls)

  const getStateValue = (value) => {
    // for geting  the input value pass the function in oChnage props and you will get value back from component
    setState(value);
    console.log(value)
  };
  const getDistrictValue = (value) => {
    setDistrict(value);
    console.log(value)
  };

  const handlePincodeChange = (text) => {
    // Ensure only numbers with a maximum of 6 digits are accepted
    if (/^\d{0,6}$/.test(text)) {
      setPincode(text);
    }
  };

  const handleOptionSelect = (value) => {
    setSelectedOption(value);
  };

  const handleContinue = () => {
    if (!name || !phoneNumber || phoneNumber.length !== 10 || !state || !district) {
      alert('Please fill in mandatory fields and ensure Phone Number is 10 digits.');
      return;
    }
    //navigation.navigate('viewqr');
  };

  const handleCuisineChange = (selectedOptions) => {
    setSelectedCuisines(selectedOptions);
  };


  const handleUploadToDatabase = (userId) => {
    if (!bucketUrls){
      console.log("Bucket URLs :", bucketUrls);
      alert('bucket url not sent.');
      return;
    }
    

    if (!state || !district) {
      console.log("state:", setState(value));
      console.log("district:",setDistrict(value) );
      alert('Please select State and District.');
      return;
    }
    const newData = {
      name: name,
      phoneNumber: phoneNumber,
      countryCode: countryCode,
      restaurantName: restaurantName,
      pincode: pincode,
      address: address,
      state: state,
      district: district,
      cuisines: selectedCuisines.map((cuisine) => cuisine.label),
      imagesBucketURL: bucketUrls,
      foodType: radioOptions[selectedOption].label,
    };

    // Upload data to Firebase with a new user_id
    push(ref(database, `restaurants/${userId}`), newData)
      .then(() => {
        // Reset input fields after successful upload
        setName('');
        setPhoneNumber('');
        setRestaurantName('');
        setPincode('')
        setSelectedOption('')
        setAddress('');
        setSelectedCuisines([]);
        setState({
          value: 'Karnataka',
          label: 'Karnataka',
        });
        setDistrict(null);
        setCountryCode('IN');
      })
      .catch((error) => {
        console.error("Error uploading data:", error);
      });

      const newRef = push(ref(database, `restaurants/${userId}`), newData)
      .then((reference) => {
        // Get the newly created node's key (nodeId)
        const nodeId = reference.key;
        console.log("New Node ID:", nodeId);

        // Now you can navigate to the ViewQRScreen and pass the nodeId as a parameter
        navigation.navigate('ViewQR', { nodeId });
      })
      .catch((error) => {
        console.error("Error uploading data:", error);
      });
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
          <Picker.Item label="India (+91)" value="+91" />
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
      {/* Restaurant Name Field */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Restaurant Name"
          value={restaurantName}
          onChangeText={setRestaurantName}
        />
        <TextInput
          style={styles.input}
          placeholder="Pincode"
          value={pincode}
          onChangeText={setPincode}
          keyboardType="numeric" // To show numeric keyboard
        />
      </View>

      {/* Radio Button Container */}
    <View style={styles.radioContainer}>
        <View style={styles.radioRow}>
          {radioOptions.slice(0, 2).map((obj, i) => (
            <View key={i} style={styles.radioColumn}>
              <RadioButton labelHorizontal={true}>
                <RadioButtonInput
                  obj={obj}
                  index={i}
                  isSelected={selectedOption === i}
                  onPress={handleOptionSelect}
                  borderWidth={1}
                  buttonInnerColor={'#007bff'}
                  buttonOuterColor={selectedOption === i ? '#007bff' : '#000'}
                  buttonSize={10}
                  buttonOuterSize={20}
                />
                <RadioButtonLabel obj={obj} index={i} onPress={handleOptionSelect} labelStyle={styles.radioLabel} />
              </RadioButton>
            </View>
          ))}
        </View>
        <View style={styles.radioRow}>
          {radioOptions.slice(2, 4).map((obj, i) => (
            <View key={i} style={styles.radioColumn}>
              <RadioButton labelHorizontal={true}>
                <RadioButtonInput
                  obj={obj}
                  index={i + 2}
                  isSelected={selectedOption === i + 2}
                  onPress={handleOptionSelect}
                  borderWidth={1}
                  buttonInnerColor={'#007bff'}
                  buttonOuterColor={selectedOption === i + 2 ? '#007bff' : '#000'}
                  buttonSize={10}
                  buttonOuterSize={20}
                />
                <RadioButtonLabel obj={obj} index={i + 2} onPress={handleOptionSelect} labelStyle={styles.radioLabel} />
              </RadioButton>
            </View>
          ))}
        </View>
      </View>

      {/* Address Container */}
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />
    {/* State and District Selection */}
     <View style={styles.stateDistrictContainer}>
        <View style={styles.stateContainer}>
          <Text style={styles.label}>State:</Text>
          <States
            className="state-input" // You can add a custom className here if needed
            styles={styles.stateSelect} // Custom styles for the input field
            onChange={getStateValue} // Pass the state update function here
          />
        </View>
        <View style={styles.districtContainer}>
          <Text style={styles.label}>District:</Text>
       
            <Districts
              className="district-input" // You can add a custom className here if needed
              style={styles.districtSelect} // Custom styles for the input field
              state={state} // Pass the selected state here to filter districts
              onChange={getDistrictValue} // Pass the district update function here
            />
   
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
    height: 40, 
    width: '80%',// Set the height to match the other input fields
  },
  cuisineContainer: {
    width: '80%', // Set width to around 80% of the screen
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '80%',
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

  radioContainer: {
    width: '100%',
    marginBottom: 10,
    width: '80%',
  },
  radioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radioColumn: {
    flex: 1,
  },
  radioLabel: {
    fontSize: 14,
    marginLeft: 10,
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
