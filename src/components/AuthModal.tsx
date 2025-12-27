import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        toast.success("Account created successfully!");
      } else {
        await signIn(email, password);
        toast.success("Signed in successfully!");
      }
      onClose();
    } catch (error: any) {
      // Handle specific Firebase error codes with helpful messages
      if (error.code === "auth/operation-not-allowed") {
        toast.error(
          "⚠️ Email/Password authentication is not enabled. Developer: Enable it in Firebase Console → Authentication → Sign-in method",
          { duration: 8000 }
        );
      } else if (error.code === "auth/email-already-in-use") {
        toast.error(
          "This email is already registered. Try signing in instead."
        );
      } else if (error.code === "auth/weak-password") {
        toast.error("Password should be at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Invalid email address.");
      } else if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        toast.error("Invalid email or password.");
      } else {
        toast.error(error.message || "Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("Signed in with Google!");
      onClose();
    } catch (error: any) {
      // Handle specific Firebase error codes for Google sign-in
      if (error.code === "auth/operation-not-allowed") {
        toast.error(
          "⚠️ Google authentication is not enabled. Developer: Enable it in Firebase Console → Authentication → Sign-in method",
          { duration: 8000 }
        );
      } else if (error.code === "auth/popup-closed-by-user") {
        toast.error("Sign-in cancelled.");
      } else {
        toast.error(error.message || "Google sign-in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ✕
        </button>

        <div className="modal-header">
          <h2>{isSignUp ? "Create Account" : "Welcome Back"}</h2>
          <p>
            {isSignUp
              ? "Sign up to save your analyses"
              : "Sign in to your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Please wait..." : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="divider">
          <span>OR</span>
        </div>

        <button
          className="google-btn"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#4285F4"
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
            />
            <path
              fill="#EA4335"
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="toggle-mode">
          <button type="button" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp
              ? "Already have an account? Sign In"
              : "Don't have an account? Sign Up"}
          </button>
        </div>

        <style jsx>{`
          .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            padding: 1rem;
            backdrop-filter: blur(4px);
          }

          .modal-content {
            background: white;
            border-radius: 16px;
            padding: 2.5rem;
            max-width: 440px;
            width: 100%;
            position: relative;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }

          .close-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #999;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            transition: all 0.2s;
          }

          .close-btn:hover {
            background: #f0f0f0;
            color: #333;
          }

          .modal-header {
            text-align: center;
            margin-bottom: 2rem;
          }

          .modal-header h2 {
            margin: 0 0 0.5rem 0;
            color: #1a1a1a;
            font-size: 1.75rem;
          }

          .modal-header p {
            margin: 0;
            color: #666;
            font-size: 0.95rem;
          }

          .form-group {
            margin-bottom: 1.25rem;
          }

          label {
            display: block;
            margin-bottom: 0.5rem;
            color: #333;
            font-weight: 600;
            font-size: 0.9rem;
          }

          input {
            width: 100%;
            padding: 0.875rem;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 1rem;
            transition: border-color 0.2s;
          }

          input:focus {
            outline: none;
            border-color: #667eea;
          }

          input:disabled {
            background: #f5f5f5;
            cursor: not-allowed;
          }

          .submit-btn {
            width: 100%;
            padding: 1rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            margin-top: 0.5rem;
          }

          .submit-btn:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }

          .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .divider {
            text-align: center;
            margin: 1.5rem 0;
            position: relative;
          }

          .divider::before {
            content: "";
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: #e0e0e0;
          }

          .divider span {
            background: white;
            padding: 0 1rem;
            color: #999;
            font-size: 0.85rem;
            position: relative;
            z-index: 1;
          }

          .google-btn {
            width: 100%;
            padding: 1rem;
            background: white;
            color: #333;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.75rem;
            transition: all 0.2s;
          }

          .google-btn:hover:not(:disabled) {
            border-color: #999;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .google-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .toggle-mode {
            text-align: center;
            margin-top: 1.5rem;
          }

          .toggle-mode button {
            background: none;
            border: none;
            color: #667eea;
            font-size: 0.9rem;
            cursor: pointer;
            text-decoration: underline;
          }

          .toggle-mode button:hover {
            color: #764ba2;
          }

          @media (prefers-color-scheme: dark) {
            .modal-content {
              background: #1a1a1a;
            }

            .close-btn {
              color: #999;
            }

            .close-btn:hover {
              background: #2a2a2a;
              color: #e0e0e0;
            }

            .modal-header h2 {
              color: #ffffff;
            }

            .modal-header p {
              color: #999;
            }

            label {
              color: #e0e0e0;
            }

            input {
              background: #2a2a2a;
              border-color: #404040;
              color: #ffffff;
            }

            input:disabled {
              background: #1a1a1a;
            }

            .divider::before {
              background: #404040;
            }

            .divider span {
              background: #1a1a1a;
            }

            .google-btn {
              background: #2a2a2a;
              border-color: #404040;
              color: #e0e0e0;
            }

            .google-btn:hover:not(:disabled) {
              border-color: #666;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
