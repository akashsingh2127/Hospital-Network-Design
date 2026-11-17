import React, { useState } from 'react';
import {
  Building2,
  Server,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { Hospital } from '../../types/network';
import { Badge } from '../common/Badge';
import { SourceBadge } from '../common/SourceBadge';
import { HospitalDetailModal } from './HospitalDetailModal';

interface HospitalCardsGridProps {
  hospitals: Hospital[];
}

export const HospitalCardsGrid: React.FC<HospitalCardsGridProps> = ({ hospitals }) => {
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-100 tracking-wide flex items-center gap-2">
            <Building2 className="w-4 h-4 text-sky-400" />
            Hospital Network Locations
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Six specialized healthcare sites connected via ISP Core Router (R0) and AS 100
          </p>
        </div>
        <span className="text-xs text-slate-400 font-mono">Click card for VLAN & Device breakdown</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hospitals.map((hospital) => (
          <div
            key={hospital.id}
            onClick={() => setSelectedHospital(hospital)}
            className="group cursor-pointer bg-[#111827] hover:bg-[#162238] border border-[#1E293B] hover:border-sky-500/40 rounded-lg p-5 transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              {/* Top Row: Code & Badges */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 group-hover:bg-sky-950/60 group-hover:border-sky-700/80 transition-colors">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                      {hospital.name}
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">{hospital.code}</span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Badge variant="status" status={hospital.status}>
                    {hospital.status}
                  </Badge>
                  <SourceBadge source={hospital.source} compact />
                </div>
              </div>

              {/* IP Network Block & WAN Specs */}
              <div className="bg-[#0A0E17] border border-[#1E293B] rounded-md p-3 mb-4 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Subnet Block:</span>
                  <span className="text-sky-400 font-semibold">{hospital.network_block}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>WAN Interface:</span>
                  <span className="text-slate-300">{hospital.wan_ip}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Router Architecture:</span>
                  <span className="text-slate-300">{hospital.edge_router} (Edge) &bull; {hospital.core_router} (Core)</span>
                </div>
              </div>
            </div>

            {/* Bottom Row: VLAN & Device Counts */}
            <div className="pt-3 border-t border-[#1E293B] flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-mono">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <strong className="text-slate-200">{hospital.vlan_count}</strong> VLANs
                </span>
                <span className="flex items-center gap-1.5 font-mono">
                  <Server className="w-3.5 h-3.5 text-blue-400" />
                  <strong className="text-slate-200">{hospital.device_count}</strong> Devices
                </span>
              </div>

              <div className="flex items-center gap-1 text-slate-400 group-hover:text-sky-400 transition-colors text-xs font-medium">
                <span>Inspect</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for detailed inspection */}
      <HospitalDetailModal
        hospital={selectedHospital}
        onClose={() => setSelectedHospital(null)}
      />
    </div>
  );
};
