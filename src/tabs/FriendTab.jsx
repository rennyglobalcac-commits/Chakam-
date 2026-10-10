import React, { useState } from 'react';
import { 
  Users, Plus, MessageCircle, Phone, Calendar, Heart, 
  CheckCircle2, Clock, Sparkles, AlertCircle, Settings, Mic 
} from 'lucide-react';
import { sounds, speakAunty } from '../utils/audio';

export default function FriendTab({ state, onUpdateFriends, onOpenSettings }) {
  const { friends } = state;
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('11-20');
  const [notes, setNotes] = useState('');

  const handleMarkContacted = (friendId) => {
    sounds.playSuccess();
    const updated = friends.map(f => {
      if (f.id === friendId) {
        speakAunty(`Well done! You checked in with ${f.name}. Invest in genuine relationships!`);
        return {
          ...f,
          lastContact: new Date().toISOString().split('T')[0],
          daysAgo: 0
        };
      }
      return f;
    });
    onUpdateFriends(updated);
  };

  const handleAddFriend = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const newF = {
      id: `f_${Date.now()}`,
      name: name.trim(),
      phone: phone.trim() || '+2348000000000',
      lastContact: new Date().toISOString().split('T')[0],
      daysAgo: 0,
      birthday: birthday,
      notes: notes.trim() || 'Valued friend'
    };
    onUpdateFriends([newF, ...friends]);
    setName('');
    setPhone('');
    setNotes('');
    setShowAddModal(false);
    sounds.playSuccess();
  };

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* Friend Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-amber-950/60 via-neutral-900 to-neutral-950 border border-amber-800/40 p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Users className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-white">Friend & Social Circle</h2>
              <p className="text-[11px] text-amber-400 font-semibold">Accountability Partners & Cherished Bonds</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenSettings}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-300 hover:text-white border border-neutral-700 flex items-center gap-1 text-xs font-bold"
              title="Edit friend details and transcribe notes"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
              title="Add contact"
            >
              <Plus className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* Weekly Relationship Prompt Banner */}
        <div className="mt-3 p-3 bg-neutral-950 rounded-xl border border-amber-900/50 flex items-center gap-2.5">
          <Heart className="w-4 h-4 text-rose-400 shrink-0" />
          <p className="text-xs text-neutral-300 italic">
            "Did you invest in your relationships this week? Success is sweet when shared with true friends."
          </p>
        </div>
      </div>

      {/* PEOPLE LIST & CHECK-IN TRACKER */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <span>💬</span> Priority Check-Ins
          </h3>
          <span className="text-[10px] text-neutral-400 font-bold">{friends.length} People Tracked</span>
        </div>

        <div className="space-y-3">
          {friends.map((friend) => {
            const isOverdue = friend.daysAgo > 5;
            return (
              <div 
                key={friend.id} 
                className={`p-3.5 rounded-2xl border transition-all ${
                  isOverdue 
                    ? 'bg-neutral-950 border-amber-600/70 shadow-md shadow-amber-950/20' 
                    : 'bg-neutral-950 border-neutral-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      {friend.name}
                      {friend.id === 'f1' && (
                        <span className="text-[9px] bg-red-600/30 text-red-300 font-bold px-1.5 py-0.2 rounded border border-red-500/40">
                          Partner 🚨
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-neutral-400 mt-0.5">{friend.notes}</p>
                    <p className="text-[10px] font-mono text-neutral-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last contact: {friend.lastContact} ({friend.daysAgo} day{friend.daysAgo !== 1 ? 's' : ''} ago)
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                      isOverdue 
                        ? 'bg-red-500/10 text-red-400 border-red-500/30' 
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {isOverdue ? 'Overdue' : 'Connected'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-neutral-800/80">
                  <button
                    onClick={() => handleMarkContacted(friend.id)}
                    className="flex-1 py-1.5 px-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Mark Done
                  </button>

                  <a
                    href={`https://wa.me/${friend.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent("Hey love! Just checking in on you. Hope your day is going great! ❤️")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    WhatsApp
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BIRTHDAY TRACKER CARD */}
      <div className="rounded-2xl bg-neutral-900 border border-neutral-800 p-4">
        <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5 mb-3">
          <span>🎂</span> Upcoming Birthdays & Milestones
        </h3>
        <div className="space-y-2">
          {friends.map((friend) => (
            <div key={friend.id} className="p-2.5 bg-neutral-950 rounded-xl border border-neutral-800/80 flex items-center justify-between text-xs">
              <span className="font-bold text-neutral-200">{friend.name}</span>
              <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                {friend.birthday}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ADD FRIEND MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-black text-white mb-3">Add Friend / Partner</h3>
            <form onSubmit={handleAddFriend} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Name (e.g. Ada, Chidinma)..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
              <input
                type="tel"
                placeholder="Phone (e.g. +2348012345678)..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              />
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Birthday (MM-DD):</label>
                <input
                  type="text"
                  placeholder="MM-DD (e.g. 11-14)..."
                  value={birthday}
                  onChange={(e) => setBirthday(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white focus:outline-none"
                />
              </div>
              <textarea
                placeholder="Relationship note..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white focus:outline-none"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-black rounded-xl"
                >
                  Save Friend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
