// // src/components/AuthModal.tsx
// import React, { useState } from "react";
// import { AlertCircle, CheckCircle, X } from 'lucide-react';

// import {
//   signInWithPopup,
//   signInWithEmailAndPassword,
//   createUserWithEmailAndPassword,
//   sendEmailVerification,
// } from "firebase/auth";
// import { auth, googleProvider } from "./firebaseConfig";
// import { useAuth } from "../../contexts/AuthContext";

// interface AuthModalProps {
//   open: boolean;
//   onClose: () => void;
// }

// const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const { signIn, signUp } = useAuth();
//   const [success, setSuccess] = useState('');

//   if (!open) return null;

//   // 🔹 Google Sign-In
//   const handleGoogleLogin = async () => {
//     try {
//       setLoading(true);
//       const result = await signInWithPopup(auth, googleProvider);
//       const token = await result.user.getIdToken();
//       const isNewUser = (result as any)?._tokenResponse?.isNewUser ?? false;
//       if (isNewUser) {
//         signUpWithFirebase(result.user, token);
//       } else {
//         signInWithFirebase(result.user, token);
//       }

//       onClose();
//       resetForm()
//     } catch (err: any) {
//       console.error(err);
//       handleFirebaseError(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setError('');
//     setSuccess('');
//   };

//   // 🔹 Email/Password Sign-In or Sign-Up
//   const handleEmailAuth = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       let userCredential;
//       if (isLogin) {
//         userCredential = await signInWithEmailAndPassword(auth, email, password);
//         signInWithFirebase(userCredential.user, await userCredential.user.getIdToken());
//       } else {
//         userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;
//         const idToken = await userCredential.user.getIdToken();
//         signUpWithFirebase(user, idToken);
//         await sendEmailVerification(userCredential.user);
//         setSuccess("Verification email sent!");
//       }
//       onClose();
//       resetForm();
//     } catch (err: any) {
//       handleFirebaseError(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFirebaseError = (error: any) => {
//     switch (error.code) {
//       case "auth/email-already-in-use":
//         setError("This email is already registered. Try signing in instead.");
//         break;
//       case "auth/invalid-email":
//         setError("Please enter a valid email address.");
//         break;
//       case "auth/weak-password":
//         setError("Your password is too weak. Please use a stronger one.");
//         break;
//       case "auth/user-not-found":
//         setError("No account found with this email. Try signing up.");
//         break;
//       case "auth/wrong-password":
//         setError("Incorrect password. Try again.");
//         break;
//       default:
//         setError("Something went wrong. Please try again later.");
//         console.error(error);
//     }
//   }

//   const signUpWithFirebase = async (user: any, idToken: string) => {
//     let result;
//     localStorage.setItem('accessToken', idToken)
//     const payload = {
//       uid: user.uid,
//       email: user.email,
//       phoneNumber: user.phoneNumber || "",
//       createdAt: user.metadata.creationTime,
//       emailVerified: user.emailVerified,
//     };
//     result = await signUp(payload);
//     if (!result.error) {
//       setSuccess('Account created! Now please log in to access your Swasth Parivar dashboard.');
//     }
//     return result
//   }

//   const signInWithFirebase = async (user: any, token: string) => {
//     let result;
//     const payload = {
//       uid: user.uid,
//       email: user.email,
//       phoneNumber: user.phoneNumber || "",
//       createdAt: user.metadata.creationTime,
//       emailVerified: user.emailVerified,
//     };
//     result = await signIn(payload, token);
//     if (!result.error) {
//       setSuccess('Account created! Now please log in to access your Swasth Parivar dashboard.');
//     }
//     return result
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">

//       <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
//         <button
//           onClick={() => {
//             onClose();
//             resetForm();
//           }}
//           className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//         >
//           <X className="h-5 w-5" />
//         </button>

//         <div className="text-center mb-8">
//           <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
//             <span className="text-2xl">🧘‍♀️</span>
//           </div>
//           <h2 className="text-2xl font-bold text-gray-800">
//             {isLogin ? 'Welcome Back' : 'Begin Your Journey'}
//           </h2>
//           <p className="text-gray-600 mt-2">
//             {isLogin
//               ? 'Continue your Ayurvedic wellness journey'
//               : 'Discover personalized nutrition for your unique constitution'
//             }
//           </p>
//         </div>
//         <h2 className="text-2xl font-semibold text-center mb-6">
//           {isLogin ? "Sign In" : "Create Account"}
//         </h2>

//         <form onSubmit={handleEmailAuth} className="space-y-4">
//           <input
//             type="email"
//             placeholder="Email"
//             className="w-full border rounded-lg px-4 py-2"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             required
//           />
//           <input
//             type="password"
//             placeholder="Password"
//             className="w-full border rounded-lg px-4 py-2"
//             value={password}
//             onChange={(e) => setPassword(e.target.value)}
//             required
//           />

