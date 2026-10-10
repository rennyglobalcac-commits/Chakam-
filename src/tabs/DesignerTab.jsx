import React, { useState } from 'react';
import { 
  Scissors, Plus, Camera, Sparkles, CheckCircle2, Ruler, 
  Lightbulb, ChevronRight, Calendar, UserCheck, Trash2 
} from 'lucide-react';
import { sounds, speakAunty } from '../utils/audio';

export default function DesignerTab({ state, onUpdateDesigner }) {
  const designer = state.designer || {
    projects: [],
    measurements: [],
    ideas: []
  };
  const [activeSubTab, setActiveSubTab] = useState('PROJECTS'); // 'PROJECTS' | 'MEASUREMENTS' | 'IDEAS'
  
  // New Project modal state
  const [showAddProject, setShowAddProject] = useState(false);
  const [projName, setProjName] = useState('');
  const [projClient, setProjClient] = useState('');
  const [projFabric, setProjFabric] = useState('');
  const [projDeadline, setProjDeadline] = useState('2026-10-25');

  // New Measurement modal state
  const [showAddMeasure, setShowAddMeasure] = useState(false);
  const [mName, setMName] = useState('');
  const [mBust, setMBust] = useState(36);
  const [mWaist, setMWaist] = useState(28);
  const [mHips, setMHips] = useState(40);
  const [mShoulder, setMShoulder] = useState(15);
  const [mLength, setMLength] = useState(55);

  // New Idea modal state
  const [showAddIdea, setShowAddIdea] = useState(false);
  const [ideaTitle, setIdeaTitle] = useState('');
  const [ideaCategory, setIdeaCategory] = useState('Ready-To-Wear');

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!projName.trim()) return;
    const newP = {
      id: `dp_${Date.now()}`,
      name: projName.trim(),
      client: projClient.trim() || 'Custom Order',
      deadline: projDeadline,
      progress: 10,
      status: 'Cutting & Prep',
      fabric: projFabric.trim() || 'African Wax Cotton'
    };
    onUpdateDesigner({
      ...designer,
      projects: [newP, ...(designer.projects || [])]
    });
    setProjName('');
    setProjClient('');
    setProjFabric('');
    setShowAddProject(false);
    sounds.playSuccess();
  };

  const handleDeleteProject = (id) => {
    onUpdateDesigner({
      ...designer,
      projects: (designer.projects || []).filter(p => p.id !== id)
    });
    sounds.playSuccess();
  };

  const handleAddMeasurement = (e) => {
    e.preventDefault();
    if (!mName.trim()) return;
    const newM = {
      id: `m_${Date.now()}`,
      clientName: mName.trim(),
      date: new Date().toISOString().split('T')[0],
      bust: Number(mBust),
      waist: Number(mWaist),
      hips: Number(mHips),
      shoulder: Number(mShoulder),
      sleeve: 22,
      dressLength: Number(mLength),
      notes: 'Custom fit record'
    };
    onUpdateDesigner({
      ...designer,
      measurements: [newM, ...(designer.measurements || [])]
    });
    setMName('');
    setShowAddMeasure(false);
    sounds.playSuccess();
  };

  const handleDeleteMeasurement = (id) => {
    onUpdateDesigner({
      ...designer,
      measurements: (designer.measurements || []).filter(m => m.id !== id)
    });
    sounds.playSuccess();
  };

  const handleAddIdea = (e) => {
    e.preventDefault();
    if (!ideaTitle.trim()) return;
    const newI = {
      id: `di_${Date.now()}`,
      title: ideaTitle.trim(),
      category: ideaCategory,
      date: new Date().toISOString().split('T')[0]
    };
    onUpdateDesigner({
      ...designer,
      ideas: [newI, ...(designer.ideas || [])]
    });
    setIdeaTitle('');
    setShowAddIdea(false);
    sounds.playSuccess();
  };

  const handleDeleteIdea = (id) => {
    onUpdateDesigner({
      ...designer,
      ideas: (designer.ideas || []).filter(i => i.id !== id)
    });
    sounds.playSuccess();
  };

  const handleIncrementProgress = (projId) => {
    const updated = (designer.projects || []).map(p => {
      if (p.id === projId) {
        const nextProgress = Math.min(100, p.progress + 15);
        if (nextProgress === 100) {
          sounds.playSuccess();
          speakAunty(`Congratulations! ${p.name} is finished! Gorgeous craftsmanship!`);
        } else {
          sounds.playSuccess();
        }
        return { 
          ...p, 
          progress: nextProgress,
          status: nextProgress === 100 ? 'Completed' : nextProgress >= 70 ? 'Fitting & Finishing' : 'Assembly & Stitching'
        };
      }
      return p;
    });
    onUpdateDesigner({ ...designer, projects: updated });
  };

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto px-4 pt-3">
      {/* Designer Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-rose-950/60 via-neutral-900 to-neutral-950 border border-rose-800/40 p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <Scissors className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-black text-white">Fashion Atelier & Studio</h2>
              <p className="text-[11px] text-rose-400 font-semibold">Couture, Bespoke Tailoring & Pattern Drafting</p>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex gap-1.5 mt-3 pt-3 border-t border-rose-900/40">
          {[
            { id: 'PROJECTS', label: 'Sewing Board', icon: Scissors },
            { id: 'MEASUREMENTS', label: 'Measurements', icon: Ruler },
            { id: 'IDEAS', label: 'Ideas & Sketches', icon: Lightbulb }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all border ${
                activeSubTab === tab.id
                  ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950'
                  : 'bg-neutral-950/80 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* SUB-TAB 1: SEWING PROJECTS BOARD */}
      {activeSubTab === 'PROJECTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>🪡</span> Active Garment Projects ({(designer.projects || []).length})
            </h3>
            <button
              onClick={() => setShowAddProject(true)}
              className="text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Project
            </button>
          </div>

          {(!designer.projects || designer.projects.length === 0) ? (
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-dashed border-neutral-800 text-center">
              <Scissors className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-xs text-neutral-400 font-bold">No sewing projects added yet.</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Track garments from pattern drafting to final fitting.</p>
              <button
                onClick={() => setShowAddProject(true)}
                className="mt-3 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl hover:bg-rose-500/20 active:scale-95"
              >
                + Add First Project
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {designer.projects.map((proj) => (
                <div key={proj.id} className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white">{proj.name}</h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Client: <span className="text-neutral-200 font-semibold">{proj.client}</span>
                      </p>
                      <p className="text-[10px] text-rose-300 font-medium">Fabric: {proj.fabric}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono text-neutral-500 bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                        Due: {proj.deadline}
                      </span>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="p-1 text-neutral-500 hover:text-red-400 active:scale-90"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex justify-between text-[11px] mb-1 font-semibold">
                      <span className="text-neutral-400">Garment Progress:</span>
                      <span className="text-rose-400 font-bold">{proj.progress}%</span>
                    </div>
                    <div className="w-full bg-neutral-950 h-2 rounded-full overflow-hidden border border-neutral-800">
                      <div 
                        className="bg-gradient-to-r from-rose-600 to-rose-400 h-full rounded-full transition-all duration-300"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-[10px] bg-neutral-950 text-neutral-400 px-2 py-1 rounded-lg border border-neutral-800">
                      {proj.status}
                    </span>
                    <button
                      onClick={() => handleIncrementProgress(proj.id)}
                      className="py-1 px-3 bg-neutral-800 hover:bg-rose-950 text-rose-300 hover:text-white rounded-lg border border-neutral-700 hover:border-rose-600 text-[11px] font-bold active:scale-95 transition-all"
                    >
                      +15% Cut / Sew Done
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: MEASUREMENTS VAULT */}
      {activeSubTab === 'MEASUREMENTS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>📏</span> Client Measurements ({(designer.measurements || []).length})
            </h3>
            <button
              onClick={() => setShowAddMeasure(true)}
              className="text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Client
            </button>
          </div>

          {(!designer.measurements || designer.measurements.length === 0) ? (
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-dashed border-neutral-800 text-center">
              <Ruler className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-xs text-neutral-400 font-bold">No measurements recorded yet.</p>
              <p className="text-[11px] text-neutral-500 mt-0.5">Store client bust, waist, hips, and length dimensions.</p>
              <button
                onClick={() => setShowAddMeasure(true)}
                className="mt-3 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl hover:bg-rose-500/20 active:scale-95"
              >
                + Add First Measurement
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {designer.measurements.map((m) => (
                <div key={m.id} className="p-4 bg-neutral-900 rounded-2xl border border-neutral-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-rose-400" />
                      <h4 className="text-xs font-bold text-white">{m.clientName}</h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-neutral-500 font-mono">{m.date}</span>
                      <button
                        onClick={() => handleDeleteMeasurement(m.id)}
                        className="p-1 text-neutral-500 hover:text-red-400 active:scale-90"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 bg-neutral-950 p-2.5 rounded-xl border border-neutral-800 text-[11px]">
                    <div><span className="text-neutral-500">Bust:</span> <strong className="text-white">{m.bust}"</strong></div>
                    <div><span className="text-neutral-500">Waist:</span> <strong className="text-white">{m.waist}"</strong></div>
                    <div><span className="text-neutral-500">Hips:</span> <strong className="text-white">{m.hips}"</strong></div>
                    <div><span className="text-neutral-500">Shoulder:</span> <strong className="text-white">{m.shoulder}"</strong></div>
                    <div><span className="text-neutral-500">Sleeve:</span> <strong className="text-white">{m.sleeve}"</strong></div>
                    <div><span className="text-neutral-500">Length:</span> <strong className="text-white">{m.dressLength}"</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: IDEAS */}
      {activeSubTab === 'IDEAS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>💡</span> Design Ideas ({(designer.ideas || []).length})
            </h3>
            <button
              onClick={() => setShowAddIdea(true)}
              className="text-[11px] font-bold bg-rose-600 hover:bg-rose-500 text-white px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1 active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Idea
            </button>
          </div>

          {(!designer.ideas || designer.ideas.length === 0) ? (
            <div className="p-6 rounded-2xl bg-neutral-900/60 border border-dashed border-neutral-800 text-center">
              <Lightbulb className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-xs text-neutral-400 font-bold">No design sketches or ideas logged.</p>
              <button
                onClick={() => setShowAddIdea(true)}
                className="mt-3 text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-3 py-1.5 rounded-xl hover:bg-rose-500/20 active:scale-95"
              >
                + Add First Idea
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {designer.ideas.map((idea) => (
                <div key={idea.id} className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">{idea.title}</div>
                    <div className="text-[10px] text-neutral-400">{idea.category} • {idea.date}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteIdea(idea.id)}
                    className="p-1 text-neutral-500 hover:text-red-400 active:scale-90"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Add Project */}
      {showAddProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-black text-white mb-3">Add Garment Project</h3>
            <form onSubmit={handleAddProject} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Project Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Emerald Corset Ballgown"
                  value={projName}
                  onChange={(e) => setProjName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Client Name:</label>
                <input
                  type="text"
                  placeholder="e.g. Sister Ngozi, Self"
                  value={projClient}
                  onChange={(e) => setProjClient(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Fabric & Materials:</label>
                <input
                  type="text"
                  placeholder="e.g. Mikado Silk & Crystal Applique"
                  value={projFabric}
                  onChange={(e) => setProjFabric(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Due Deadline:</label>
                <input
                  type="date"
                  value={projDeadline}
                  onChange={(e) => setProjDeadline(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddProject(false)}
                  className="flex-1 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Measurement */}
      {showAddMeasure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-black text-white mb-3">Add Client Measurements</h3>
            <form onSubmit={handleAddMeasurement} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-neutral-400 mb-1">Client Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chioma K."
                  value={mName}
                  onChange={(e) => setMName(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-neutral-400">Bust (inches):</label>
                  <input
                    type="number"
                    value={mBust}
                    onChange={(e) => setMBust(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400">Waist (inches):</label>
                  <input
                    type="number"
                    value={mWaist}
                    onChange={(e) => setMWaist(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400">Hips (inches):</label>
                  <input
                    type="number"
                    value={mHips}
                    onChange={(e) => setMHips(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-neutral-400">Dress Length:</label>
                  <input
                    type="number"
                    value={mLength}
                    onChange={(e) => setMLength(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddMeasure(false)}
                  className="flex-1 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Idea */}
      {showAddIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-neutral-900 border border-neutral-700 rounded-2xl p-5 shadow-2xl">
            <h3 className="text-sm font-black text-white mb-3">Capture Fashion Idea</h3>
            <form onSubmit={handleAddIdea} className="space-y-3">
              <textarea
                required
                placeholder="Sketch concept, neckline style, embellishment..."
                value={ideaTitle}
                onChange={(e) => setIdeaTitle(e.target.value)}
                rows={3}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-rose-500"
              />
              <input
                type="text"
                placeholder="Category (e.g. Evening Wear, Bridal, Ready-to-Wear)..."
                value={ideaCategory}
                onChange={(e) => setIdeaCategory(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddIdea(false)}
                  className="flex-1 py-2 bg-neutral-800 text-neutral-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl"
                >
                  Save Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
