import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, Image, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { getFirestore, doc, deleteDoc, collection } from 'firebase/firestore';
import { getStorage, ref, deleteObject } from 'firebase/storage';

function FetchingExistingAds({ restaurantData, getDoc, refreshData  }) {
  const [adsData, setAdsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const adPromises = restaurantData.map(async (ad, index) => {
        const adReferences = ad.ads_reference; // Assuming there can be multiple references

        if (adReferences && adReferences.length > 0) {
          const adImages = await Promise.all(
            adReferences.map(async (adReference, refIndex) => {
              try {
                const adDocSnapshot = await getDoc(adReference);

                if (adDocSnapshot.exists()) {
                  const adData = {
                    ...adDocSnapshot.data(),
                    documentId: adDocSnapshot.id, // Include the documentId in adData
                  };
    
                  
                  return (
                    <View key={refIndex} style={styles.adContainer}>
                      <Image
                        source={{ uri: adData.imageUrl }}
                        style={styles.adImage}
                      />
                      <View style={styles.adContent}>
                        <Text style={styles.adTitle}>{adData.title}</Text>
                        <Text>impressions_left: {adData.impressions_left}</Text>
                        <TouchableOpacity onPress={() => handleLinkPress(adData.linkUrl)}>
                          <Text style={styles.linkText}>{adData.linkUrl}</Text>
                        </TouchableOpacity>
                        <View style={styles.buttonContainer}>
                          <TouchableOpacity
                            style={[styles.button, styles.editButton]}
                            onPress={() => handleEditPress(adData)}
                          >
                            <Text style={styles.buttonText}>Edit</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.button, styles.deleteButton]}
                            onPress={() => handleDeletePress(adData.documentId, fetchData)}
                          >
                            <Text style={styles.buttonText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                }
              } catch (error) {
                console.error("Error fetching ad data:", error);
              }
              return null; // Handle missing or invalid references
            })
          );

          return adImages;
        }
        return null; // Handle missing or invalid references
      });

      const ads = await Promise.all(adPromises);

      setAdsData(ads);
      setIsLoading(false);
    }

    fetchData();
  }, [restaurantData, getDoc]);

  const handleLinkPress = (url) => {
    Linking.openURL(url);
  };

  const handleEditPress = (adData) => {
    // Handle the Edit button press
    console.log("Edit pressed for:", adData);
  };

  const handleDeletePress = async (documentId) => {
    try {
      if (!documentId) {
        console.error("Document ID is undefined or missing.");
        return;
      }
  
      console.log("Deleting advertisement document:", documentId);
  
      const firestore = getFirestore();
      const docRef=(doc(firestore, 'advertisements', documentId ));
      console.log(docRef)

       // Fetch the document data to get the linkUrl
       const docSnapshot = await getDoc(docRef);
       if (docSnapshot.exists()) {
         const { imageUrl } = docSnapshot.data();
   
         // Delete the image from Firebase Storage
         const storage = getStorage();
         const imageRef = ref(storage, imageUrl);
         await deleteObject(imageRef);
   
         console.log("Image deleted from storage:", imageUrl);
    }
  
     await deleteDoc(docRef)
        
      // Refresh the ads after deletion
      fetchData();
    } catch (error) {
      console.error("Error deleting advertisement:", error);
    }
  };
  
  


  return (
    <View>
      {/* Advertisement Section */}
      <Text style={styles.sectionTitle}>Advertisement Section</Text>
      {isLoading ? (
        <Text>Loading...</Text>
      ) : adsData.length > 0 ? (
        <ScrollView>{adsData}</ScrollView>
      ) : (
        <Text>No advertisements available.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  adContainer: {
    borderStyle: 'solid',
    borderColor: 'blue',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  adImage: {
    width: 200,
    height: 80,
    marginRight: 10,
    borderRadius: 10,
  },
  adContent: {
    flex: 1,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkText: {
    fontSize: 14,
    color: 'blue',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  button: {
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: 'blue',
  },
  deleteButton: {
    backgroundColor: 'red',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default FetchingExistingAds;
