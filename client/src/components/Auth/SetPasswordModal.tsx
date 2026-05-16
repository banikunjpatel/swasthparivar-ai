import React, { useState } from 'react';
import { X, Eye, EyeOff, CheckCircle, Lock } from 'lucide-react';
import { EmailAuthProvider, linkWithCredential, User } from 'firebase/auth';

interface SetPasswordModalProps {
  open: boolean;
  firebaseUser: User | null;
  onClose: () => void;
}

const SetPasswordModal: React.FC<SetPasswordModalProps> = ({ open, firebaseUser, onClose }) => {
  const [password, setPassword]           = useState('');
  const [confirm, setConfirm]             = useState('');
  const [showPass, setShowPass]           = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [done, setDone]                   = useState(false);

  if (!open || !firebaseUser) return null;

  const email = firebaseUser.email ?? '';

  const validate = (): string => {
    if (password.length < 8)         return 'Password must be at least 8 characters.';
    if (password !== confirm)        return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    try {
      const credential = EmailAuthProvider.credential(email, password);
      await linkWithCredential(firebaseUser, credential);
      setDone(true);
    } catch (err: any) {
      if (err.code === 'auth/credential-already-in-use' || err.code === 'auth/email-already-in-use') {
        setError('This email already has a password set. You can sign in with email & password directly.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 8 characters.');
      } else {
        setError(err.message || 'Failed to set password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setConfirm('');
    setError('');
    setDone(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 px-6 py-5 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg leading-tight">Set a Password</h2>
              <p className="text-white/75 text-xs mt-0.5">Sign in with email too, anytime</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-white/70 hover:text-white mt-0.5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6">
          {done ? (
            /* ── Success state ── */
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-1">Password Set!</h3>
              <p className="text-gray-500 text-sm mb-2">
                You can now sign in with either Google or:
              </p>
              <p className="text-sm font-medium text-gray-700 bg-gray-50 rounded-lg px-4 py-2 mb-6">
                {email}
              </p>
              <button
                onClick={handleClose}
                className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
              >
                Continue
              </button>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <p className="text-gray-500 text-sm mb-5">
                Your account is linked to <span className="font-medium text-gray-700">{email}</span>.
                Setting a password lets you also sign in with email &amp; password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Confirm */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full border border-gray-300 rounded-xl px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-600">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition"
                  >
                    Skip for now
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-green-600 to-teal-600 text-white text-sm font-semibold hover:opacity-90 active:scale-95 transition disabled:opacity-60"
                  >
                    {loading ? 'Setting…' : 'Set Password'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SetPasswordModal;
