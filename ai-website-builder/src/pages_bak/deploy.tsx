import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar';
import { api } from '../lib/api';
import type { Deployment, DeploymentLog } from '../lib/types';

export default function Deploy() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const websiteId = searchParams.get('websiteId');

  const [subdomain, setSubdomain] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [logs, setLogs] = useState<DeploymentLog[]>([]);
  const [error, setError] = useState('');

  // Poll for deployment status
  useEffect(() => {
    if (!deployment || deployment.status === 'FAILED' || deployment.status === 'RUNNING') {
      return;
    }

    const interval = setInterval(async () => {
      const response = await api.getDeployment(deployment.id);
      if (response.data) {
        setDeployment(response.data as Deployment);
        
        // Fetch logs
        const logsResponse = await api.getDeploymentLogs(deployment.id);
        if (logsResponse.data) {
          setLogs(logsResponse.data as DeploymentLog[]);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [deployment]);

  // Fetch logs when deployment changes
  useEffect(() => {
    if (deployment) {
      fetchLogs();
    }
  }, [deployment?.id]);

  const fetchLogs = async () => {
    if (!deployment) return;
    
    const response = await api.getDeploymentLogs(deployment.id);
    if (response.data) {
      setLogs(response.data as DeploymentLog[]);
    }
  };

  const handleDeploy = async () => {
    if (!websiteId) {
      setError('No website selected');
      return;
    }

    if (!subdomain || subdomain.trim() === '') {
      setError('Please enter a subdomain');
      return;
    }

    setError('');
    setIsDeploying(true);

    try {
      const response = await api.deployWebsite(websiteId, subdomain.trim());
      
      if (response.error) {
        setError(response.error);
        setIsDeploying(false);
        return;
      }

      if (response.data) {
        setDeployment(response.data as Deployment);
        setIsDeploying(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deployment failed');
      setIsDeploying(false);
    }
  };

  const handleSubdomainChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow lowercase alphanumeric and hyphens
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSubdomain(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return 'text-green-600';
      case 'DEPLOYING':
        return 'text-blue-600';
      case 'FAILED':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RUNNING':
        return '✓';
      case 'DEPLOYING':
        return '⏳';
      case 'FAILED':
        return '✗';
      default:
        return '○';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR':
        return 'text-red-600';
      case 'WARNING':
        return 'text-yellow-600';
      case 'INFO':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  if (!websiteId) {
    return (
      <>
        <AppNavbar currentPage="/deploy" />
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-3xl mx-auto px-4">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">No Website Selected</h1>
              <p className="text-gray-600 mb-6">Please go back to the editor and try again.</p>
              <button
                onClick={() => navigate('/websites')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Go to Websites
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppNavbar currentPage="/deploy" />
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Deploy Website</h1>

            {!deployment ? (
              <div className="space-y-6">
                <div>
                  <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700 mb-2">
                    Choose your subdomain
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id="subdomain"
                      type="text"
                      value={subdomain}
                      onChange={handleSubdomainChange}
                      placeholder="myportfolio"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isDeploying}
                    />
                    <span className="text-gray-600">.webcreator.site</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Only lowercase letters, numbers, and hyphens allowed
                  </p>
                </div>

                {subdomain && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">Your website will be available at:</p>
                    <p className="text-lg font-semibold text-blue-600 mt-1">
                      https://{subdomain}.webcreator.site
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleDeploy}
                  disabled={isDeploying || !subdomain}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-semibold"
                >
                  {isDeploying ? 'Starting Deployment...' : 'Deploy Website'}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xl font-semibold text-gray-900">Deployment Status</h2>
                    <span className={`text-lg font-bold ${getStatusColor(deployment.status)}`}>
                      {getStatusIcon(deployment.status)} {deployment.status}
                    </span>
                  </div>
                  <p className="text-gray-600">Subdomain: {deployment.subdomain}</p>
                  <p className="text-gray-600">Port: {deployment.port}</p>
                </div>

                {deployment.status === 'RUNNING' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-green-900 mb-2">🎉 Deployment Successful!</h3>
                    <p className="text-gray-700 mb-4">Your website is now live at:</p>
                    <a
                      href={deployment.domain}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-semibold"
                    >
                      Visit Website →
                    </a>
                  </div>
                )}

                {deployment.status === 'FAILED' && deployment.error_message && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Deployment Failed</h3>
                    <p className="text-sm text-red-800">{deployment.error_message}</p>
                  </div>
                )}

                {deployment.status === 'DEPLOYING' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-blue-900 font-medium">Deployment in progress...</p>
                    <p className="text-sm text-blue-700 mt-1">This may take a few minutes</p>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Deployment Logs</h3>
                    <button
                      onClick={fetchLogs}
                      className="text-sm text-blue-600 hover:text-blue-700"
                    >
                      Refresh
                    </button>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                    {logs.length === 0 ? (
                      <p className="text-gray-400 text-sm">No logs yet...</p>
                    ) : (
                      <div className="space-y-1">
                        {logs.map((log) => (
                          <div key={log.id} className="font-mono text-sm">
                            <span className="text-gray-500">
                              [{new Date(log.created_at).toLocaleTimeString()}]
                            </span>
                            <span className={`ml-2 font-semibold ${getLogLevelColor(log.level)}`}>
                              [{log.level}]
                            </span>
                            <span className="ml-2 text-gray-300">{log.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/websites')}
                    className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 font-semibold"
                  >
                    Back to Websites
                  </button>
                  {deployment.status === 'RUNNING' && (
                    <a
                      href={deployment.domain}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold text-center"
                    >
                      Open Website
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
