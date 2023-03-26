import { initializeApp } from "firebase/app";
import {
    getStorage,
    ref,
    getDownloadURL,
    uploadBytesResumable,
} from "firebase/storage";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import firebaseConfig from "../config/firebaseConfig.js";

initializeApp(firebaseConfig);

const storage = getStorage();
const upload = multer({ storage: multer.memoryStorage() });

const uploadImage = async (file) => {
    const imageName = uuidv4() + "_" + file.originalname;
    const imageRef = ref(storage, "images/" + imageName);
    const metadata = {
        contentType: file.mimetype,
    };
    const snapshot = await uploadBytesResumable(
        imageRef,
        file.buffer,
        metadata
    );
    const imageUrl = await getDownloadURL(snapshot.ref);
    return { name: imageName, url: imageUrl };
};

const uploadImages = async (files) => {
    let uploadedFiles = [];
    for (const i in files) {
        const imageName = uuidv4() + "_" + files[i].originalname;
        const imageRef = ref(storage, "images/" + imageName);
        const metadata = {
            contentType: files[i].mimetype,
        };
        const snapshot = await uploadBytesResumable(
            imageRef,
            files[i].buffer,
            metadata
        );
        const imageUrl = await getDownloadURL(snapshot.ref);
        uploadedFiles.push({ name: imageName, url: imageUrl });
    }
    return uploadedFiles;
};

export { storage, upload, uploadImage, uploadImages };
