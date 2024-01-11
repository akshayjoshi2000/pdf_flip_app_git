import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Picker } from 'react-native';
import { States, Districts } from "state-district-component";
import Select from 'react-select';
import { firestore } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';

const cuisineOptions = [
  { value: 'South Indian', label: 'South Indian' },
  { value: 'North Indian', label: 'North Indian' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Sea Food', label: 'Sea Food' },
  { value: 'Continental', label: 'Continental' },
  { value: 'Thai', label: 'Thai' },
  { value: 'Kashmiri', label: 'Kashmiri' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Pan-Asian', label: 'Pan-Asian' },
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
  { value: 'Andhra', label: 'Andhra' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Rajasthani', label: 'Rajasthani' },
  { value: 'Goan', label: 'Goan' },
  { value: 'Multicusine', label: 'Multicusine' },
  { value: 'Other', label: 'Other' },
];

const restaurantTypes = [
  { value: 'Cafe', label: 'Cafe' },
  { value: 'Darshini', label: 'Darshini' },
  { value: 'Restaurant', label: 'Restaurant' },
  { value: 'Dhaba', label: 'Dhaba' },
  { value: 'Food Court', label: 'Food Court' },
  { value: 'Pub', label: 'Pub' },
  { value: 'Bar', label: 'Bar' },
  { value: 'Brewery', label: 'Brewery' },
  { value: 'Ice Cream Parlor', label: 'Ice Cream Parlor' },
  { value: 'Pizzeria', label: 'Pizzeria' },
  { value: 'Seafood Restaurant', label: 'Seafood Restaurant' },
  { value: 'Barbecue Restaurant', label: 'Barbecue Restaurant' },
  { value: 'Vegan Restaurant', label: 'Vegan Restaurant' },
  { value: 'Fine Dining Restaurant', label: 'Fine Dining Restaurant' },
  { value: 'Fast Food Restaurant', label: 'Fast Food Restaurant' },
  { value: 'Casual Dining Restaurant', label: 'Casual Dining Restaurant' },
  { value: 'Vegetarian Restaurant', label: 'Vegetarian Restaurant' },
  { value: 'South Indian Restaurant', label: 'South Indian Restaurant' },
  { value: 'North Indian Restaurant', label: 'North Indian Restaurant' },
  { value: 'Regional Cuisine Restaurant', label: 'Regional Cuisine Restaurant' },
  { value: 'Ethnic Restaurant', label: 'Ethnic Restaurant' },
  { value: 'Buffet Restaurant', label: 'Buffet Restaurant' },
  { value: 'Themed Restaurant', label: 'Themed Restaurant' },
  { value: 'Specialty Dessert Shop', label: 'Specialty Dessert Shop' },
  { value: 'Bakery and Pastry Shop', label: 'Bakery and Pastry Shop' },
  { value: 'Live Entertainment Restaurant', label: 'Live Entertainment Restaurant' },
  { value: 'Family Restaurant', label: 'Family Restaurant' },
  { value: 'Street Food Stall', label: 'Street Food Stall' },
  { value: 'Health Food Cafe', label: 'Health Food Cafe' },
  { value: 'Mexican Restaurant', label: 'Mexican Restaurant' },
  { value: 'Japanese Sushi Bar', label: 'Japanese Sushi Bar' },
  { value: 'Mediterranean Restaurant', label: 'Mediterranean Restaurant' },
  { value: 'Korean BBQ Restaurant', label: 'Korean BBQ Restaurant' }
  // Add more restaurant types as needed
];


const radioOptions = [
  { label: 'Vegetarian', value: 0 },
  { label: 'Non-Vegetarian', value: 1 },
  { label: 'Egg + Veg', value: 2 },
  { label: 'Both', value: 3 },
];

const DetailsScreen = ({ navigation, route }) => {
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
  const [selectedSalutation, setSelectedSalutation] = useState('Mr');
  const [selectedPersonType, setSelectedPersonType] = useState('Owner');
  const [googlePlusCode, setGooglePlusCode] = useState('');
  const [website, setWebsite] = useState('');
  const [locality, setLocality] = useState('');
  const [ads_reference, setAds_reference] = useState([]);
  const [selectedRestaurantTypes, setSelectedRestaurantTypes] = useState([]);
  const [numTables, setNumTables] = useState(0); // Initialize with a default value
  const [coordinates, setCoordinates] = useState(''); // State for coordinates input
  const [coordinate, setCoordinate] = useState([null, null]); // State for split coordinates

  // Extract the bucketUrls from the route.params object
  const { bucketUrls } = route.params || {};
  // console.log("bucket url", bucketUrls)

  // To access the URL and index in a loop:
  bucketUrls.map(({ url, index }) => {
    // Use 'url' and 'index' as needed
  });

  const salutationOptions = [
    { label: 'Mr', value: 'Mr' },
    { label: 'Mrs', value: 'Mrs' },
    { label: 'Miss', value: 'Miss' },
  ];

  const personTypeOptions = [
    { label: 'Manager', value: 'Manager' },
    { label: 'Owner', value: 'Owner' },
    { label: 'Receptionist', value: 'Receptionist' },
  ];

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

  const handleCoordinatesChange = (text) => {
    setCoordinates(text);

    // Split coordinates on comma and update the state
    const coordinatesArray = text.split(',');
    if (coordinatesArray.length === 2) {
      setCoordinate([parseFloat(coordinatesArray[0]), parseFloat(coordinatesArray[1])]);
    } else {
      setCoordinate([null, null]);
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


  const handleUploadToDatabase = async (userId) => {
    if (!bucketUrls) {
      console.log("Bucket URLs:", bucketUrls);
      alert('Bucket URL not sent.');
      return;
    }

    if (!state || !district) {
      alert('Please select State and District.');
      return;
    }

    const bucketConstant = "gs://scanformenu-d0cf0.appspot.com/";
    const imageUrl = bucketUrls[0];
    const folderName = imageUrl.split('/').pop().split('%2F')[0];
    const bucketUrl = bucketConstant + folderName;
    console.log(bucketUrl)

   

    try {
      const newData = {
        salutation: selectedSalutation,
        personType: selectedPersonType,
        name: name,
        phoneNumber: phoneNumber,
        countryCode: countryCode,
        restaurantName: restaurantName,
        pincode: pincode,
        address: address,
        googlePlusCode: googlePlusCode,
        website: website,
        state: state,
        district: district,
        RestaurantType: selectedRestaurantTypes.map((RestaurantType) => RestaurantType.label),
        cuisines: selectedCuisines.map((cuisine) => cuisine.label),
        imagesBucketURL: bucketUrls,
        BucketUrl: bucketUrl,
        foodType: radioOptions[selectedOption].label,
        timestamp: serverTimestamp(),
        numTables: numTables, 
        ads_reference: ads_reference, // Replace with your ads_reference
        locality: locality, // Replace with your locality
        coordinates: {
          latitude: parseFloat(coordinate[0]), // Convert latitude to a float
          longitude: parseFloat(coordinate[1]), // Convert longitude to a float
        },
      };

      // Upload data to Firestore
      const docRef = await addDoc(collection(firestore, 'restaurants'), newData);

      // Get the auto-generated document ID
      const documentId = docRef.id;
      console.log("New Document ID:", documentId);

      // Reset input fields after successful upload
      setName('');
      setPhoneNumber('');
      setRestaurantName('');
      setPincode('');
      setSelectedOption('');
      setAddress('');
      setSelectedRestaurantTypes([]);
      setSelectedCuisines([]);
      setState('Karnataka');
      setDistrict('Bengaluru (Bangalore) Urban');
      setCountryCode('+91');
      setSelectedSalutation('Mr');
      setGooglePlusCode('');
      setWebsite('');
      setSelectedPersonType('Owner');
      setNumTables(0);
      setAds_reference([]);

      // Now you can navigate to the ViewQRScreen and pass the document ID as a parameter
      navigation.navigate('ViewQR', { documentId, numTables });
    } catch (error) {
      console.error("Error uploading data:", error);
    }
  };


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Details</Text>
      <View style={styles.pickerContainer}>
        {/* Salutation Picker */}
        <View style={styles.pickerContainerA}>
          <Text style={styles.text}>Select Salutation:</Text>
          <Picker
            selectedValue={selectedSalutation}
            onValueChange={(itemValue) => setSelectedSalutation(itemValue)}
          >
            {salutationOptions.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </View>

        {/* Person Type Picker */}
        <View style={styles.pickerContainerA}>
          <Text style={styles.text}>Select Person Type:</Text>
          <Picker
            selectedValue={selectedPersonType}
            onValueChange={(itemValue) => setSelectedPersonType(itemValue)}
          >
            {personTypeOptions.map((option) => (
              <Picker.Item key={option.value} label={option.label} value={option.value} />
            ))}
          </Picker>
        </View>
      </View>

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
          <Picker.Item label="United States (+1)" value="+1" />
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
        {/* Coordinates Input */}
      <TextInput
        style={styles.input}
        placeholder="Coordinates (latitude, longitude)"
        value={coordinates}
        onChangeText={handleCoordinatesChange}
        keyboardType="numeric"
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

      <View style={styles.cuisineContainer}>
        <Select
          isMulti
          options={restaurantTypes}
          value={selectedRestaurantTypes}
          editable={false}
          onChange={setSelectedRestaurantTypes}
          placeholder="Restaurant Type"
          isSearchable={false}
        />
        <Select
          isMulti
          options={cuisineOptions}
          value={selectedCuisines}
          onChange={handleCuisineChange}
          placeholder="Select up to 5 cuisines"
          editable={false}
          isSearchable={false}
        />
      </View>

      {/* Address Container */}
      <TextInput
        style={styles.input}
        placeholder="Address"
        value={address}
        onChangeText={setAddress}
      />


      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Google Plus Code"
          value={googlePlusCode}
          onChangeText={(text) => setGooglePlusCode(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Website (optional)"
          value={website}
          onChangeText={(text) => setWebsite(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="locality"
          value={locality}
          onChangeText={(text) => setLocality(text)}
        />
        
      </View>

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

      <TextInput
        style={styles.input}
        placeholder="Number of Tables"
        value={numTables === 0 ? '' : numTables.toString()} // Empty string for 0, or the number as a string
        onChangeText={(text) => {
          // Ensure only positive integers for the number of tables
          if (/^\d+$/.test(text)) {
            setNumTables(parseInt(text, 10));
          }
        }}
        keyboardType="numeric"
      />






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

    top: 0,
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
    zIndex: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    width: '80%',
  },
  pickerContainerA: {
    flexDirection: 'column',
    width: '50%',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    width: '80%',
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
    width: '50%',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    // height: 40, // Set the same height for both State and District dropdowns
  },
  districtContainer: {
    width: '50%',
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    padding: 10,
    // height: 40, // Set the same height for both State and District dropdowns
  },
});

export default DetailsScreen;
