import { useState, useEffect } from 'react';
import { safetyAPI } from '../services/api';

function SafetyPage() {
  const [areas, setAreas] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [areasResponse, logsResponse] = await Promise.all([
        safetyAPI.getAll(),
        safetyAPI.getLogs(),
      ]);
      setAreas(areasResponse.data.data || []);
      setLogs(logsResponse.data.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load safety data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Safe':
        return 'bg-safe text-white';
      case 'Warning':
        return 'bg-warning text-white';
      case 'Critical':
        return 'bg-critical text-white';
      case 'Maintenance':
        return 'bg-maintenance text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (compliance) => {
    switch (compliance) {
      case 'Compliant':
        return 'bg-green-100 text-green-800';
      case 'NonCompliant':
        return 'bg-red-100 text-red-800';
      case 'Partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Safety Management</h1>
        <p className="mt-2 text-gray-600">Monitor safety areas and compliance</p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Safety Areas */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Safety Areas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area) => (
            <div key={area.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className={`px-6 py-4 ${getStatusColor(area.status)}`}>
                <h3 className="text-lg font-semibold">{area.area_name}</h3>
                <p className="text-sm opacity-90 mt-1">{area.zone}</p>
              </div>

              <div className="px-6 py-4 space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Risk Level</p>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskLevelColor(area.risk_level)}`}>
                    {area.risk_level}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-500">PPE Required</p>
                  <p className="text-sm font-medium text-gray-900">{area.ppe_required}</p>
                </div>

                {area.notes && (
                  <div>
                    <p className="text-sm text-gray-500">Notes</p>
                    <p className="text-sm text-gray-900">{area.notes}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-400">
                    Last Inspection: {new Date(area.last_inspection).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {areas.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500">No safety areas found</p>
          </div>
        )}
      </div>

      {/* Safety Logs */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Safety Logs</h2>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Area
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Zone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  PPE Compliance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Incident Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reported By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.slice(0, 20).map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {log.area_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.zone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getComplianceColor(log.ppe_compliance)}`}>
                      {log.ppe_compliance}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.incident_type || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {log.description || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.reported_by || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {logs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No safety logs found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SafetyPage;