//           {error && (
//             <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//               <div className="flex items-start space-x-2">
//                 <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
//                 <p className="text-red-600 text-sm">{error}</p>
//               </div>
//             </div>
//           )}

//           {success && (
//             <div className="bg-green-50 border border-green-200 rounded-lg p-4">
//               <div className="flex items-start space-x-2">
//                 <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
//                 <p className="text-green-600 text-sm">{success}</p>
//               </div>
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
//           >
//             {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
//           </button>
//         </form>

//         <div className="mt-4 text-center">
//           <button
//             onClick={handleGoogleLogin}
//             className="w-full bg-gray-100 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
//           >
//             <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
//             Sign in with Google
//           </button>
//         </div>

//         <p className="text-center text-sm mt-4">
//           {isLogin ? "New to Swasth Parivar?" : "Already user of Swasth Parivar?"}
//           <button
//             onClick={() => setIsLogin(!isLogin)}
//             className="text-green-600 ml-1 hover:underline"
//           >
//             {isLogin ? "Sign up" : "Login"}
//           </button>
//         </p>

//       </div>
//     </div>
//   );
// };

// export default AuthModal;


// src/components/AuthModal.tsx
import React, { useState } from "react";
import { AlertCircle, CheckCircle, X } from "lucide-react";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  RecaptchaVerifier,
  signInWithPhoneNumber,
} from "firebase/auth";
import { auth, googleProvider } from "./firebaseConfig";
import { useAuth } from "../../contexts/AuthContext";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ open, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [useOtp, setUseOtp] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { signIn, signUp } = useAuth();

  if (!open) return null;

  // ---------- Helpers ----------
  const resetForm = () => {
    setError("");
    setSuccess("");
    setEmail("");
    setPassword("");
    setPhone("");
    setOtp("");
    setConfirmationResult(null);
    setUseOtp(false);
  };

  const handleFirebaseError = (err: any) => {
    console.error("Firebase error:", err);
    if (!err || !err.code) {
      setError("Something went wrong. Please try again.");
      return;
    }
    switch (err.code) {
      case "auth/email-already-in-use":
        setError("This email is already registered. Try signing in instead.");
        break;
      case "auth/invalid-email":
        setError("Please enter a valid email address.");
        break;
      case "auth/weak-password":
        setError("Your password is too weak. Please use a stronger one.");
        break;
      case "auth/user-not-found":
        setError("No account found with this email. Try signing up.");
        break;
      case "auth/wrong-password":
        setError("Incorrect password. Try again.");
        break;
      case "auth/too-many-requests":
        setError("Too many attempts. Try again later.");
        break;
      default:
        setError(err.message || "Authentication failed. Please try again.");
    }
  };

  // ---------- Google sign in ----------
  const handleGoogleLogin = async () => {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      // Determine if backend signup or signin - we use signUp for new users and signIn for existing.
      // Attempt signIn first (backend should return appropriate error if user not found).
      const payload = {
        uid: result.user.uid,
        email: result.user.email,
        phoneNumber: result.user.phoneNumber || "",
        createdAt: result.user.metadata.creationTime,
        emailVerified: result.user.emailVerified,
      };

      const res = await signIn(payload, token);
      if (res?.error) {
        // If backend says user not found, we can optionally give signup option.
        // Here we try to sign up automatically only if user chooses (but Option B: OTP login only => for Google we'll show message)
        setError(res.error || "Login failed. Please sign up first.");
        // Do not auto-signup in Option B.
      } else {
        setSuccess("Login successful!");
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      }
    } catch (err: any) {
      handleFirebaseError(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Email / Password ----------
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      let userCredential: any;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await userCredential.user.getIdToken();
        const payload = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          phoneNumber: userCredential.user.phoneNumber || "",
          createdAt: userCredential.user.metadata.creationTime,
          emailVerified: userCredential.user.emailVerified,
        };
        const res = await signIn(payload, idToken);
        if (res?.error) {
          setError(res.error || "Login failed. Please try again.");
        } else {
          setSuccess("Login successful!");
          setTimeout(() => {
            onClose();
            resetForm();
          }, 1000);
        }
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Send verification email
        await sendEmailVerification(userCredential.user);
        // Call backend signup (your backend expects signup flow)
        const idToken = await userCredential.user.getIdToken();
        const payload = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          phoneNumber: userCredential.user.phoneNumber || "",
          createdAt: userCredential.user.metadata.creationTime,
          emailVerified: userCredential.user.emailVerified,
        };
        const res = await signUp(payload);
        if (res?.error) {
          setError(res.error || "Signup failed. Please try again.");
        } else {
          setSuccess("Account created! Verification email sent. Please verify and then login.");
          // keep modal open so user can login after verification
        }
      }
    } catch (err: any) {
      handleFirebaseError(err);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Phone OTP (Option B: OTP login only) ----------
  const setupRecaptcha = () => {
  if (!(window as any).recaptchaVerifier) {
    (window as any).recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "recaptcha-container",
      { size: "invisible" }
    );
  }
  return (window as any).recaptchaVerifier;
};

  const handleSendOtp = async () => {
    setError("");
    setSuccess("");
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Please enter a valid 10-digit Indian mobile number");
      return;
    }
    setLoading(true);
    try {
      // setupRecaptcha();
      const appVerifier = setupRecaptcha();
  const fullPhone = `+91${phone}`;
  const confirmationResult = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      //  const appVerifier = setupRecaptcha();
      // const fullPhone = `+91${phone}`;
      // const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
      setConfirmationResult(confirmationResult);
      setSuccess("OTP sent successfully to your phone.");
    } catch (err: any) {
      console.error("Send OTP error:", err);
      handleFirebaseError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");
    if (!confirmationResult) {
      setError("Please request OTP first.");
      return;
    }
    if (!otp || otp.trim().length < 4) {
      setError("Please enter the OTP.");
      return;
    }
    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();

      // Build payload for backend signIn (Option B: do not auto-signup)
      const payload = {
        uid: result.user.uid,
        email: result.user.email || "",
        phoneNumber: result.user.phoneNumber || "",
        createdAt: result.user.metadata?.creationTime || "",
        emailVerified: result.user.emailVerified || false,
      };

      const res = await signIn(payload, idToken);

      if (res?.error) {
        // If backend returns a user-not-found style error, inform user to use email signup
        // We assume backend returns consistent error messages in res.error
        setError(
          res.error ||
            "No account associated with this phone number. Please sign up using Email & Password."
        );
      } else {
        setSuccess("Login successful!");
        setTimeout(() => {
          onClose();
          resetForm();
        }, 1000);
      }
    } catch (err: any) {
      console.error("Verify OTP error:", err);
      // Firebase errors like auth/invalid-verification-code
      if (err?.code === "auth/invalid-verification-code") {
        setError("Invalid OTP. Please try again.");
      } else {
        setError(err?.message || "OTP verification failed. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------- UI ----------
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            onClose();
            resetForm();
          }}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🧘‍♀️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isLogin ? "Welcome Back" : "Begin Your Journey"}
          </h2>
          <p className="text-gray-600 mt-2">
            {isLogin
              ? "Continue your Ayurvedic wellness journey"
              : "Discover personalized nutrition for your unique constitution"}
          </p>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-6">
          {isLogin ? "Sign In" : "Create Account"}
        </h2>

        {/* Form */}
        <form
          onSubmit={useOtp ? handleVerifyOtp : handleEmailAuth}
          className="space-y-4"
        >
          {/* Toggle between Email and OTP 
          <div className="flex items-center justify-center gap-3 mb-2">
            <button
              type="button"
              onClick={() => {
                setUseOtp(false);
                setError("");
                setSuccess("");
              }}
              className={`px-3 py-1 rounded-full border ${
                !useOtp ? "bg-green-50 border-green-300" : "bg-white border-gray-200"
              }`}
            >
              Email
            </button>
            <button
              type="button"
              onClick={() => {
                setUseOtp(true);
                setError("");
                setSuccess("");
              }}
              className={`px-3 py-1 rounded-full border ${
                useOtp ? "bg-green-50 border-green-300" : "bg-white border-gray-200"
              }`}
            >
              Mobile (OTP)
            </button>
          </div>*/}

          {useOtp ? (
            <>
              {/* PHONE */}
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                className="w-full border rounded-lg px-4 py-2"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                required
              />

              {confirmationResult ? (
                <input
                  type="text"
                  placeholder="Enter OTP"
                  className="w-full border rounded-lg px-4 py-2"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  required
                />
              ) : null}

              {!confirmationResult ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>
              )}
            </>
          ) : (
            <>
              {/* EMAIL / PASSWORD */}
              <input
                type="email"
                placeholder="Email"
                className="w-full border rounded-lg px-4 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="w-full border rounded-lg px-4 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
              >
                {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
              </button>
            </>
          )}
        </form>

        {/* status messages */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
            <div className="flex items-start space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-600 text-sm">{success}</p>
            </div>
          </div>
        )}

        {/* Google Sign-in */}
        <div className="mt-4 text-center">
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-gray-100 py-2 rounded-lg hover:bg-gray-200 flex items-center justify-center gap-2"
            disabled={loading}
          >
            <img
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Sign in with Google
          </button>
        </div>

        <p className="text-center text-sm mt-4">
          {isLogin ? "New to Swasth Parivar?" : "Already user of Swasth Parivar?"}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-green-600 ml-1 hover:underline"
          >
            {isLogin ? "Sign up" : "Login"}
          </button>
        </p>

        {/* recaptcha container */}
        

        <div className="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
          <div className="text-center">
            <p className="text-sm text-gray-700 mb-2 font-semibold">🌿 Ancient Wisdom, Modern Science</p>
            <p className="text-xs text-gray-600">Personalized wellness based on your Ayurvedic constitution</p>
          </div>
        </div>
      </div>
      <div id="recaptcha-container" />
    </div>
  );
};

export default AuthModal;

