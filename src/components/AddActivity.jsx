import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import db from "../firebase/config";

export const addActivity = async (userId, activityType, description) => {
  try {
    const logId = uuidv4();
    const docRef = doc(db, "activities", userId, "logs", logId);
    console.log("Actividad agregada:", docRef.path);
    await setDoc(docRef, {
      activityType,
      description,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error al agregar actividad:", error);
  }
};