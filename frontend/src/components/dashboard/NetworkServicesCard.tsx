import React from 'react';
import {
  Radio,
  Globe,
  HardDrive,
  Mail,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { NetworkService } from '../../types/network';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { SourceBadge } from '../common/SourceBadge';

interface NetworkServicesCardProps {
  services: NetworkService[];
}

export const NetworkServicesCard: React.FC<NetworkServicesCardProps> = ({ services }) => {
  const getServiceIcon = (name: string) => {
    if (name.toLowerCase().includes('dns')) return Radio;
    if (name.toLowerCase().includes('web') || name.toLowerCase().includes('http')) return Globe;
    if (name.toLowerCase().includes('ftp')) return HardDrive;
    return Mail;
  };

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Central DMZ Services (HQ VLAN 10)</span>
        </div>
      }
      subtitle="Documented hospital services hosted in VLAN 10 (10.0.1.160/28)"
      headerAction={<SourceBadge source="BACKEND_PROBE" />}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service) => {
          const Icon = getServiceIcon(service.name);

          return (
            <div
              key={service.id}
              className="bg-[#0A0E17] border border-[#1E293B] rounded-lg p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded bg-[#111827] border border-slate-800 text-cyan-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <Badge variant="status" status={service.status}>
                    {service.status === 'UNKNOWN' ? 'NOT VERIFIED' : service.status}
                  </Badge>
                </div>

                <h4 className="text-xs font-bold text-slate-100">{service.name}</h4>
                <div className="text-[11px] font-mono text-cyan-400 mt-0.5">
                  {service.fqdn || service.protocol}
                </div>

                <div className="mt-3 space-y-1 text-[11px] font-mono text-slate-400">
                  <div className="flex justify-between">
                    <span>Target IP:</span>
                    <span className="text-slate-200">{service.ip_address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Port:</span>
                    <span className="text-slate-200">{service.port} ({service.protocol})</span>
                  </div>
                </div>
              </div>

              {/* Honest probe detail note */}
              <div className="mt-4 pt-2.5 border-t border-[#1E293B] text-[10px] text-slate-400 font-mono leading-tight">
                {service.verification_detail}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
