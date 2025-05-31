import admin from "firebase-admin";
import fs from "fs";

export const serviceAccount = JSON.parse(fs.readFileSync("C:/Users/Joshua/Pictures/swifthomes-v3/swifthomes-v3-firebase-adminsdk-fbsvc-28a754e3da.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "swifthomes-v3.appspot.com",
});

const dbAdmin = admin.firestore();
const bucket = admin.storage().bucket();

export default { dbAdmin, bucket };