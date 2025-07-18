import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-app.js'
import {
  getDatabase,
  ref,
  push,
  onChildAdded,
  onValue,
  set,
  update
} from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-database.js'
import {
  getAuth,
  setPersistence,
  signInWithCustomToken,
  browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/10.3.0/firebase-auth.js'

// Toggle this to switch environments
const IS_PROD = false; // ✅ Set to true for production

// --- FIREBASE CONFIGURATIONS ---
const DEV_CONFIG = {
  apiKey: "AIzaSyBCgzV9Zkweb2s2PdcW0fN6xsHbynWOnS0",
  authDomain: "pf-dev-97473.firebaseapp.com",
  databaseURL: "https://pf-dev-97473-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "pf-dev-97473",
  storageBucket: "pf-dev-97473.appspot.com",
  messagingSenderId: "915516844096",
  appId: "1:915516844096:web:8e58c7c7831be01c2a17a5",
  measurementId: "G-F01XCGRM1B"
};

const PROD_CONFIG = {
  apiKey: "YOUR_PROD_API_KEY",
  authDomain: "pf-prod.firebaseapp.com",
  databaseURL: "https://pf-prod-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "pf-prod",
  storageBucket: "pf-prod.appspot.com",
  messagingSenderId: "YOUR_PROD_MESSAGING_SENDER_ID",
  appId: "YOUR_PROD_APP_ID",
  measurementId: "YOUR_PROD_MEASUREMENT_ID"
};

// --- INIT FIREBASE ---
const firebaseConfig = IS_PROD ? PROD_CONFIG : DEV_CONFIG;
export var app = initializeApp(firebaseConfig)
export const db = getDatabase(app)
 
window.bInitialized = false
window.gifterName = null
window.giftImage = null
window.giftCount = 0

function login(sessionToken)
{
        console.log(sessionToken);
  
        setPersistence(getAuth(), browserLocalPersistence)
          .then(() => {
            return signInWithCustomToken(getAuth(), sessionToken)
              .then(userCredential => {
                // Handle successful login
                console.log('User signed in');
  
                window.userId = userCredential.user.uid;
                window.isLoggedIn = true;
   
                // const hostRef = ref(db, `pf-rooms/${window.lobbyId}/host`);
  
                // onValue(hostRef, snapshot => {
                //   const host = snapshot.val();
                 
                // });
  
                // const statusRef = ref(
                //   db,
                //   `pf-rooms/${window.lobbyId}/events/uid/${window.userId}/`
                // );
  
                // onValue(statusRef, handleNewGift);
              })
              .catch(error => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Login error:', errorMessage);
              });
          })
          .catch(error => {
           // console.error('Persistence error:', error.message);
          });

}
      
        
window.login = login;


  // Wait until the DOM is fully loaded before accessing _runtime.login
  document.addEventListener('DOMContentLoaded', () => {
  
  });





function handleNewGift (snapshot) {
	if(!window.bInitialized){
	window.bInitialized = true;
	
	
	
	return
	}
	 
	const status = snapshot.val()
	const hostGifts = status[window.userId]
	
	const eventIds = Object.keys(hostGifts)
	const lastEventId = eventIds[eventIds.length - 1];
	const lastEventData = hostGifts[lastEventId]
	 
	window.giftImage = lastEventData.gift.iconUrl
	
	window.gifterName = lastEventData.sender.name
	window.giftCount = lastEventData.quantity
	
 
 
			  
}

// --- GACHA + MODULE IMPORT ---
const SCRIPT_URL = 'https://cdn.playfriends.gg/_1o/mrtf_10y_zx11-a/f8d3b54c.js';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; 

async function importWithRetry(url, retries = MAX_RETRIES) {
  

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const module = await import(url);
    // console.log(`Module loaded on attempt ${attempt}`);
      return module;
    } catch (e) {
    // console.warn(`Attempt ${attempt} failed to import module.`);
      if (attempt < retries) await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
    }
  }

 // console.error("Failed to import module after all retries.");
  return null;
}

function timeout(ms) {
  return new Promise((_, reject) => setTimeout(() => reject(new Error("sendEvent timed out")), ms));
}

async function runGacha(eventName, payload, callbackFunction) {
  try {
    const mod = await importWithRetry(SCRIPT_URL);

    if (!mod || typeof mod.sendEvent !== 'function') {
      throw new Error("sendEvent not found or not a function in module");
    }

   // console.log(`Calling sendEvent with event: ${eventName} and payload:`, payload);

    let response;
    try {
      response = await Promise.race([
        mod.sendEvent(eventName, payload, true),
        timeout(5000)
      ]);
      //console.log(`${eventName} response from PARENT:`, response);
    } catch (e) {
    // console.error('sendEvent failed or timed out:', e);
      throw e;
    }

    if (!response) {
   //  console.warn(`No response received from sendEvent for event ${eventName}`);
    }

    const dataToLoad = response;
 
    if (typeof callbackFunction === "string" && typeof window[callbackFunction] === "function") {
  try {
    window[callbackFunction](JSON.stringify(dataToLoad));
  } catch (e) {
   // console.warn(`Callback "${callbackFunction}" failed:`, e);
  }
}
  } catch (err) {
 //   console.warn("Error in runGacha:", err);
  }
}

window.runGacha = runGacha;