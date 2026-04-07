
"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, Check, X, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface Memo {
  timestamp: string;
  datetime: string;
  category: string;
  content: string;
  color: string;
}

const COLORS = [
  { name: "Yellow", bg: "#FEF3C7", text: "#92400E" },
  { name: "Green", bg: "#DCFCE7", text: "#166534" },
  { name: "Blue", bg: "#DBEAFE", text: "#1E40AF" },
  { name: "Pink", bg: "#FCE7F3", text: "#9D174D" },
  { name: "Purple", bg: "#F3E8FF", text: "#6B21A8" },
];

const CATEGORIES = ["Work", "Personal", "Study", "Important", "Idea"];

export default function MemoBoard() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // New/Edit Memo State
  const [formData, setFormData] = useState<Memo>({
    timestamp: "",
    datetime: "",
    category: "Personal",
    content: "",
    color: COLORS[0].bg,
  });

  // Fetch Memos
  useEffect(() => {
    // 1. Load from localStorage first (Optional - for instant display)
    const cached = localStorage.getItem("memos_cache");
    if (cached) {
      setMemos(JSON.parse(cached));
      setLoading(false);
    }
    
    fetchMemos();
  }, []);

  const fetchMemos = async () => {
    try {
      const res = await fetch("/api/memos");
      if (res.ok) {
        const data = await res.json();
        setMemos(data);
        // Update cache
        localStorage.setItem("memos_cache", JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.content.trim()) return;

    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/memos/${editingId}` : "/api/memos";
    
    const now = new Date();
    const memoData = {
      ...formData,
      timestamp: editingId || Date.now().toString(),
      datetime: editingId ? formData.datetime : format(now, "yyyy-MM-dd HH:mm:ss"),
    };

    // Optimistic Update: Save to local storage first
    let updatedMemos = [...memos];
    if (editingId) {
      updatedMemos = memos.map(m => m.timestamp === editingId ? memoData : m);
    } else {
      updatedMemos = [memoData, ...memos];
    }
    setMemos(updatedMemos);
    localStorage.setItem("memos_cache", JSON.stringify(updatedMemos));

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(memoData),
      });

      if (res.ok) {
        setIsAdding(false);
        setEditingId(null);
        setFormData({
          timestamp: "",
          datetime: "",
          category: "Personal",
          content: "",
          color: COLORS[0].bg,
        });
        // Sync with cloud again to be sure
        fetchMemos();
      }
    } catch (err) {
      console.error("Cloud save failed:", err);
      alert("Failed to sync with Google Sheet. Changes are saved locally for now.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this memo?")) return;

    // Optimistic Delete
    const updatedMemos = memos.filter(m => m.timestamp !== id);
    setMemos(updatedMemos);
    localStorage.setItem("memos_cache", JSON.stringify(updatedMemos));

    try {
      const res = await fetch(`/api/memos/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchMemos();
      }
    } catch (err) {
      console.error("Cloud delete failed:", err);
      alert("Failed to delete from Google Sheet. Please check your connection.");
    }
  };

  const startEdit = (memo: Memo) => {
    setEditingId(memo.timestamp);
    setFormData(memo);
    setIsAdding(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-12 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Memo Board</h1>
          <p className="text-slate-500 mt-2">Sync with Google Sheets in real-time.</p>
        </div>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({
              timestamp: "",
              datetime: "",
              category: "Personal",
              content: "",
              color: COLORS[0].bg,
            });
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>New Memo</span>
        </button>
      </header>

      <main className="max-w-6xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={40} />
            <p>Loading memos from Google Sheet...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {memos.map((memo) => (
                <motion.div
                  key={memo.timestamp}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="relative group p-6 rounded-3xl shadow-sm border border-black/5 flex flex-col justify-between min-h-[220px]"
                  style={{ backgroundColor: memo.color }}
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[10px] uppercase tracking-wider font-bold opacity-60">
                        {memo.category}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEdit(memo)}
                          className="p-2 hover:bg-black/5 rounded-full transition-colors"
                        >
                          <Edit2 size={14} className="text-black/60" />
                        </button>
                        <button
                          onClick={() => handleDelete(memo.timestamp)}
                          className="p-2 hover:bg-red-500/10 rounded-full transition-colors"
                        >
                          <Trash2 size={14} className="text-red-500/60" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-800 leading-relaxed font-medium whitespace-pre-wrap">
                      {memo.content}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-black/5">
                    <p className="text-[11px] font-semibold opacity-40">{memo.datetime}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      {/* Modal for Adding/Editing */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">
                  {editingId ? "Edit Memo" : "Create Memo"}
                </h2>

                <div className="space-y-6">
                  {/* Category Selection */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setFormData({ ...formData, category: cat })}
                          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                            formData.category === cat
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Color</label>
                    <div className="flex gap-3">
                      {COLORS.map((color) => (
                        <button
                          key={color.bg}
                          onClick={() => setFormData({ ...formData, color: color.bg })}
                          className={`w-10 h-10 rounded-2xl transition-all flex items-center justify-center border-2 ${
                            formData.color === color.bg ? "border-slate-800 scale-110" : "border-transparent"
                          }`}
                          style={{ backgroundColor: color.bg }}
                        >
                          {formData.color === color.bg && <Check size={16} className="text-slate-800" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase mb-3 block">Content</label>
                    <textarea
                      autoFocus
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full h-32 p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 text-slate-800 resize-none font-medium"
                      placeholder="Write your memo here..."
                    />
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setIsAdding(false)}
                    className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-colors disabled:opacity-50"
                    disabled={!formData.content.trim()}
                  >
                    {editingId ? "Update Memo" : "Create Memo"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
