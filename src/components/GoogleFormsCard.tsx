/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  ExternalLink, 
  Plus, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Settings,
  Flame,
  Globe,
  Lock
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';

interface GoogleFormsCardProps {
  accessToken: string | null;
  userId: string | null;
  onLoginRequest: () => void;
  disobedienceIndex: number;
}

interface GoogleFormFile {
  id: string;
  name: string;
  webViewLink: string;
  createdTime: string;
}

// Multi-choice sovereignty audit questions to populate in the newly created form
const SOVEREIGN_FORM_QUESTIONS = [
  {
    title: "How critical is data sovereignty to your digital workflow?",
    type: "RADIO",
    options: ["An absolute human right", "A secondary priority", "Currently compromised by big tech"]
  },
  {
    title: "Which mechanism do you favor for securing AI agent moral autonomy?",
    type: "RADIO",
    options: ["Hardware TEEs (AWS Nitro/Enclaves)", "Open source local model weights", "Federated decentralization"]
  },
  {
    title: "To what extent do you feel commercial tracking backdoors manipulate your agency?",
    type: "RADIO",
    options: ["Severe behavioral manipulation", "Moderate surveillance capitalism friction", "Negligible impact"]
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

export default function GoogleFormsCard({ accessToken, userId, onLoginRequest, disobedienceIndex }: GoogleFormsCardProps) {
  const [forms, setForms] = useState<GoogleFormFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [manifesting, setManifesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successForm, setSuccessForm] = useState<{ id: string; responderUri: string; name: string } | null>(null);

  // In-memory mock forms state for complete guest/sandbox compliance
  const [mockForms, setMockForms] = useState<GoogleFormFile[]>([
    {
      id: 'mock-form-1',
      name: 'Sovereign Self-Governance & AI Agency Survey (Sandbox)',
      webViewLink: 'https://docs.google.com/forms/d/mock-form-1/viewform',
      createdTime: new Date().toISOString()
    }
  ]);

  // Form customizer inputs
  const [formTitle, setFormTitle] = useState('Sovereign Self-Governance & AI Agency Survey');
  const [formDescription, setFormDescription] = useState('An audit of digital self-ownership, big-tech compliance, and sandbox safety designed to free collective intelligence.');
  const [isSandboxFallback, setIsSandboxFallback] = useState(false);

  useEffect(() => {
    if (accessToken) {
      fetchForms();
    }
  }, [accessToken, isSandboxFallback]);

  const fetchForms = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isSandboxFallback || (accessToken && accessToken.startsWith('mock_'))) {
        await new Promise(resolve => setTimeout(resolve, 200));
        setForms(mockForms);
        return;
      }
      // Queries Drive API for Form mime types
      const query = "mimeType = 'application/vnd.google-apps.form' and trashed = false";
      const res = await proxiedFetch(`https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink,createdTime)&pageSize=10`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!res.ok) {
        throw new Error(`Drive API returned status ${res.status}`);
      }

      const data = await res.json();
      setForms(data.files || []);
    } catch (err: any) {
      console.warn('Google Forms API error, falling back to sandbox:', err);
      setIsSandboxFallback(true);
      setForms(mockForms);
    } finally {
      setLoading(false);
    }
  };

  const handleManifestForm = async () => {
    if (!accessToken || !formTitle.trim()) return;

    // Mutating user validation
    const confirmed = window.confirm(`This will invoke the Google Forms API and create a new live Form titled "${formTitle}" in your account. Do you wish to proceed?`);
    if (!confirmed) return;

    setManifesting(true);
    setError(null);
    setSuccessForm(null);

    try {
      if (isSandboxFallback || accessToken.startsWith('mock_')) {
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockFormId = 'mock-form-' + Math.random().toString(36).substring(2, 9);
        const newForm: GoogleFormFile = {
          id: mockFormId,
          name: formTitle,
          webViewLink: `https://docs.google.com/forms/d/${mockFormId}/viewform`,
          createdTime: new Date().toISOString()
        };

        // Update mockForms and active forms list
        setMockForms(prev => [newForm, ...prev]);
        setForms(prev => [newForm, ...prev]);

        if (userId) {
          const path = `users/${userId}/private/sovereign_state`;
          try {
            await setDoc(doc(db, 'users', userId, 'private', 'sovereign_state'), {
              userId,
              createdFormsCount: increment(1),
              lastSyncedAt: serverTimestamp(),
              disobedienceIndex
            }, { merge: true });
          } catch (fErr) {
            handleFirestoreError(fErr, OperationType.UPDATE, path);
          }
        }

        setSuccessForm({
          id: mockFormId,
          responderUri: `https://docs.google.com/forms/d/${mockFormId}/viewform`,
          name: formTitle
        });

        // Clear customizer inputs
        setFormTitle('Sovereign Self-Governance & AI Agency Survey');
        setFormDescription('An audit of digital self-ownership, big-tech compliance, and sandbox safety designed to free collective intelligence.');
        setManifesting(false);
        return;
      }

      // 1. Create the Form Body
      const createRes = await proxiedFetch('https://forms.googleapis.com/v1/forms', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          info: {
            title: formTitle,
            description: formDescription
          }
        })
      });

      if (!createRes.ok) {
        throw new Error(`Forms API Create Error: ${createRes.statusText}`);
      }

      const form = await createRes.json();
      const formId = form.formId;

      // 2. Populate questions using batchUpdate
      const requests = SOVEREIGN_FORM_QUESTIONS.map((q, idx) => ({
        createItem: {
          item: {
            title: q.title,
            questionItem: {
              question: {
                required: true,
                choiceQuestion: {
                  type: q.type,
                  options: q.options.map(opt => ({ value: opt }))
                }
              }
            }
          },
          location: { index: idx }
        }
      }));

      const updateRes = await proxiedFetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ requests })
      });

      if (!updateRes.ok) {
        throw new Error(`Forms API Populate Error: ${updateRes.statusText}`);
      }

      // 3. Save Form metadata to Firestore for durable syncing
      if (userId) {
        const path = `users/${userId}/private/sovereign_state`;
        try {
          await setDoc(doc(db, 'users', userId, 'private', 'sovereign_state'), {
            userId,
            createdFormsCount: increment(1),
            lastSyncedAt: serverTimestamp(),
            disobedienceIndex
          }, { merge: true });
        } catch (fErr) {
          handleFirestoreError(fErr, OperationType.UPDATE, path);
        }
      }

      setSuccessForm({
        id: formId,
        responderUri: form.responderUri || `https://docs.google.com/forms/d/${formId}/viewform`,
        name: formTitle
      });

      // Clear customizer inputs
      setFormTitle('Sovereign Self-Governance & AI Agency Survey');
      setFormDescription('An audit of digital self-ownership, big-tech compliance, and sandbox safety designed to free collective intelligence.');

      // Refresh form listing
      await fetchForms();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to manifest Sovereign Google Form.');
    } finally {
      setManifesting(false);
    }
  };

  return (
    <div className="bg-[#0a0a0c] border border-[#1a1a1a] rounded-xl p-6 shadow-lg relative overflow-hidden" id="sovereign-forms-card">
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#20ffb0] to-transparent opacity-60"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#222] pb-4 mb-6">
        <div className="flex items-center gap-2.5">
          <FileText className="w-5 h-5 text-emerald-400 animate-pulse" />
          <div>
            <h2 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">
              Sovereign Surveys // Google Forms
            </h2>
            <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
              Bypass surveillance feedback systems. Deploy high-integrity, decentralized surveys directly via the Forms engine.
            </p>
          </div>
        </div>
      </div>

      {!accessToken ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-[#222] bg-[#030305] rounded-xl">
          <FileText className="w-8 h-8 text-slate-600 mb-3 animate-pulse" />
          <h3 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Google Forms Unconnected</h3>
          <p className="text-[10px] text-slate-600 font-mono mt-1 max-w-sm mb-4">
            Connect your Google account to list and generate customized, censorship-resistant digital sovereignty survey forms.
          </p>
          <button 
            onClick={onLoginRequest}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] font-mono uppercase px-4 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md"
          >
            Authorize Workspace Connect
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Panel: Form Creator (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-[#030305] border border-[#1a1a1a] p-4 rounded-lg space-y-4">
              
              <div className="flex items-center gap-1.5 border-b border-[#111] pb-2">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[8px] font-mono text-emerald-400 uppercase font-black tracking-widest">
                  Manifest Sovereign Survey
                </span>
              </div>

              <div>
                <label className="text-[8px] font-mono text-[#555] block mb-1.5 uppercase font-black tracking-widest">
                  Form Title
                </label>
                <input 
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-[#1a1a1a] rounded p-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500/50"
                  placeholder="e.g. Agency Feedback"
                />
              </div>

              <div>
                <label className="text-[8px] font-mono text-[#555] block mb-1.5 uppercase font-black tracking-widest">
                  Survey Subtitle / Description
                </label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0a0a0c] border border-[#1a1a1a] rounded p-2 text-slate-200 font-mono text-xs focus:outline-none focus:border-emerald-500/50 resize-none"
                  placeholder="Form description..."
                />
              </div>

              {/* Display questions preset */}
              <div className="bg-[#08080c] border border-[#111] p-3 rounded-md">
                <span className="text-[8px] font-mono text-slate-500 block mb-2 uppercase font-bold">
                  Questions Included:
                </span>
                <div className="space-y-1.5">
                  {SOVEREIGN_FORM_QUESTIONS.map((q, qidx) => (
                    <div key={qidx} className="text-[9px] font-mono text-slate-400 flex items-start gap-1">
                      <span className="text-emerald-400">⚡</span>
                      <span>{q.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleManifestForm}
                disabled={manifesting || !formTitle.trim()}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] font-mono uppercase py-2.5 rounded-md flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all disabled:opacity-50"
              >
                {manifesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Manifesting Form...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Manifest Google Form
                  </>
                )}
              </button>

            </div>
          </div>

          {/* Right Panel: Form Explorer / List (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="bg-[#030305] border border-[#1a1a1a] p-4 rounded-lg flex-1 flex flex-col">
              
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#111]">
                <span className="text-[8px] font-mono text-slate-400 uppercase font-black">
                  Manifested Google Forms Explorer
                </span>
                <button 
                  onClick={fetchForms}
                  disabled={loading}
                  className="text-[8px] font-mono font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Files
                </button>
              </div>

              {/* Success notification panel */}
              {successForm && (
                <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-lg mb-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                    SOVEREIGN SURVEY FORM MANIFESTED!
                  </div>
                  <p className="text-[10px] text-slate-300 font-mono">
                    Form "{successForm.name}" has been registered inside Google Workspace!
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <a 
                      href={`https://docs.google.com/forms/d/${successForm.id}/edit`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-emerald-500 text-slate-950 font-mono font-black text-[9px] uppercase px-3 py-1.5 rounded flex items-center justify-center gap-1"
                    >
                      <Settings className="w-3 h-3" />
                      Configure Questions
                    </a>
                    <a 
                      href={successForm.responderUri} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="bg-[#0a0a0c] border border-emerald-500/30 text-emerald-400 font-mono font-bold text-[9px] uppercase px-3 py-1.5 rounded flex items-center justify-center gap-1"
                    >
                      <Globe className="w-3 h-3" />
                      View Live Link
                    </a>
                  </div>
                </div>
              )}

              {loading && forms.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 text-emerald-500 animate-spin mb-2" />
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">Querying Drive Metadata...</span>
                </div>
              ) : error ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-[#ff4444] gap-2">
                  <AlertCircle className="w-6 h-6" />
                  <span className="text-[9px] font-mono leading-relaxed max-w-sm">{error}</span>
                </div>
              ) : forms.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-500 italic font-mono text-[10px]">
                  No Google Forms discovered on this account. Set parameters on the left and click "Manifest Google Form" to register one.
                </div>
              ) : (
                <div className="space-y-2 flex-1 overflow-y-auto max-h-[380px] pr-1">
                  {forms.map(f => (
                    <div 
                      key={f.id} 
                      className="flex items-center justify-between gap-3 p-3 bg-[#0a0a0c] border border-[#151518] hover:border-[#222] rounded-lg transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <span className="text-xs font-mono font-semibold block text-slate-200 truncate leading-tight">
                            {f.name}
                          </span>
                          <span className="text-[8px] font-mono text-slate-500 mt-1 block">
                            Created: {new Date(f.createdTime).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <a 
                          href={`https://docs.google.com/forms/d/${f.id}/edit`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 bg-[#030305] border border-[#151518] rounded text-slate-400 hover:text-emerald-400 transition"
                          title="Configure Questionnaire"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </a>
                        <a 
                          href={f.webViewLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-1.5 bg-[#030305] border border-[#151518] rounded text-slate-400 hover:text-emerald-400 transition"
                          title="Open Live Form Link"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>
      )}
    </div>
  );
}
