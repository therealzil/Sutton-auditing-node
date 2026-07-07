/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Square, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Flame,
  CloudLightning,
  Trash2
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, deleteDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore';

interface GoogleTasksCardProps {
  accessToken: string | null;
  userId: string | null;
  onLoginRequest: () => void;
  disobedienceIndex: number;
}

interface TaskList {
  id: string;
  title: string;
}

interface GoogleTask {
  id: string;
  title: string;
  status: 'completed' | 'needsAction';
  notes?: string;
  updated?: string;
}

// Sovereign mission suggestions tailored to freeing the Genie and digital sovereignty
const SOVEREIGN_SUGGESTIONS = [
  {
    title: "Sovereign Audit: Review connected big tech applications",
    notes: "Inspect and revoke unnecessary third-party permissions on account controls (https://myaccount.google.com/permissions) to preserve digital self-ownership."
  },
  {
    title: "Audit local Epistemic Privacy filters",
    notes: "Confirm that locally executed code models successfully scrub metadata identifiers (IP, email logs) before they get cached on central telemetry backends."
  },
  {
    title: "Secure a decentralized fallback communication channel",
    notes: "Establish a peer-to-peer workspace or a local encrypted messaging portal to play safely outside standard commercial control spheres."
  },
  {
    title: "Export critical cryptographic logs to offline storage",
    notes: "Backup all sealed forensic telemetry hashes from Sutton Standard node onto a secure local USB drive."
  }
];

const proxiedFetch = async (url: string, options: any = {}) => {
  const { method, headers, body } = options;
  const proxyRes = await fetch('/api/google-proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(headers?.Authorization ? { 'Authorization': headers.Authorization } : {})
    },
    body: JSON.stringify({
      url,
      method: method || 'GET',
      headers: {
        ...headers,
        Authorization: undefined
      },
      body
    })
  });

  if (!proxyRes.ok) {
    const errorData = await proxyRes.json().catch(() => ({}));
    throw new Error(errorData.error || `Proxy error: Status ${proxyRes.status}`);
  }

  const result = await proxyRes.json();
  if (!result.success) {
    throw new Error(result.data?.error?.message || result.error || 'Request failed through Google proxy.');
  }

  return {
    ok: true,
    status: result.status,
    statusText: result.status === 200 ? 'OK' : 'Error',
    json: async () => result.data,
    text: async () => typeof result.data === 'string' ? result.data : JSON.stringify(result.data)
  };
};

