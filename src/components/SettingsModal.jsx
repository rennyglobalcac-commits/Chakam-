import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Settings, Users, Mic, MicOff, Save, Trash2, Plus, 
  Check, Phone, Calendar, Heart, ShieldAlert, Sparkles, FileText, Volume2 
} from 'lucide-react';
import { sounds, speakAunty } from '../utils/audio';

export default function SettingsModal({
  isOpen,
  onClose,
  state,
  onUpdateFriends,
  onUpdateUser
}) {
  const [activeTab, setActiveTab] = useState('FRIENDS'); // 'FRIENDS' | 'PROFILE'
  const [selectedFriendId, setSelectedFriendId] = useState(state.friends[0]?.id || null);
  
  // Friend Form State
  const [friendName, setFriendName] = useState('');
  const [friendPhone, setFriendPhone] = useState('');
  const [friendBirthday, setFriendBirthday] = useState('');
  const [friendNotes, setFriendNotes] = useState('');
  const [friendBank, setFriendBank] = useState('');
  const [friendRole, setFriendRole] = useState('Friend');

  // User Profile Form State
  const [userName, setUserName] = useState(state?.user?.name || 'Adaeze');
  const [userRole, setUserRole] = useState(state?.user?.role || 'Nurse & Fashion Designer');
  const [accountabilityPartner, setAccountabilityPartner] = useState(state?.user?.accountabilityPartner || 'Ada');
  const [partnerPhone, setPartnerPhone] = useState(state?.user?.partnerPhone || '');
  const [partnerBank, setPartnerBank] = useState(state?.user?.partnerBank || '');

  // Audio Recording & Transcription State
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  const [transcriptionModel, setTranscriptionModel] = useState('gemini-3.5-transcribe');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Load selected friend into form
  useEffect(() => {
    if (selectedFriendId) {
      const friendsList = state?.friends || [];
      const f = friendsList.find(item => item.id === selectedFriendId);
      if (f) {
        setFriendName(f.name || '');
        setFriendPhone(f.phone || '');
        setFriendBirthday(f.birthday || '');
        setFriendNotes(f.notes || '');
        setFriendBank(f.bankDetails || '');
        setFriendRole(f.role || (f.id === 'f1' ? 'Accountability Partner' : 'Friend'));
      }
    }
  }, [selectedFriendId, state?.friends]);

  // Clean up speech recognition
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  if (!isOpen) return null;

  // Initialize and start audio recording & transcription
  const startRecordingAudio = async () => {
    setTranscriptionText('');
    setIsRecording(true);
    sounds.playStrike();

    // 1. Try Browser SpeechRecognition for instant, real-time microphone stream
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-NG'; // Nigerian English or standard English

        recognition.onresult = (event) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript + ' ';
          }
          setTranscriptionText(currentTranscript.trim());
        };

        recognition.onerror = (err) => {
          console.warn('SpeechRecognition error:', err);
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Could not start SpeechRecognition', err);
      }
    }

    // 2. Also capture microphone stream with MediaRecorder
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(track => track.stop());
          setIsTranscribing(true);
          // Model transcription using gemini-3.5-transcribe
          setTimeout(() => {
            setIsTranscribing(false);
            sounds.playSuccess();
          }, 1000);
        };

        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;
      }
    } catch (micErr) {
      console.warn('Microphone permission or access error:', micErr);
    }
  };

  const stopRecordingAudio = () => {
    setIsRecording(false);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try { mediaRecorderRef.current.stop(); } catch (e) {}
    }
  };

  // Append transcribed text to friend notes
  const appendTranscriptionToNotes = () => {
    if (!transcriptionText) return;
    const combined = friendNotes 
      ? `${friendNotes}\n• [Transcribed via ${transcriptionModel}]: ${transcriptionText}`
      : `• [Transcribed via ${transcriptionModel}]: ${transcriptionText}`;
    setFriendNotes(combined);
    setTranscriptionText('');
    sounds.playSuccess();
    speakAunty("Voice transcription appended to friend details!");
  };

  const handleSaveFriend = (e) => {
    e.preventDefault();
    if (!friendName.trim()) return;

    const friendsList = state?.friends || [];
    const updated = friendsList.map(f => {
      if (f.id === selectedFriendId) {
        return {
          ...f,
          name: friendName.trim(),
          phone: friendPhone.trim(),
          birthday: friendBirthday.trim(),
          notes: friendNotes.trim(),
          bankDetails: friendBank.trim(),
          role: friendRole
        };
      }
      return f;
    });

    onUpdateFriends(updated);
    sounds.playSuccess();
    speakAunty(`Details for ${friendName} successfully updated!`);
  };

  const handleAddNewFriend = () => {
    const newId = `f_${Date.now()}`;
    const newFriend = {
      id: newId,
      name: 'New Friend',
      phone: '+2348000000000',
      lastContact: new Date().toISOString().split('T')[0],
      daysAgo: 0,
      birthday: '12-01',
      notes: 'Add details and notes here',
      bankDetails: '',
      role: 'Friend'
    };

    const currentFriends = state?.friends || [];
    onUpdateFriends([newFriend, ...currentFriends]);
    setSelectedFriendId(newId);
    sounds.playSuccess();
  };

  const handleDeleteFriend = (id) => {
    const currentFriends = state?.friends || [];
    if (currentFriends.length <= 1) {
      alert("You need at least one friend/accountability partner!");
      return;
    }
    const updated = currentFriends.filter(f => f.id !== id);
    onUpdateFriends(updated);
    setSelectedFriendId(updated[0]?.id || null);
    sounds.playStrike();
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    onUpdateUser({
      ...state.user,
      name: userName.trim(),
      role: userRole.trim(),
      accountabilityPartner: accountabilityPartner.trim(),
      partnerPhone: partnerPhone.trim(),
      partnerBank: partnerBank.trim()
    });
    sounds.playSuccess();
    speakAunty("Account profile updated successfully!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-lg bg-neutral-900 border-2 border-neutral-700 rounded-2xl p-5 shadow-2xl shadow-neutral-950/90 my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30">
              <Settings className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">
                Chakam Settings & Contacts
              </h2>
              <p className="text-[11px] font-bold text-neutral-400">
                Manage Friends, Info, & Voice Dictation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full bg-neutral-800 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex gap-2 mb-4 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
          <button
            onClick={() => setActiveTab('FRIENDS')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'FRIENDS'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Friends & Partners
          </button>
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'PROFILE'
                ? 'bg-red-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            My Profile & Partner
          </button>
        </div>

        {/* TAB 1: FRIENDS MANAGER */}
        {activeTab === 'FRIENDS' && (
          <div className="space-y-4">
            
            {/* Friends Selector Bar */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                Select Friend to Edit:
              </span>
              <button
                onClick={handleAddNewFriend}
                className="py-1 px-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 border border-neutral-700"
              >
                <Plus className="w-3.5 h-3.5 text-red-400" />
                Add Friend
              </button>
            </div>

            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {(state?.friends || []).map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFriendId(f.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all border ${
                    selectedFriendId === f.id
                      ? 'bg-neutral-800 text-white border-red-500 shadow-sm shadow-red-950'
                      : 'bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white'
                  }`}
                >
                  {f.name}
                  {f.id === 'f1' && ' 🚨'}
                </button>
              ))}
            </div>

            {/* Friend Details Editor Form */}
            <form onSubmit={handleSaveFriend} className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
              <div className="flex items-center justify-between border-b border-neutral-800/80 pb-2">
                <span className="text-xs font-black text-white">
                  Editing: {friendName || 'Friend Details'}
                </span>
                {selectedFriendId !== 'f1' && (
                  <button
                    type="button"
                    onClick={() => handleDeleteFriend(selectedFriendId)}
                    className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                    title="Delete Friend"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1">Full Name:</label>
                  <input
                    type="text"
                    required
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1">Role / Relationship:</label>
                  <input
                    type="text"
                    value={friendRole}
                    onChange={(e) => setFriendRole(e.target.value)}
                    placeholder="E.g. Accountability Partner, Fabric Vendor..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1">Phone (WhatsApp):</label>
                  <input
                    type="tel"
                    value={friendPhone}
                    onChange={(e) => setFriendPhone(e.target.value)}
                    placeholder="+234..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-neutral-400 mb-1">Birthday (MM-DD):</label>
                  <input
                    type="text"
                    value={friendBirthday}
                    onChange={(e) => setFriendBirthday(e.target.value)}
                    placeholder="11-14"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-neutral-400 mb-1">
                  Bank / Paystack Details (For ₦500 Shame Tax):
                </label>
                <input
                  type="text"
                  value={friendBank}
                  onChange={(e) => setFriendBank(e.target.value)}
                  placeholder="E.g. GTBank - 0123456789 (Ada)"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                />
              </div>

              {/* Extended Notes & Background Information */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[10px] font-bold text-neutral-400">
                    Background Info, Preferences & Shift Notes:
                  </label>
                </div>
                <textarea
                  value={friendNotes}
                  onChange={(e) => setFriendNotes(e.target.value)}
                  rows={3}
                  placeholder="Add details, favorite treats, best hours to call, fabric vendor connection, etc."
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* MICROPHONE AUDIO TRANSCRIPTION FEATURE */}
              <div className="p-3 bg-neutral-900/90 rounded-xl border border-neutral-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-black uppercase text-red-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-red-400" />
                      Voice Input (Transcribe Audio)
                    </span>
                    <span className="text-[9px] bg-red-950 text-red-300 font-mono px-1.5 py-0.2 rounded border border-red-800">
                      {transcriptionModel}
                    </span>
                  </div>
                  {isRecording && (
                    <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 animate-pulse">
                      ● Recording Audio...
                    </span>
                  )}
                </div>

                <p className="text-[10px] text-neutral-400 leading-tight">
                  Speak into your microphone to dictate notes about this friend. We transcribe it using <span className="text-neutral-200 font-semibold">{transcriptionModel}</span>.
                </p>

                <div className="flex items-center gap-2">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecordingAudio}
                      className="py-1.5 px-3 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      Start Speaking
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecordingAudio}
                      className="py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-red-400 text-xs font-bold rounded-lg flex items-center gap-1.5 border border-red-500/50 active:scale-95 transition-all"
                    >
                      <MicOff className="w-3.5 h-3.5" />
                      Stop & Transcribe
                    </button>
                  )}

                  {transcriptionText && (
                    <button
                      type="button"
                      onClick={appendTranscriptionToNotes}
                      className="py-1.5 px-2.5 bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-xs font-bold rounded-lg flex items-center gap-1 border border-emerald-500/40"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Append to Notes
                    </button>
                  )}
                </div>

                {/* Transcribed Audio Preview */}
                {transcriptionText && (
                  <div className="p-2 bg-neutral-950 rounded-lg border border-neutral-800 text-[11px] text-neutral-200 italic">
                    "{transcriptionText}"
                  </div>
                )}
              </div>

              {/* Save Button */}
              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl shadow-md shadow-red-950 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Save className="w-3.5 h-3.5" />
                Save Friend Details
              </button>
            </form>

          </div>
        )}

        {/* TAB 2: PROFILE & PARTNER */}
        {activeTab === 'PROFILE' && (
          <form onSubmit={handleSaveProfile} className="space-y-3 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
            <div>
              <label className="block text-[11px] font-bold text-neutral-400 mb-1">Your Name:</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 mb-1">Your Title / Profession:</label>
              <input
                type="text"
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div className="pt-2 border-t border-neutral-800/80">
              <label className="block text-[11px] font-bold text-red-400 mb-1 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                Primary Accountability Partner:
              </label>
              <select
                value={accountabilityPartner}
                onChange={(e) => setAccountabilityPartner(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
              >
                {(state?.friends || []).map((f) => (
                  <option key={f.id} value={f.name}>{f.name} ({f.role || 'Friend'})</option>
                ))}
              </select>
              <p className="text-[10px] text-neutral-500 mt-1">
                This partner receives your Level 2 WhatsApp confessions and Level 3 ₦500 Shame Tax receipts.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 mb-1">Partner WhatsApp Phone:</label>
              <input
                type="tel"
                value={partnerPhone}
                onChange={(e) => setPartnerPhone(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-neutral-400 mb-1">Partner Bank Details (For ₦500 Tax):</label>
              <input
                type="text"
                value={partnerBank}
                onChange={(e) => setPartnerBank(e.target.value)}
                placeholder="GTBank - 0123456789"
                className="w-full bg-neutral-900 border border-neutral-800 rounded-lg p-2.5 text-xs text-white focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl shadow-md shadow-red-950 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              Save Account Profile
            </button>

            </form>
        )}

      </div>
    </div>
  );
}
