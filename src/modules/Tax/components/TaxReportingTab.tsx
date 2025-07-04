import React, { useState, useEffect } from 'react';
import { TaxService } from '../services/taxService';
import { TaxReport, TaxType } from '../types';

interface TaxReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'monthly' | 'quarterly' | 'annual';
  format: 'PDF' | 'Excel' | 'CSV';
  last_generated?: string;
  status: 'active' | 'inactive';
}

interface GeneratedReport {
  id: string;
  template_id: string;
  template_name: string;
  period: string;
  generated_date: string;
  file_size: string;
  format: string;
  status: 'generating' | 'completed' | 'failed';
  download_url?: string;
}

interface ReportSchedule {
  id: string;
  template_id: string;
  template_name: string;
  frequency: 'monthly' | 'quarterly' | 'annual';
  next_run: string;
  last_run?: string;
  status: 'active' | 'paused' | 'failed';
}

const TaxReportingTab: React.FC = () => {
  const [reportTemplates, setReportTemplates] = useState<TaxReportTemplate[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [reportSchedules, setReportSchedules] = useState<ReportSchedule[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [loading, setLoading] = useState(false);
  const [showTemplateForm, setShowTemplateForm] = useState(false);

  const taxService = new TaxService();

  useEffect(() => {
    loadReportingData();
  }, [selectedPeriod]);

  const loadReportingData = async () => {
    setLoading(true);
    try {
      // Simulate loading reporting data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock report templates
      const mockTemplates: TaxReportTemplate[] = [
        {
          id: '1',
          name: 'Monthly Tax Summary',
          description: 'Comprehensive monthly tax summary including all tax types',
          type: 'monthly',
          format: 'PDF',
          last_generated: '2024-01-31',
          status: 'active'
        },
        {
          id: '2',
          name: 'SST Return Report',
          description: 'Sales and Service Tax return with detailed breakdown',
          type: 'monthly',
          format: 'Excel',
          last_generated: '2024-01-31',
          status: 'active'
        },
        {
          id: '3',
          name: 'MTD Summary Report',
          description: 'Monthly Tax Deduction summary for employees',
          type: 'monthly',
          format: 'PDF',
          last_generated: '2024-01-31',
          status: 'active'
        },
        {
          id: '4',
          name: 'Annual Tax Return',
          description: 'Complete annual tax return with all schedules',
          type: 'annual',
          format: 'PDF',
          last_generated: '2023-12-31',
          status: 'active'
        }
      ];

      // Mock generated reports
      const mockGeneratedReports: GeneratedReport[] = [
        {
          id: '1',
          template_id: '1',
          template_name: 'Monthly Tax Summary',
          period: '2024-01',
          generated_date: '2024-01-31 23:59:59',
          file_size: '2.5 MB',
          format: 'PDF',
          status: 'completed',
          download_url: '/reports/monthly-tax-summary-2024-01.pdf'
        },
        {
          id: '2',
          template_id: '2',
          template_name: 'SST Return Report',
          period: '2024-01',
          generated_date: '2024-01-31 23:59:59',
          file_size: '1.8 MB',
          format: 'Excel',
          status: 'completed',
          download_url: '/reports/sst-return-2024-01.xlsx'
        },
        {
          id: '3',
          template_id: '3',
          template_name: 'MTD Summary Report',
          period: '2024-01',
          generated_date: '2024-01-31 23:59:59',
          file_size: '1.2 MB',
          format: 'PDF',
          status: 'completed',
          download_url: '/reports/mtd-summary-2024-01.pdf'
        }
      ];

      // Mock report schedules
      const mockSchedules: ReportSchedule[] = [
        {
          id: '1',
          template_id: '1',
          template_name: 'Monthly Tax Summary',
          frequency: 'monthly',
          next_run: '2024-02-28 23:59:59',
          last_run: '2024-01-31 23:59:59',
          status: 'active'
        },
        {
          id: '2',
          template_id: '2',
          template_name: 'SST Return Report',
          frequency: 'monthly',
          next_run: '2024-02-28 23:59:59',
          last_run: '2024-01-31 23:59:59',
          status: 'active'
        },
        {
          id: '3',
          template_id: '4',
          template_name: 'Annual Tax Return',
          frequency: 'annual',
          next_run: '2024-12-31 23:59:59',
          last_run: '2023-12-31 23:59:59',
          status: 'active'
        }
      ];

      setReportTemplates(mockTemplates);
      setGeneratedReports(mockGeneratedReports);
      setReportSchedules(mockSchedules);
    } catch (error) {
      console.error('Error loading reporting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async (template: TaxReportTemplate) => {
    try {
      setLoading(true);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReport: GeneratedReport = {
        id: Date.now().toString(),
        template_id: template.id,
        template_name: template.name,
        period: selectedPeriod,
        generated_date: new Date().toISOString(),
        file_size: '1.5 MB',
        format: template.format,
        status: 'completed',
        download_url: `/reports/${template.name.toLowerCase().replace(/\s+/g, '-')}-${selectedPeriod}.${template.format.toLowerCase()}`
      };
      
      setGeneratedReports(prev => [newReport, ...prev]);
      
      // Update template last generated date
      setReportTemplates(prev => prev.map(t => 
        t.id === template.id ? { ...t, last_generated: new Date().toISOString().split('T')[0] } : t
      ));
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = (report: GeneratedReport) => {
    if (report.download_url) {
      // Simulate download
      console.log('Downloading report:', report.download_url);
      // In a real implementation, this would trigger a file download
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'generating': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Tax Reporting</h2>
          <p className="text-gray-600 text-sm">Automated tax return generation and reporting</p>
        </div>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Period:</label>
          <input
            type="month"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          />
          <button
            onClick={() => setShowTemplateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
          >
            Add Template
          </button>
          <button
            onClick={loadReportingData}
            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 text-sm">Report Templates</h3>
          <p className="text-2xl font-bold text-blue-600">{reportTemplates.length}</p>
          <p className="text-xs text-blue-600 mt-1">Available templates</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 text-sm">Generated Reports</h3>
          <p className="text-2xl font-bold text-green-600">{generatedReports.length}</p>
          <p className="text-xs text-green-600 mt-1">This period</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-semibold text-purple-800 text-sm">Active Schedules</h3>
          <p className="text-2xl font-bold text-purple-600">
            {reportSchedules.filter(s => s.status === 'active').length}
          </p>
          <p className="text-xs text-purple-600 mt-1">Automated reports</p>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h3 className="font-semibold text-orange-800 text-sm">Next Generation</h3>
          <p className="text-2xl font-bold text-orange-600">
            {reportSchedules.filter(s => s.status === 'active').length > 0 ? '2' : '0'}
          </p>
          <p className="text-xs text-orange-600 mt-1">Scheduled reports</p>
        </div>
      </div>

      {/* Report Templates */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Report Templates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTemplates.map((template) => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(template.status)}`}>
                  {template.status.toUpperCase()}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
              
              <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <span className="ml-1 font-medium">{template.type}</span>
                </div>
                <div>
                  <span className="text-gray-600">Format:</span>
                  <span className="ml-1 font-medium">{template.format}</span>
                </div>
              </div>
              
              {template.last_generated && (
                <p className="text-xs text-gray-500 mb-3">
                  Last generated: {template.last_generated}
                </p>
              )}
              
              <button
                onClick={() => handleGenerateReport(template)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
              >
                Generate Report
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Generated Reports */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Generated Reports</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Format</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {generatedReports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.template_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(report.generated_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.format}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {report.file_size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(report.status)}`}>
                      {report.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {report.status === 'completed' && (
                      <button
                        onClick={() => handleDownloadReport(report)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Download
                      </button>
                    )}
                    <button className="text-green-600 hover:text-green-900">
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Schedules */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Report Schedules</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Template</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Run</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Run</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportSchedules.map((schedule) => (
                <tr key={schedule.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {schedule.template_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {schedule.frequency}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(schedule.next_run).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {schedule.last_run ? new Date(schedule.last_run).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(schedule.status)}`}>
                      {schedule.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">
                      Edit
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Pause
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-4">Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
            Create Template
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
            Schedule Report
          </button>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm hover:bg-purple-700 transition-colors">
            Export All
          </button>
          <button className="bg-orange-600 text-white px-4 py-2 rounded-md text-sm hover:bg-orange-700 transition-colors">
            View Archive
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaxReportingTab; 