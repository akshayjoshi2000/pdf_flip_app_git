import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./config";
import { v4 as uuidv4 } from "uuid";
import compressedImages from "../screens/HomeScreen";

function UploadBytesImage({ compressedImages }) {
  const [imageUploads, setImageUploads] = useState([]);

  const handleImageUpload = (event) => {
    const files = event.target.files;
    // Compress the selected images
    const compressed = compressImages(files); // Implement the image compression logic
    setImageUploads(Array.from(compressed));
  };

  const uploadFiles = () => {
    const timestamp = Date.now();
    const randomIdentifier = Math.random().toString(36).substring(2, 10);
    const folderName = `${timestamp}_${randomIdentifier}`;

    const uploadPromises = imageUploads.map((file) => {
      const imageRef = ref(
        storage,
        `${folderName}/${file.name}_${uuidv4()}`
      );
      return uploadBytes(imageRef, file).then((snapshot) => {
        return getDownloadURL(snapshot.ref);
      });
    });

    Promise.all(uploadPromises).then((urls) => {
      // Update the parent component's state with the image URLs
      setCompressedImages(urls);
    });
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
      />
      <button onClick={uploadFiles}>Upload Images</button>
    </div>
  );
}

export default UploadBytesImage;
