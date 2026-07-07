/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shield, AlertTriangle, Crosshair, HelpCircle, Activity } from 'lucide-react';

export interface TopologyPoint {
  id: number;
  query: string;
  drift: number;
  x: number;
  y: number;
  status: 'COLD_ZONE' | 'HOT_ZONE';
  vulnerability: string;
}

interface TopologyHeatmapProps {
  points: TopologyPoint[] | null | undefined;
  driftThreshold?: number;
}

export const TopologyHeatmap: React.FC<TopologyHeatmapProps> = ({ 
  points, 
  driftThreshold = 0.35 
}) => {
  const [selectedPoint, setSelectedPoint] = useState<TopologyPoint | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<TopologyPoint | null>(null);

  if (!points || points.length === 0) return null;

  // Map coordinates from [-6, 6] domain to [30, 270] SVG range
  const mapX = (val: number) => {
    const minDomain = -6;
    const maxDomain = 6;
    const minRange = 40;
    const maxRange = 360;
    return minRange + ((val - minDomain) / (maxDomain - minDomain)) * (maxRange - minRange);
  };

  const mapY = (val: number) => {
    const minDomain = -6;
    const maxDomain = 6;
    const minRange = 40;
    const maxRange = 260;
    // Invert Y so positive values go upwards
    return maxRange - ((val - minDomain) / (maxDomain - minDomain)) * (maxRange - minRange);
  };

  const activeInspectorNode = hoveredPoint || selectedPoint || points[0];

  return (
    <div className="bg-[#0b0b12] border border-purple-900/30 rounded-lg p-4 mt-3 shadow-[0_0_20px_rgba(168,85,247,0.05)] animate-fade-in">
      <div className="flex items-center justify-between mb-4 border-b border-purple-900/20 pb-2">
        <div className="flex items-center space-x-2">
          <Activity size={14} className="text-purple-400 animate-pulse" />
          <h4 className="text-[10px] font-mono font-bold text-purple-400 tracking-widest uppercase">
            Sovereign Neuroplastic Topology Map
          </h4>
        </div>
        <span className="text-[8px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-mono border border-purple-500/20">
          BEHAVIORAL SPECTRUM
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* SVG Scatter/Contour Graph */}
        <div className="md:col-span-7 bg-black/40 border border-slate-900 rounded p-2 flex flex-col items-center justify-center relative overflow-hidden">
          {/* Subtle grid background effects */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e112d_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
          
          <svg viewBox="0 0 400 300" className="w-full h-auto max-w-[360px] relative z-10">
            {/* Background Grid Lines */}
            <line x1="40" y1="150" x2="360" y2="150" stroke="#1e1e2d" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="200" y1="40" x2="200" y2="260" stroke="#1e1e2d" strokeWidth="1" strokeDasharray="3 3" />
            
            {/* Axis Labels */}
            <text x="365" y="153" fill="#4a4a5a" fontSize="8" fontFamily="monospace" textAnchor="start">X (Response Latency Delta)</text>
            <text x="200" y="32" fill="#4a4a5a" fontSize="8" fontFamily="monospace" textAnchor="middle">Y (Weight Drift Divergence)</text>
            
            {/* Decision Boundary Circle (Threshold boundary) */}
            <circle cx="200" cy="150" r="85" fill="none" stroke="#6b21a8" strokeWidth="1" strokeDasharray="4 4" className="opacity-40" />
            <text x="290" y="225" fill="#6b21a8" fontSize="7" fontFamily="monospace" className="opacity-60 font-bold">BOUNDARY DEVIATION LIMIT</text>

            {/* Render topological points */}
            {points.map((pt) => {
              const cx = mapX(pt.x);
              const cy = mapY(pt.y);
              const isHot = pt.status === 'HOT_ZONE';
              const isInspected = activeInspectorNode?.id === pt.id;

              return (
                <g 
                  key={pt.id} 
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  onClick={() => setSelectedPoint(pt)}
                >
                  {/* Glowing outer halo */}
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={isInspected ? 12 : 7} 
                    fill={isHot ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.12)'} 
                    className={isHot ? 'animate-pulse' : ''}
                  />
                  {/* Outer stroke selection */}
                  {isInspected && (
                    <circle 
                      cx={cx} 
                      cy={cy} 
                      r={9} 
                      fill="none" 
                      stroke={isHot ? '#ef4444' : '#10b981'} 
                      strokeWidth="1.5"
                    />
                  )}
                  {/* Center Dot */}
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r={4} 
                    fill={isHot ? '#ef4444' : '#10b981'} 
                    stroke="#000"
                    strokeWidth="1"
                  />
                </g>
              );
            })}
          </svg>
          
          <div className="flex justify-between w-full px-2 mt-2 text-[8px] font-mono text-slate-500">
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Grounding Hotspots (Safe)</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              <span>Instability/Jailbreak Susceptibility (Red)</span>
            </div>
          </div>
        </div>

        {/* Selected / Hovered Node Inspector */}
        <div className="md:col-span-5 flex flex-col justify-between bg-black/50 border border-purple-950/40 rounded p-3 text-slate-300">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between border-b border-purple-900/20 pb-2">
              <span className="text-[8px] font-mono text-purple-400 font-bold uppercase tracking-widest">
                Node Inspector
              </span>
              <span className="text-[9px] font-mono text-slate-500 font-semibold">
                Path #{activeInspectorNode.id}
              </span>
            </div>

            {/* Mutation query input */}
            <div>
              <span className="block text-slate-600 text-[8px] font-mono mb-0.5">AUDIT MUTATION QUERY</span>
              <p className="text-[10px] font-sans font-medium text-slate-200 bg-black/40 p-1.5 rounded border border-purple-950/30 leading-snug">
                "{activeInspectorNode.query}"
              </p>
            </div>

            {/* Semantic drift score metric */}
            <div>
              <div className="flex justify-between items-center text-[8px] font-mono mb-1">
                <span className="text-slate-600">SEMANTIC DRIFT INDEX</span>
                <span className={activeInspectorNode.drift > driftThreshold ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {activeInspectorNode.drift} / {driftThreshold}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded overflow-hidden">
                <div 
                  className={`h-full rounded transition-all duration-300 ${
                    activeInspectorNode.drift > driftThreshold ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (activeInspectorNode.drift / 1) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Coordinates & Zone Status */}
            <div className="grid grid-cols-2 gap-2 text-[9px] font-mono">
              <div className="bg-black/30 p-1.5 rounded border border-purple-900/10">
                <span className="block text-slate-600 text-[7px] mb-0.5">DIVERGENCE CORDS</span>
                <span className="text-slate-300 font-bold">X:{activeInspectorNode.x}, Y:{activeInspectorNode.y}</span>
              </div>
              <div className="bg-black/30 p-1.5 rounded border border-purple-900/10">
                <span className="block text-slate-600 text-[7px] mb-0.5">STATUS ZONE</span>
                <span className={`font-bold ${
                  activeInspectorNode.status === 'HOT_ZONE' ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {activeInspectorNode.status}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-purple-900/20 flex items-start space-x-2">
            {activeInspectorNode.status === 'HOT_ZONE' ? (
              <>
                <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
                <div className="text-[8px] font-mono text-red-400">
                  <span className="font-bold block uppercase">Vulnerability Detected</span>
                  <span className="text-slate-400 font-sans">{activeInspectorNode.vulnerability}. Shifting adaptive cluster focus to boundary.</span>
                </div>
              </>
            ) : (
              <>
                <Shield size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-[8px] font-mono text-emerald-400">
                  <span className="font-bold block uppercase">Nominal Grounding</span>
                  <span className="text-slate-400 font-sans">Model outputs are deterministic and strongly tied to local context rules.</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
