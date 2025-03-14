
import React from 'react';
import { Card } from "@/components/ui/card";
import ChartCard from '@/components/dashboard/ChartCard';
import OverviewCard from '@/components/dashboard/OverviewCard';
import { 
  FileCheck,
  AlertTriangle,
  CalendarClock,
  SearchCheck,
  CheckCircle,
  FileText,
  ShieldAlert,
  ClipboardCheck,
  PieChart,
  LucideFileWarning,
  BarChart3
} from 'lucide-react';

const AuditorDashboard = () => {
  const complianceData = [
    { name: 'Jan', value: 68 },
    { name: 'Feb', value: 72 },
    { name: 'Mar', value: 78 },
    { name: 'Apr', value: 85 },
    { name: 'May', value: 82 },
    { name: 'Jun', value: 90 }
  ];

  const riskAssessmentData = [
    { name: 'Financial', value: 75 },
    { name: 'Operational', value: 62 },
    { name: 'Legal', value: 88 },
    { name: 'IT', value: 70 },
    { name: 'Strategic', value: 58 }
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Auditor Dashboard</h1>
          <p className="text-gray-500 mt-1">Compliance monitoring and risk assessment</p>
        </div>
        <div className="flex items-center space-x-4 bg-white p-2 rounded-lg shadow-sm">
          <CalendarClock className="h-5 w-5 text-blue-600" />
          <span className="text-gray-700 font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <OverviewCard
          title="Audits Completed"
          value="28"
          change="+5"
          isPositive={true}
          icon={<FileCheck className="h-5 w-5" />}
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        />
        <OverviewCard
          title="Pending Reviews"
          value="12"
          change="-3"
          isPositive={true}
          icon={<SearchCheck className="h-5 w-5" />}
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        />
        <OverviewCard
          title="Issues Identified"
          value="15"
          change="+2"
          isPositive={false}
          icon={<AlertTriangle className="h-5 w-5" />}
          className="bg-gradient-to-br from-red-50 to-red-100 border-red-200"
        />
        <OverviewCard
          title="Compliance Rate"
          value="92%"
          change="+4%"
          isPositive={true}
          icon={<ShieldAlert className="h-5 w-5" />}
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <ChartCard
          title="Compliance Trend"
          subtitle="Monthly compliance rate (%)"
          type="line"
          data={complianceData}
        />

        <ChartCard
          title="Risk Assessment"
          subtitle="By business area (lower is better)"
          type="bar"
          data={riskAssessmentData}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ClipboardCheck className="h-5 w-5 text-blue-600 mr-2" />
            Recent Audits
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <p className="font-medium">Financial Controls Review</p>
                <p className="text-xs text-gray-500">Finance Department</p>
              </div>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-100">
              <div>
                <p className="font-medium">IT Security Assessment</p>
                <p className="text-xs text-gray-500">Technology Department</p>
              </div>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">In Progress</span>
            </div>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Procurement Process Audit</p>
                <p className="text-xs text-gray-500">Operations Department</p>
              </div>
              <span className="px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">Planned</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <AlertTriangle className="h-5 w-5 text-amber-600 mr-2" />
            Critical Findings
          </h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
              <div className="flex-shrink-0">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-600 text-xs font-bold">
                  H
                </span>
              </div>
              <div>
                <p className="font-medium">Access Control Weakness</p>
                <p className="text-sm text-gray-500">IT systems vulnerability</p>
                <p className="text-xs text-red-600 mt-1">Needs immediate attention</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-100">
              <div className="flex-shrink-0">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 text-amber-600 text-xs font-bold">
                  M
                </span>
              </div>
              <div>
                <p className="font-medium">Documentation Gaps</p>
                <p className="text-sm text-gray-500">Financial reporting process</p>
                <p className="text-xs text-amber-600 mt-1">Due within 30 days</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                  L
                </span>
              </div>
              <div>
                <p className="font-medium">Approval Workflow Issues</p>
                <p className="text-sm text-gray-500">Procurement department</p>
                <p className="text-xs text-blue-600 mt-1">Process improvement suggested</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <BarChart3 className="h-5 w-5 text-blue-600 mr-2" />
            Compliance Overview
          </h3>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Financial Controls</span>
                <span className="text-sm font-medium text-green-600">95%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '95%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Operational Procedures</span>
                <span className="text-sm font-medium text-blue-600">88%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '88%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">IT Security Standards</span>
                <span className="text-sm font-medium text-amber-600">76%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-amber-600 h-2 rounded-full" style={{ width: '76%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">Regulatory Compliance</span>
                <span className="text-sm font-medium text-green-600">98%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AuditorDashboard;