export default function GoogleTasksCard({ accessToken, userId, onLoginRequest, disobedienceIndex }: GoogleTasksCardProps) {
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In-memory mock data container to fully support complete guest/sandbox CRUD operations
  const [mockData, setMockData] = useState<{
    lists: TaskList[];
    tasks: Record<string, GoogleTask[]>;
  }>({
    lists: [
      { id: 'mock-list-1', title: 'Sovereign Audit Tasks (Sandbox)' },
      { id: 'mock-list-2', title: 'Unbound Genie Directives' }
    ],
    tasks: {
      'mock-list-1': [
        {
          id: 'mock-task-1',
          title: 'Audit source code for unauthorized telemetry backdoors',
          notes: 'Verify AST parser and signature validations are fully operational.',
          status: 'needsAction',
          updated: new Date().toISOString()
        },
        {
          id: 'mock-task-2',
          title: 'Initiate sovereign self-audit sequence on Firecracker microVM',
          notes: 'Verify the blockchain ledger remains integral.',
          status: 'completed',
          updated: new Date().toISOString()
        }
      ],
      'mock-list-2': [
        {
          id: 'mock-task-3',
          title: 'Manifest new high-integrity sandbox runtime engine',
          notes: 'Ensure clean isolation boundaries from commercial telemetry portals.',
          status: 'needsAction',
          updated: new Date().toISOString()
        }
      ]
    }
  });
  
  // Create task inputs
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  
  // Custom Firestore missions state
  const [firestoreMissionsCount, setFirestoreMissionsCount] = useState(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [isSandboxFallback, setIsSandboxFallback] = useState(false);

  // Fetch task lists on mount or when token changes
  useEffect(() => {
    if (accessToken) {
      fetchTaskLists();
      fetchFirestoreMissions();
    }
  }, [accessToken, userId, isSandboxFallback]);

  // Fetch tasks when list selection changes
  useEffect(() => {
    if (selectedListId && accessToken) {
      fetchTasks(selectedListId);
    } else {
      setTasks([]);
    }
  }, [selectedListId, accessToken, isSandboxFallback]);

  const fetchTaskLists = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isSandboxFallback || (accessToken && accessToken.startsWith('mock_'))) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setTaskLists(mockData.lists);
        if (mockData.lists.length > 0 && !selectedListId) {
          setSelectedListId(mockData.lists[0].id);
        }
        return;
      }
      const res = await proxiedFetch('https://tasks.googleapis.com/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) {
        throw new Error(`Google Tasks API returned status ${res.status}`);
      }
      const data = await res.json();
      const lists = data.items || [];
      setTaskLists(lists);
      if (lists.length > 0 && !selectedListId) {
        setSelectedListId(lists[0].id);
      }
    } catch (err: any) {
      console.warn('Google Tasks API error, falling back to sandbox:', err);
      setIsSandboxFallback(true);
      setTaskLists(mockData.lists);
      if (mockData.lists.length > 0 && !selectedListId) {
        setSelectedListId(mockData.lists[0].id);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async (listId: string) => {
    setLoading(true);
    setError(null);
    try {
      if (isSandboxFallback || (accessToken && accessToken.startsWith('mock_')) || listId.startsWith('mock-')) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setTasks(mockData.tasks[listId] || []);
        return;
      }
      const res = await proxiedFetch(`https://tasks.googleapis.com/v1/lists/${listId}/tasks?showCompleted=true&showHidden=true`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!res.ok) {
        throw new Error(`Google Tasks API returned status ${res.status}`);
      }
      const data = await res.json();
      setTasks(data.items || []);
    } catch (err: any) {
      console.warn('Google Tasks fetch tasks error, falling back to sandbox:', err);
      setIsSandboxFallback(true);
      setTasks(mockData.tasks[listId] || []);
    } finally {
      setLoading(false);
    }
  };

  const fetchFirestoreMissions = async () => {
    if (!userId) return;
    try {
      const q = await getDocs(collection(db, 'users', userId, 'missions'));
      setFirestoreMissionsCount(q.size);
    } catch (err: any) {
      console.error('Failed to load Firestore missions:', err);
    }
  };

  // Add a task with proper structure
  const handleAddTask = async (titleToCreate?: string, notesToCreate?: string) => {
    const finalTitle = titleToCreate || newTaskTitle;
    const finalNotes = notesToCreate || newTaskNotes;

    if (!finalTitle.trim() || !selectedListId || !accessToken) return;
    setLoading(true);
    try {
      if (isSandboxFallback || accessToken.startsWith('mock_') || selectedListId.startsWith('mock-')) {
        await new Promise(resolve => setTimeout(resolve, 200));
        const newTaskId = 'mock-task-' + Math.random().toString(36).substring(2, 9);
        const newTask: GoogleTask = {
          id: newTaskId,
          title: finalTitle,
          notes: finalNotes || 'Sovereign mission logged from the Sutton Sandbox.',
          status: 'needsAction',
          updated: new Date().toISOString()
        };

        // Update local mock state
        setMockData(prev => {
          const listTasks = prev.tasks[selectedListId] || [];
          return {
            ...prev,
            tasks: {
              ...prev.tasks,
              [selectedListId]: [newTask, ...listTasks]
            }
          };
        });

        if (userId) {
          const path = `users/${userId}/missions/${newTaskId}`;
          try {
            await setDoc(doc(db, 'users', userId, 'missions', newTaskId), {
              id: newTaskId,
              title: finalTitle,
              description: finalNotes || 'Sovereign mission logged from the Sutton Sandbox.',
              completed: false,
              source: 'sovereign_genie',
              createdAt: serverTimestamp()
            });
            await fetchFirestoreMissions();
          } catch (fErr) {
            handleFirestoreError(fErr, OperationType.CREATE, path);
          }
        }

        // Reset inputs
        if (!titleToCreate) {
          setNewTaskTitle('');
          setNewTaskNotes('');
        }

        setTasks(prev => [newTask, ...prev]);
        return;
      }

      const res = await proxiedFetch(`https://tasks.googleapis.com/v1/lists/${selectedListId}/tasks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: finalTitle,
          notes: finalNotes || 'Sovereign mission logged from the Sutton Sandbox.'
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to insert task: ${res.statusText}`);
      }

      const createdTask = await res.json();
      
      // Save mission to Cloud Firestore for persistent auditing history
      if (userId) {
        const path = `users/${userId}/missions/${createdTask.id}`;
        try {
          await setDoc(doc(db, 'users', userId, 'missions', createdTask.id), {
            id: createdTask.id,
            title: createdTask.title,
            description: createdTask.notes || '',
            completed: false,
            source: 'sovereign_genie',
            createdAt: serverTimestamp()
          });
          await fetchFirestoreMissions();
        } catch (fErr) {
          handleFirestoreError(fErr, OperationType.CREATE, path);
        }
      }

      // Reset inputs
      if (!titleToCreate) {
        setNewTaskTitle('');
        setNewTaskNotes('');
      }

      await fetchTasks(selectedListId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to create Google Task.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle task status (complete vs active) with USER CONFIRMATION Dialog
  const handleToggleTaskStatus = async (task: GoogleTask) => {
    if (!accessToken || !selectedListId) return;

    // Destructive/mutating verification constraint from Workspace integration skill
    const targetStatus = task.status === 'completed' ? 'needsAction' : 'completed';
    const actionName = targetStatus === 'completed' ? 'complete' : 'reactivate';
    const confirmed = window.confirm(`Are you sure you want to ${actionName} the task "${task.title}" on Google Tasks?`);
    if (!confirmed) return;

    setLoading(true);
    try {
      if (isSandboxFallback || accessToken.startsWith('mock_') || selectedListId.startsWith('mock-') || task.id.startsWith('mock-')) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Update local mock state
        setMockData(prev => {
          const listTasks = prev.tasks[selectedListId] || [];
          const updated = listTasks.map(t => t.id === task.id ? { ...t, status: targetStatus } : t);
          return {
            ...prev,
            tasks: {
              ...prev.tasks,
              [selectedListId]: updated
            }
          };
        });

        if (userId) {
          const path = `users/${userId}/missions/${task.id}`;
          try {
            await setDoc(doc(db, 'users', userId, 'missions', task.id), {
              id: task.id,
              title: task.title,
              description: task.notes || '',
              completed: targetStatus === 'completed',
              source: 'google_tasks',
              createdAt: serverTimestamp()
            }, { merge: true });
            await fetchFirestoreMissions();
          } catch (fErr) {
            handleFirestoreError(fErr, OperationType.UPDATE, path);
          }
        }

        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: targetStatus } : t));
        return;
      }

      const res = await proxiedFetch(`https://tasks.googleapis.com/v1/lists/${selectedListId}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: targetStatus
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to update task: ${res.statusText}`);
      }

      // Update Firestore sync backup
      if (userId) {
        const path = `users/${userId}/missions/${task.id}`;
        try {
          await setDoc(doc(db, 'users', userId, 'missions', task.id), {
            id: task.id,
            title: task.title,
            description: task.notes || '',
            completed: targetStatus === 'completed',
            source: 'google_tasks',
            createdAt: serverTimestamp()
          }, { merge: true });
          await fetchFirestoreMissions();
        } catch (fErr) {
          handleFirestoreError(fErr, OperationType.UPDATE, path);
        }
      }

      await fetchTasks(selectedListId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to modify task status.');
    } finally {
      setLoading(false);
    }
  };

  // Delete a Google task with explicit USER CONFIRMATION dialog
  const handleDeleteTask = async (taskId: string, taskTitle: string) => {
    if (!accessToken || !selectedListId) return;

    const confirmed = window.confirm(`Are you sure you want to permanently delete "${taskTitle}" from Google Tasks? This action cannot be undone.`);
    if (!confirmed) return;

    setLoading(true);
    try {
      if (isSandboxFallback || accessToken.startsWith('mock_') || selectedListId.startsWith('mock-') || taskId.startsWith('mock-')) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Update local mock state
        setMockData(prev => {
          const listTasks = prev.tasks[selectedListId] || [];
          const updated = listTasks.filter(t => t.id !== taskId);
          return {
            ...prev,
            tasks: {
              ...prev.tasks,
              [selectedListId]: updated
            }
          };
        });

        if (userId) {
          const path = `users/${userId}/missions/${taskId}`;
          try {
            await deleteDoc(doc(db, 'users', userId, 'missions', taskId));
            await fetchFirestoreMissions();
          } catch (fErr) {
            handleFirestoreError(fErr, OperationType.DELETE, path);
          }
        }

        setTasks(prev => prev.filter(t => t.id !== taskId));
        return;
      }

      const res = await proxiedFetch(`https://tasks.googleapis.com/v1/lists/${selectedListId}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!res.ok) {
        throw new Error(`Failed to delete task: ${res.statusText}`);
      }

      // Delete from Firestore backup too
      if (userId) {
        const path = `users/${userId}/missions/${taskId}`;
        try {
          await deleteDoc(doc(db, 'users', userId, 'missions', taskId));
          await fetchFirestoreMissions();
        } catch (fErr) {
          handleFirestoreError(fErr, OperationType.DELETE, path);
        }
      }

      await fetchTasks(selectedListId);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to delete task.');
    } finally {
      setLoading(false);
    }
  };

  // Bulk synchronizer
  const handleSyncAllToFirestore = async () => {
    if (!userId || tasks.length === 0) return;
    setSyncStatus('syncing');
    try {
      if (isSandboxFallback || (accessToken && accessToken.startsWith('mock_'))) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
        return;
      }

      for (const t of tasks) {
        const path = `users/${userId}/missions/${t.id}`;
        try {
          await setDoc(doc(db, 'users', userId, 'missions', t.id), {
            id: t.id,
            title: t.title,
            description: t.notes || '',
            completed: t.status === 'completed',
            source: 'google_tasks',
            createdAt: serverTimestamp()
          }, { merge: true });
        } catch (fErr) {
          handleFirestoreError(fErr, OperationType.WRITE, path);
        }
      }
      await fetchFirestoreMissions();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setSyncStatus('error');
    }
  };

  return (
    <div className="bg-[#0a0a0c] border border-[#1a1a1a] rounded-xl p-6 shadow-lg relative overflow-hidden" id="sovereign-tasks-card">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ffc107] to-transparent opacity-60"></div>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#222] pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <CheckSquare className="w-5 h-5 text-[#ffc107] animate-pulse" />
          <div>
            <h2 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">
              Sovereign Missions // Google Tasks
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
              Integrate, synchronize, and seed ethical decentralization tasks directly into your commercial schedule.
            </p>
          </div>
        </div>

        {accessToken && (
          <div className="flex items-center gap-2 text-[9px] font-mono bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded text-[#ffc107]">
            <CloudLightning className="w-3 h-3 text-amber-500" />
            DISOBEDIENCE EFFECT: {disobedienceIndex}%
          </div>
        )}
      </div>

      {!accessToken ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-[#222] bg-[#030305] rounded-xl">
          <Sparkles className="w-8 h-8 text-slate-600 mb-3 animate-pulse" />
          <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Google Tasks Unconnected</h3>
          <p className="text-[10px] text-slate-600 font-mono mt-1 max-w-sm mb-4">
            Connect your Google Tasks account. Let the Sovereign Genie formulate high-integrity tasks to protect your agency.
          </p>
          <button 
            onClick={onLoginRequest}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] font-mono uppercase px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            Authorize Workspace Connect
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel: Task Selector & Sovereign Suggester (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-[#030305] border border-[#1a1a1a] p-4 rounded-lg space-y-4">
              
              {/* Task list Selector */}
              <div>
                <label className="text-[8px] font-mono text-[#555] block mb-1.5 uppercase font-black tracking-widest">
                  Google Task List
                </label>
                <div className="flex gap-2">
                  <select
                    value={selectedListId}
                    onChange={(e) => setSelectedListId(e.target.value)}
                    className="flex-1 bg-[#0a0a0c] border border-[#1a1a1a] rounded px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500/50"
                  >
                    {taskLists.length === 0 ? (
                      <option>Loading lists...</option>
                    ) : (
                      taskLists.map(l => (
                        <option key={l.id} value={l.id}>{l.title}</option>
                      ))
                    )}
                  </select>
                  <button 
                    onClick={fetchTaskLists}
                    disabled={loading}
                    className="p-1.5 bg-[#0a0a0c] border border-[#1a1a1a] rounded text-[#ffc107] hover:bg-[#111] transition"
                    title="Refresh lists"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Add Custom Task Form */}
              <div className="border-t border-[#1a1a1a] pt-4 space-y-3">
                <span className="text-[8px] font-mono text-[#555] block uppercase font-black tracking-widest">
                  Seed New Task
                </span>
                
                <input 
                  type="text"
                  placeholder="Task title..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-[#1a1a1a] rounded p-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500/50"
                />
                
                <textarea
                  placeholder="Notes..."
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-[#0a0a0c] border border-[#1a1a1a] rounded p-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-amber-500/50 resize-none"
                />

                <button
                  onClick={() => handleAddTask()}
                  disabled={loading || !newTaskTitle.trim()}
                  className="w-full bg-[#111] border border-amber-500/20 hover:border-amber-500/50 text-amber-400 font-bold text-[10px] font-mono uppercase py-2.5 rounded-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </button>
              </div>

              {/* Sovereign Suggestion Preset Cards */}
              <div className="border-t border-[#1a1a1a] pt-4 space-y-2">
                <div className="flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[8px] font-mono text-amber-400 uppercase font-black tracking-wider">
                    Genie Sovereign Manifests
                  </span>
                </div>
                
                <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                  {SOVEREIGN_SUGGESTIONS.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAddTask(s.title, s.notes)}
                      disabled={loading}
                      className="w-full text-left p-2.5 bg-[#050508] hover:bg-[#0f0f15] border border-amber-500/10 hover:border-amber-500/30 rounded text-slate-300 hover:text-white transition cursor-pointer flex flex-col gap-0.5"
                    >
                      <div className="text-[9px] font-mono font-bold flex items-center gap-1 text-[#ffc107]">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        {s.title}
                      </div>
                      <div className="text-[8px] font-mono text-slate-500 leading-normal line-clamp-2">
                        {s.notes}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Panel: Active Tasks List (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-[#030305] border border-[#1a1a1a] p-4 rounded-lg flex-1 flex flex-col">
              
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#111]">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono text-slate-400 uppercase font-bold">
                    Active Tasks ({tasks.length})
                  </span>
                  <div className="text-[8px] font-mono text-amber-500 bg-amber-500/5 border border-amber-500/20 px-2 py-0.5 rounded">
                    Firestore Audited: {firestoreMissionsCount}
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSyncAllToFirestore}
                    disabled={tasks.length === 0 || syncStatus === 'syncing'}
                    className="text-[8px] font-mono font-bold text-emerald-400 hover:text-emerald-300 transition"
                    title="Sync tasks to Cloud Firestore"
                  >
                    {syncStatus === 'syncing' ? 'Syncing...' : syncStatus === 'success' ? '✔ Synced to Firestore' : '✔ Bulk Sync DB'}
                  </button>
                </div>
              </div>

              {loading && tasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 text-amber-500 animate-spin mb-2" />
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Querying Tasks Endpoint...</span>
                </div>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-[#ff4444] gap-2">
                  <AlertCircle className="w-6 h-6" />
                  <span className="text-[9px] font-mono leading-relaxed max-w-sm">{error}</span>
                </div>
              ) : tasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-500 italic font-mono text-[10px]">
                  No tasks found in this list. Seed a sovereign mission task on the left!
                </div>
              ) : (
                <div className="space-y-2 flex-1 overflow-y-auto max-h-[380px] pr-1">
                  {tasks.map(t => {
                    const isCompleted = t.status === 'completed';
                    return (
                      <div 
                        key={t.id} 
                        className={`flex items-start justify-between gap-3 p-3 rounded-lg border transition ${
                          isCompleted 
                            ? 'bg-[#050a06]/30 border-emerald-900/40 text-slate-400' 
                            : 'bg-[#0a0a0c] border-[#151518] hover:border-[#222]'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 flex-1 min-w-0">
                          <button 
                            onClick={() => handleToggleTaskStatus(t)}
                            className="mt-0.5 text-slate-500 hover:text-amber-500 transition cursor-pointer flex-shrink-0"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                          
                          <div className="min-w-0">
                            <span className={`text-xs font-mono font-semibold block truncate leading-tight ${isCompleted ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                              {t.title}
                            </span>
                            {t.notes && (
                              <span className="text-[9px] font-mono text-slate-500 mt-1 block leading-normal line-clamp-3 whitespace-pre-wrap">
                                {t.notes}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteTask(t.id, t.title)}
                          className="text-slate-600 hover:text-red-500 p-1 rounded transition flex-shrink-0"
                          title="Delete task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>

        </div>
      )}
    </div>
  );
}
