// @flow
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Row, Col, Card, Button, Table, Badge, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Chart from 'react-apexcharts';
import MainLoader from '../../../components/MainLoader';
import ThemeToggle from '../../../components/ThemeToggle';
import { APICore } from '../../../helpers/api/apiCore';
import axios from 'axios';
import './TallyDashboard.css';

const TallyDashboard = () => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [syncStatus, setSyncStatus] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [expandedVoucherRows, setExpandedVoucherRows] = useState([]);
    const [expandedLedgerRows, setExpandedLedgerRows] = useState([]);
    const [expandedStockRows, setExpandedStockRows] = useState([]);
    const navigate = useNavigate();
    const [isVoucherFetching, setIsVoucherFetching] = useState(false);
    const voucherPollRef = useRef(null);

    // Toggle functions
    const toggleVoucherRow = (index) => {
        setExpandedVoucherRows((prev) =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };
    const toggleLedgerRow = (index) => {
        setExpandedLedgerRows((prev) =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };
    const toggleStockRow = (index) => {
        setExpandedStockRows((prev) =>
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };
        // Backend batch voucher fetch function (non-blocking + polling)
        const fetchVouchersFromTally = async () => {
            setError(null);
            try {
                const api = new APICore();
                const loggedInUser = api.getLoggedInUser();
                const token = loggedInUser?.token;
                if (!token) {
                    navigate('/account/login');
                    return;
                }
                setIsVoucherFetching(true);
                // Start background fetch
                const startRes = await axios.post('/tally/fetch-vouchers', {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (startRes.data.status === 202 || startRes.data.status === 200) {
                    // Start polling status every 2s
                    voucherPollRef.current && clearInterval(voucherPollRef.current);
                    voucherPollRef.current = setInterval(async () => {
                        try {
                            const statusRes = await axios.get('/tally/fetch-vouchers/status', {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            const s = statusRes.data?.data || {};
                            setSyncStatus(prev => ({
                                ...(prev || {}),
                                type: 'voucher-fetch',
                                message: s.isRunning ? `Fetching vouchers...` : 'Voucher fetch completed',
                                progress: {
                                    percent: s.percent || 0,
                                    batchCount: s.batchCount || 0,
                                    batchTotal: s.batchTotal || 0,
                                },
                                details: {
                                    vouchers: s.totals?.vouchers || 0,
                                    products: s.totals?.products || 0,
                                    vendors: s.totals?.vendors || 0,
                                    executives: s.totals?.executives || 0,
                                    lastBatch: s.lastBatch || null,
                                    errors: s.errors || [],
                                    dateRange: s.dateRange || null,
                                    checkpoint: s.checkpoint || null
                                },
                                running: s.isRunning,
                                startedAt: s.startedAt,
                                completedAt: s.completedAt
                            }));
                            if (!s.isRunning) {
                                clearInterval(voucherPollRef.current);
                                voucherPollRef.current = null;
                                setIsVoucherFetching(false);
                                // Refresh dashboard numbers after completion
                                await fetchComprehensiveDashboard();
                            }
                        } catch (e) {
                            console.error('Voucher status poll failed:', e);
                        }
                    }, 2000);
                    // Safety timeout: stop after 10 minutes
                    setTimeout(() => {
                        if (voucherPollRef.current) {
                            clearInterval(voucherPollRef.current);
                            voucherPollRef.current = null;
                            setIsVoucherFetching(false);
                        }
                    }, 10 * 60 * 1000);
                } else {
                    setError('Failed to start voucher fetch');
                    setIsVoucherFetching(false);
                }
            } catch (error) {
                setError(error.response?.data?.message || 'Failed to start voucher fetch');
                setIsVoucherFetching(false);
            }
        };
    
    // Get theme from Redux store
    const { layoutColor } = useSelector((state) => ({
        layoutColor: state.Layout.layoutColor,
    }));
    
    // Theme-aware chart colors
    const getChartTheme = () => {
        const isDark = layoutColor === 'dark';
        return {
            colors: isDark ? ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'] 
                          : ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
            textColor: isDark ? '#e3e6f0' : '#6c757d',
            gridColor: isDark ? '#404954' : '#f1f3fa',
            backgroundColor: isDark ? 'transparent' : 'transparent'
        };
    };

    // Chart data validation utility
    const validateChartData = (data, type = 'amount') => {
        if (!Array.isArray(data) || data.length === 0) {
            return [];
        }
        
        return data.map(item => {
            try {
                let value;
                if (type === 'amount') {
                    value = parseFloat(item.totalAmount) || 0;
                } else if (type === 'count') {
                    value = parseFloat(item.count) || 0;
                } else {
                    value = parseFloat(item) || 0;
                }
                
                // Ensure no negative values or NaN
                return Math.max(value, 0);
            } catch (error) {
                console.warn('Chart data validation error:', error);
                return 0;
            }
        });
    };

    // Chart labels validation utility
    const validateChartLabels = (data) => {
        if (!Array.isArray(data) || data.length === 0) {
            return ['No Data'];
        }
        
        return data.map((item, index) => {
            try {
                return item._id || item.name || `Item ${index + 1}`;
            } catch (error) {
                return `Item ${index + 1}`;
            }
        });
    };

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // First test the health endpoint
            console.log('Testing health endpoint...');
            const healthResponse = await axios.get('/tally/health');
            console.log('Health check:', healthResponse.data);
            
            // Get token from the API Core (sessionStorage)
            const api = new APICore();
            const loggedInUser = api.getLoggedInUser();
            const token = loggedInUser?.token;
            
            console.log('=== TALLY DASHBOARD AUTH DEBUG ===');
            console.log('Is authenticated:', api.isUserAuthenticated());
            console.log('Logged in user:', loggedInUser);
            console.log('Token exists:', !!token);
            console.log('Session storage role:', sessionStorage.getItem('role'));
            console.log('Session storage hyper_user:', sessionStorage.getItem('hyper_user'));
            console.log('=====================================');
            
            if (!token) {
                console.log('No authentication token found, redirecting to login...');
                setError('Authentication required. Please log in.');
                navigate('/account/login');
                return;
            }
            
            console.log('Fetching dashboard data with token...');
            const response = await axios.get('/tally/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('Dashboard response:', response.data);
            
            if (response.data.status === 200) {
                setDashboardData(response.data.data);
                setError(null);
            } else {
                setError(`Server returned status: ${response.data.status}`);
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            console.error('Error response:', error.response);
            
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch dashboard data';
            
            // If it's an authentication error, redirect to login
            if (error.response?.status === 401) {
                console.log('Authentication failed, redirecting to login...');
                const api = new APICore();
                api.setLoggedInUser(null);
                setError('Authentication failed. Redirecting to login...');
                setTimeout(() => navigate('/account/login'), 2000);
                return;
            }
            
            setError(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    // Test Tally connection
    const testConnection = async () => {
        setLoading(true);
        try {
            const api = new APICore();
            const loggedInUser = api.getLoggedInUser();
            const token = loggedInUser?.token;
            
            if (!token) {
                navigate('/account/login');
                return;
            }
            
            const response = await axios.get('/tally/test-connection', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.status === 200) {
                setConnectionStatus(response.data.data);
                if (response.data.data.success) {
                    setError(null);
                } else {
                    setError(response.data.data.message);
                }
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Connection test failed');
        } finally {
            setLoading(false);
        }
    };

    // Check sync status
    const checkSyncStatus = async () => {
        try {
            const api = new APICore();
            const loggedInUser = api.getLoggedInUser();
            const token = loggedInUser?.token;
            
            if (!token) return;
            
            const response = await axios.get('/tally/sync/status', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.status === 200) {
                setIsSyncing(response.data.data.isRunning);
            }
        } catch (error) {
            console.error('Failed to check sync status:', error);
        }
    };

    // Manual sync trigger (background sync)
    const triggerSync = async () => {
        setLoading(true);
        try {
            const api = new APICore();
            const loggedInUser = api.getLoggedInUser();
            const token = loggedInUser?.token;
            
            if (!token) {
                navigate('/account/login');
                return;
            }
            
            // Use the background sync endpoint
            const response = await axios.post('/tally/sync/manual', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.status === 200) {
                setSyncStatus({ 
                    message: response.data.message,
                    triggered: true,
                    timestamp: response.data.data?.timestamp
                });
                setError(null);
                setIsSyncing(true);
                
                // Poll sync status and refresh data when complete
                const pollInterval = setInterval(async () => {
                    await checkSyncStatus();
                    const statusResponse = await axios.get('/tally/sync/status', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (!statusResponse.data.data.isRunning) {
                        setIsSyncing(false);
                        clearInterval(pollInterval);
                        await fetchDashboardData(); // Refresh dashboard
                        setSyncStatus(prev => ({...prev, completed: true}));
                    }
                }, 2000); // Check every 2 seconds
                
                // Clear polling after 2 minutes max
                setTimeout(() => {
                    clearInterval(pollInterval);
                    setIsSyncing(false);
                }, 120000);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Sync trigger failed');
        } finally {
            setLoading(false);
        }
    };

    // Enhanced comprehensive sync trigger
    const triggerComprehensiveSync = async () => {
        setLoading(true);
        try {
            const api = new APICore();
            const loggedInUser = api.getLoggedInUser();
            const token = loggedInUser?.token;
            
            if (!token) {
                navigate('/account/login');
                return;
            }
            
            // Use the comprehensive sync endpoint
            const response = await axios.post('/tally/sync/comprehensive', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.status === 200) {
                setSyncStatus({ 
                    message: `Comprehensive sync completed! ${response.data.data.syncResults?.totalSynced || 0} records synced`,
                    triggered: true,
                    timestamp: response.data.data?.syncedAt,
                    details: response.data.data.syncResults
                });
                setError(null);
                await fetchDashboardData(); // Refresh dashboard immediately
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Comprehensive sync failed');
        } finally {
            setLoading(false);
        }
    };

    // Fetch comprehensive dashboard data
    const fetchComprehensiveDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const api = new APICore();
            const loggedInUser = api.getLoggedInUser();
            const token = loggedInUser?.token;
            
            if (!token) {
                setError('Authentication required. Please log in.');
                navigate('/account/login');
                return;
            }
            
            console.log('Fetching comprehensive dashboard data...');
            const response = await axios.get('/tally/dashboard/comprehensive', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            console.log('Comprehensive dashboard response:', response.data);
            
            if (response.data.status === 200) {
                setDashboardData(response.data.data);
                setError(null);
            } else {
                setError(`Server returned status: ${response.data.status}`);
            }
        } catch (error) {
            console.error('Comprehensive dashboard fetch error:', error);
            
            const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch comprehensive dashboard data';
            
            if (error.response?.status === 401) {
                const api = new APICore();
                api.setLoggedInUser(null);
                setError('Authentication failed. Redirecting to login...');
                setTimeout(() => navigate('/account/login'), 2000);
                return;
            }
            
            setError(`Error: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        // Try comprehensive dashboard first, fallback to regular dashboard
        const loadDashboard = async () => {
            try {
                await fetchComprehensiveDashboard();
            } catch (error) {
                console.log('Comprehensive dashboard not available, using regular dashboard');
                await fetchDashboardData();
            }
        };
        
        loadDashboard();
        checkSyncStatus(); // Check if sync is already running
        
        // Debug authentication state
        const api = new APICore();
        const loggedInUser = api.getLoggedInUser();
        const isAuthenticated = api.isUserAuthenticated();
        console.log('=== TALLY DASHBOARD AUTH DEBUG ===');
        console.log('Is authenticated:', isAuthenticated);
        console.log('Logged in user:', loggedInUser);
        console.log('Token exists:', !!loggedInUser?.token);
        console.log('Session storage role:', sessionStorage.getItem('role'));
        console.log('=====================================');
    }, [fetchDashboardData, fetchComprehensiveDashboard]);

    useEffect(() => {
        return () => {
            if (voucherPollRef.current) {
                clearInterval(voucherPollRef.current);
                voucherPollRef.current = null;
            }
        };
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                <div className="text-center">
                    <MainLoader />
                    <p className="mt-3">Loading Tally Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Row>
                <Col xs={12}>
                    <div className="page-title-box">
                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2 gap-sm-3">
                                <h4 className="page-title mb-0">
                                    <i className="mdi mdi-view-dashboard me-2"></i>
                                    Tally Dashboard
                                </h4>
                                <ThemeToggle size="sm" className="theme-toggle-dashboard" />
                            </div>
                            <div className="d-flex flex-wrap align-items-center gap-2">
                                <Button 
                                    variant="info" 
                                    size="sm"
                                    onClick={testConnection} 
                                    disabled={loading}
                                    className="d-flex align-items-center"
                                >
                                    <i className="mdi mdi-connection me-1"></i> 
                                    <span className="d-none d-sm-inline">Test Connection</span>
                                    <span className="d-inline d-sm-none">Test</span>
                                </Button>
                                <Button 
                                    variant="primary" 
                                    size="sm"
                                    onClick={fetchComprehensiveDashboard} 
                                    disabled={loading}
                                    className="d-flex align-items-center"
                                >
                                    <i className="mdi mdi-refresh me-1"></i> 
                                    <span className="d-none d-md-inline">Refresh</span>
                                    <span className="d-inline d-md-none">
                                        <i className="mdi mdi-refresh"></i>
                                    </span>
                                </Button>
                                <Button 
                                    variant="warning" 
                                    size="sm"
                                    onClick={triggerSync} 
                                    disabled={loading || isSyncing}
                                    className="d-flex align-items-center"
                                >
                                    <i className={`mdi ${isSyncing ? 'mdi-sync mdi-spin' : 'mdi-sync'} me-1`}></i> 
                                    <span className="d-none d-md-inline">
                                        {isSyncing ? 'Basic Sync...' : 'Basic Sync'}
                                    </span>
                                    <span className="d-inline d-md-none">Sync</span>
                                </Button>
                                <Button 
                                    variant="success" 
                                    size="sm"
                                    onClick={triggerComprehensiveSync} 
                                    disabled={loading}
                                    className="d-flex align-items-center"
                                >
                                    <i className="mdi mdi-database-sync me-1"></i> 
                                    <span className="d-none d-lg-inline">Full Sync</span>
                                    <span className="d-inline d-lg-none">Full</span>
                                </Button>
                                <Button
                                    variant={isVoucherFetching ? 'secondary' : 'outline-info'}
                                    size="sm"
                                    onClick={fetchVouchersFromTally}
                                    disabled={loading || isSyncing || isVoucherFetching}
                                    className="d-flex align-items-center"
                                >
                                    <i className={`mdi ${isVoucherFetching ? 'mdi-sync mdi-spin' : 'mdi-cloud-download'} me-1`}></i> 
                                    <span className="d-none d-xl-inline">
                                        {isVoucherFetching ? 'Fetching Vouchers...' : 'Start Voucher Fetch'}
                                    </span>
                                    <span className="d-inline d-xl-none">
                                        {isVoucherFetching ? 'Fetching...' : 'Vouchers'}
                                    </span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Sticky top progress bar for voucher batches */}
            {syncStatus?.type === 'voucher-fetch' && (
                <div style={{ position: 'sticky', top: 0, zIndex: 1040 }}>
                    <div className="alert alert-info mb-3 py-2">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <strong><i className="mdi mdi-file-document me-2"></i>Voucher Fetch</strong>
                                <span className="ms-2">{syncStatus.message}</span>
                                {syncStatus.details?.dateRange && (
                                    <small className="d-block text-muted">
                                        Date range: {new Date(syncStatus.details.dateRange.from).toLocaleDateString()} - {new Date(syncStatus.details.dateRange.to).toLocaleDateString()}
                                    </small>
                                )}
                                {syncStatus.details?.lastBatch && (
                                    <small className="d-block text-muted">Last batch: {syncStatus.details.lastBatch.range} • {syncStatus.details.lastBatch.count} vouchers</small>
                                )}
                            </div>
                            <div style={{ minWidth: 220 }}>
                                <ProgressBar now={syncStatus.progress?.percent || 0} label={`${syncStatus.progress?.percent || 0}%`} animated striped />
                                <div className="d-flex justify-content-between mt-1">
                                    <small>Batch {syncStatus.progress?.batchCount || 0}/{syncStatus.progress?.batchTotal || 0}</small>
                                    <small>Total: {syncStatus.details?.vouchers || 0}</small>
                                </div>
                            </div>
                        </div>
                        {syncStatus.details?.errors && syncStatus.details.errors.length > 0 && (
                            <small className="text-danger d-block mt-1">Errors: {syncStatus.details.errors.length}</small>
                        )}
                    </div>
                </div>
            )}

            {connectionStatus && (
                <Row>
                    <Col xs={12}>
                        <div className={`alert ${connectionStatus.success ? 'alert-success' : 'alert-warning'}`}>
                            <strong>Connection Status:</strong> {connectionStatus.message}
                        </div>
                    </Col>
                </Row>
            )}

            {error && (
                <Row>
                    <Col xs={12}>
                        <div className="alert alert-danger">
                            <strong>Error:</strong> {error}
                            <div className="mt-2">
                                <small>
                                    Make sure you're logged in and the server is running. 
                                    Check the browser console for more details.
                                </small>
                            </div>
                        </div>
                    </Col>
                </Row>
            )}

            {syncStatus && (
                <Row>
                    <Col xs={12}>
                        <div className={`alert ${isSyncing ? 'alert-info' : 'alert-success'}`}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>
                                        {isSyncing ? 
                                            <><i className="mdi mdi-sync mdi-spin me-2"></i>Sync in Progress...</> :
                                            <><i className="mdi mdi-check-circle me-2"></i>Sync Status</>
                                        }
                                    </strong>
                                    <p className="mb-0">{syncStatus.message}</p>
                                    {syncStatus.timestamp && (
                                        <small className="text-muted">
                                            Triggered at: {new Date(syncStatus.timestamp).toLocaleString()}
                                        </small>
                                    )}
                                    {syncStatus.completed && (
                                        <small className="text-success d-block">
                                            <i className="mdi mdi-check me-1"></i>Sync completed! Dashboard data refreshed.
                                        </small>
                                    )}
                                    {syncStatus.details && (
                                        <div className="mt-2">
                                            <small className="text-muted d-block">
                                                <strong>Sync Details:</strong>
                                            </small>
                                            <Row className="mt-1">
                                                <Col sm={2}>
                                                    <small>
                                                        <i className="mdi mdi-office-building me-1"></i>
                                                        Companies: <strong>{syncStatus.details.companies}</strong>
                                                    </small>
                                                </Col>
                                                <Col sm={2}>
                                                    <small>
                                                        <i className="mdi mdi-account-multiple me-1"></i>
                                                        Ledgers: <strong>{syncStatus.details.ledgers}</strong>
                                                    </small>
                                                </Col>
                                                <Col sm={2}>
                                                    <small>
                                                        <i className="mdi mdi-sitemap me-1"></i>
                                                        Groups: <strong>{syncStatus.details.groups}</strong>
                                                    </small>
                                                </Col>
                                                <Col sm={2}>
                                                    <small>
                                                        <i className="mdi mdi-package-variant me-1"></i>
                                                        Stock Items: <strong>{syncStatus.details.stockItems}</strong>
                                                    </small>
                                                </Col>
                                                <Col sm={2}>
                                                    <small>
                                                        <i className="mdi mdi-file-document me-1"></i>
                                                        Vouchers: <strong>{syncStatus.details.vouchers}</strong>
                                                    </small>
                                                </Col>
                                                <Col sm={2}>
                                                    <small>
                                                        <i className="mdi mdi-currency-usd me-1"></i>
                                                        Cost Centers: <strong>{syncStatus.details.costCenters}</strong>
                                                    </small>
                                                </Col>
                                            </Row>
                                            {syncStatus.details.errors && syncStatus.details.errors.length > 0 && (
                                                <div className="mt-2">
                                                    <small className="text-warning d-block">
                                                        <i className="mdi mdi-alert me-1"></i>
                                                        Sync Warnings: {syncStatus.details.errors.length}
                                                    </small>
                                                    <details className="mt-1">
                                                        <summary><small>View Details</small></summary>
                                                        <ul className="mt-1 mb-0">
                                                            {syncStatus.details.errors.map((error, index) => (
                                                                <li key={index}><small>{error}</small></li>
                                                            ))}
                                                        </ul>
                                                    </details>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {!isSyncing && (
                                    <Button 
                                        variant="outline-secondary" 
                                        size="sm" 
                                        onClick={() => setSyncStatus(null)}
                                    >
                                        <i className="mdi mdi-close"></i>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>
            )}

            {!dashboardData && !loading && !error && (
                <Row>
                    <Col xs={12}>
                        <Card>
                            <Card.Body className="text-center">
                                <h5>No Data Available</h5>
                                <p>
                                    No Tally data has been synced yet. Click "Sync Now" to fetch data from Tally.
                                </p>
                                <Button variant="primary" onClick={triggerSync}>
                                    <i className="mdi mdi-sync"></i> Start Initial Sync
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {dashboardData && (
                <>
                    {/* Quick Actions Overview */}
                    <Row className="mb-3 fade-in">
                        <Col xs={12}>
                            <Card className="quick-actions-card">
                                <Card.Body className="fade-in">
                                    <Row className="align-items-center">
                                        <Col md={8}>
                                            <h5 className="mb-1">
                                                <i className="mdi mdi-view-dashboard me-2"></i>
                                                <span className="gradient-text">Tally Data Overview</span>
                                            </h5>
                                            <p className="mb-0" style={{ color: 'rgba(255,255,255,0.8)' }}>
                                                Quick access to detailed views and comprehensive analytics for all your Tally data
                                            </p>
                                        </Col>
                                        <Col md={4} className="text-end">
                                            <div className="d-flex gap-2 justify-content-end flex-wrap">
                                                <Button 
                                                    variant="light" 
                                                    size="sm"
                                                    onClick={() => navigate('/tally-comprehensive-detail')}
                                                    title="Comprehensive analytics with charts and insights"
                                                    className="slide-in-right see-more-btn"
                                                >
                                                    <i className="mdi mdi-chart-timeline-variant"></i> Analytics Hub
                                                </Button>
                                                <Button 
                                                    variant="light" 
                                                    size="sm"
                                                    onClick={() => navigate('/tally-vouchers-detail')}
                                                    title="Detailed voucher management"
                                                    className="slide-in-right see-more-btn"
                                                >
                                                    <i className="mdi mdi-file-document-multiple"></i> Vouchers
                                                </Button>
                                                <Button 
                                                    variant="light" 
                                                    size="sm"
                                                    onClick={() => navigate('/tally-ledgers-detail')}
                                                    title="Sundry Debtors balance analysis"
                                                    className="slide-in-right see-more-btn"
                                                >
                                                    <i className="mdi mdi-account-multiple"></i> Sundry Debtors
                                                </Button>
                                                <Button 
                                                    variant="light" 
                                                    size="sm"
                                                    onClick={() => navigate('/tally-stock-items-detail')}
                                                    title="Stock inventory management"
                                                    className="slide-in-right see-more-btn"
                                                >
                                                    <i className="mdi mdi-package-variant"></i> Inventory
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Enhanced Summary Cards */}
                    <Row className="fade-in g-3">
                        <Col xs={12} sm={6} lg={4} xl={2}>
                            <Card className="widget-flat success-indicator h-100">
                                <Card.Body className="fade-in d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="flex-grow-1">
                                            <h6 className="text-muted fw-normal mb-2">Companies</h6>
                                            <h3 className="mb-0">{dashboardData.summary?.companies || 0}</h3>
                                        </div>
                                        <div className="widget-icon bg-primary">
                                            <i className="mdi mdi-office-building"></i>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-auto">
                                        <div className="d-flex align-items-center">
                                            <span className="text-success me-2">
                                                <i className="mdi mdi-arrow-up-bold"></i>
                                            </span>
                                            <span className="text-muted small">Active entities</span>
                                        </div>
                                        <Button 
                                            variant="link" 
                                            size="sm" 
                                            className="p-1 text-decoration-none"
                                            onClick={() => navigate('/tally-comprehensive-detail')}
                                            title="View company details"
                                        >
                                            <i className="mdi mdi-eye text-primary"></i>
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} sm={6} lg={4} xl={2}>
                            <Card className="widget-flat success-indicator h-100">
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="flex-grow-1">
                                            <h6 className="text-muted fw-normal mb-2">Sundry Debtors</h6>
                                            <h3 className="mb-0">{dashboardData.summary?.ledgers || 0}</h3>
                                        </div>
                                        <div className="widget-icon bg-success">
                                            <i className="mdi mdi-account-multiple"></i>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-auto">
                                        <div className="d-flex align-items-center">
                                            <span className="text-success me-2">
                                                <i className="mdi mdi-arrow-up-bold"></i>
                                            </span>
                                            <span className="text-muted small">Account heads</span>
                                        </div>
                                        <Button 
                                            variant="link" 
                                            size="sm" 
                                            className="p-1 text-decoration-none"
                                            onClick={() => navigate('/tally-ledgers-detail')}
                                            title="Manage Sundry Debtors"
                                        >
                                            <i className="mdi mdi-eye text-success"></i>
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} sm={6} lg={4} xl={2}>
                            <Card className="widget-flat success-indicator h-100">
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="flex-grow-1">
                                            <h6 className="text-muted fw-normal mb-2">Groups</h6>
                                            <h3 className="mb-0">{dashboardData.summary?.groups || 0}</h3>
                                        </div>
                                        <div className="widget-icon bg-info">
                                            <i className="mdi mdi-sitemap"></i>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-auto">
                                        <div className="d-flex align-items-center">
                                            <span className="text-info me-2">
                                                <i className="mdi mdi-arrow-up-bold"></i>
                                            </span>
                                            <span className="text-muted small">Account groups</span>
                                        </div>
                                        <Button 
                                            variant="link" 
                                            size="sm" 
                                            className="p-1 text-decoration-none"
                                            onClick={() => navigate('/tally-comprehensive-detail')}
                                            title="View group analytics"
                                        >
                                            <i className="mdi mdi-chart-bar text-info"></i>
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} sm={6} lg={4} xl={2}>
                            <Card className="widget-flat success-indicator h-100">
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="flex-grow-1">
                                            <h6 className="text-muted fw-normal mb-2">Stock Items</h6>
                                            <h3 className="mb-0">{dashboardData.summary?.stockItems || 0}</h3>
                                        </div>
                                        <div className="widget-icon bg-warning">
                                            <i className="mdi mdi-package-variant"></i>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-auto">
                                        <div className="d-flex align-items-center">
                                            <span className="text-warning me-2">
                                                <i className="mdi mdi-arrow-up-bold"></i>
                                            </span>
                                            <span className="text-muted small">Inventory items</span>
                                        </div>
                                        <Button 
                                            variant="link" 
                                            size="sm" 
                                            className="p-1 text-decoration-none"
                                            onClick={() => navigate('/tally-stock-items-detail')}
                                            title="Manage inventory"
                                        >
                                            <i className="mdi mdi-eye text-warning"></i>
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} sm={6} lg={4} xl={2}>
                            <Card className="widget-flat success-indicator h-100">
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="flex-grow-1">
                                            <h6 className="text-muted fw-normal mb-2">Vouchers</h6>
                                            <h3 className="mb-0">{dashboardData.summary?.vouchers || 0}</h3>
                                        </div>
                                        <div className="widget-icon bg-danger">
                                            <i className="mdi mdi-file-document"></i>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-auto">
                                        <div className="d-flex align-items-center">
                                            <span className="text-danger me-2">
                                                <i className="mdi mdi-arrow-up-bold"></i>
                                            </span>
                                            <span className="text-muted small">Transactions</span>
                                        </div>
                                        <Button 
                                            variant="link" 
                                            size="sm" 
                                            className="p-1 text-decoration-none"
                                            onClick={() => navigate('/tally-vouchers-detail')}
                                            title="View all vouchers"
                                        >
                                            <i className="mdi mdi-eye text-danger"></i>
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} sm={6} lg={4} xl={2}>
                            <Card className="widget-flat success-indicator h-100">
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="flex-grow-1">
                                            <h6 className="text-muted fw-normal mb-2">Currencies</h6>
                                            <h3 className="mb-0">{dashboardData.summary?.currencies || 0}</h3>
                                        </div>
                                        <div className="widget-icon bg-secondary">
                                            <i className="mdi mdi-currency-usd"></i>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-auto">
                                        <div className="d-flex align-items-center">
                                            <span className="text-secondary me-2">
                                                <i className="mdi mdi-arrow-up-bold"></i>
                                            </span>
                                            <span className="text-muted small">Currency types</span>
                                        </div>
                                        <Button 
                                            variant="link" 
                                            size="sm" 
                                            className="p-1 text-decoration-none"
                                            onClick={() => navigate('/tally-comprehensive-detail')}
                                            title="View currency details"
                                        >
                                            <i className="mdi mdi-chart-timeline-variant text-secondary"></i>
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Financial Summary Row */}
                    <Row className="g-3">
                        <Col xs={12} md={6} xl={4}>
                            <Card className="widget-flat financial-card h-100">
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="flex-grow-1">
                                            <h6 className="text-muted fw-normal mb-2">Total Opening Balance</h6>
                                            <h3 className="mb-0 text-success">
                                                ₹{dashboardData.financialSummary?.totalOpeningBalance?.toLocaleString() || '0'}
                                            </h3>
                                        </div>
                                        <div className="widget-icon bg-success">
                                            <i className="mdi mdi-bank"></i>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-auto">
                                        <div className="d-flex align-items-center">
                                            <span className="text-success me-2">
                                                <i className="mdi mdi-trending-up"></i>
                                            </span>
                                            <span className="text-muted small">Sum of opening balances</span>
                                        </div>
                                        <Button 
                                            variant="link" 
                                            size="sm" 
                                            className="p-1 text-decoration-none"
                                            onClick={() => navigate('/tally-ledgers-detail')}
                                            title="View Sundry Debtors opening balances"
                                        >
                                            <i className="mdi mdi-eye text-success"></i>
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} md={6} xl={4}>
                            <Card className="widget-flat financial-card h-100">
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="flex-grow-1">
                                            <h6 className="text-muted fw-normal mb-2">Total Closing Balance</h6>
                                            <h3 className="mb-0 text-primary">
                                                ₹{dashboardData.financialSummary?.totalClosingBalance?.toLocaleString() || '0'}
                                            </h3>
                                        </div>
                                        <div className="widget-icon bg-primary">
                                            <i className="mdi mdi-cash-multiple"></i>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-auto">
                                        <div className="d-flex align-items-center">
                                            <span className="text-primary me-2">
                                                <i className="mdi mdi-trending-up"></i>
                                            </span>
                                            <span className="text-muted small">Sum of closing balances</span>
                                        </div>
                                        <Button 
                                            variant="link" 
                                            size="sm" 
                                            className="p-1 text-decoration-none"
                                            onClick={() => navigate('/tally-ledgers-detail')}
                                            title="View Sundry Debtors closing balances"
                                        >
                                            <i className="mdi mdi-eye text-primary"></i>
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} md={12} xl={4}>
                            <Card className="widget-flat financial-card h-100">
                                <Card.Body className="d-flex flex-column">
                                    <div className="d-flex justify-content-between align-items-start mb-3">
                                        <div className="flex-grow-1">
                                            <h6 className="text-muted fw-normal mb-2">Net Change</h6>
                                            <h3 className={`mb-0 ${
                                                ((dashboardData.financialSummary?.totalClosingBalance || 0) - 
                                                 (dashboardData.financialSummary?.totalOpeningBalance || 0)) >= 0 
                                                ? 'text-success' : 'text-danger'
                                            }`}>
                                                ₹{((dashboardData.financialSummary?.totalClosingBalance || 0) - 
                                                   (dashboardData.financialSummary?.totalOpeningBalance || 0)).toLocaleString()}
                                            </h3>
                                        </div>
                                        <div className="widget-icon bg-info">
                                            <i className="mdi mdi-chart-line"></i>
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center mt-auto">
                                        <div className="d-flex align-items-center">
                                            <span className={`me-2 ${
                                                ((dashboardData.financialSummary?.totalClosingBalance || 0) - 
                                                 (dashboardData.financialSummary?.totalOpeningBalance || 0)) >= 0 
                                                ? 'text-success' : 'text-danger'
                                            }`}>
                                                <i className={`mdi ${
                                                    ((dashboardData.financialSummary?.totalClosingBalance || 0) - 
                                                     (dashboardData.financialSummary?.totalOpeningBalance || 0)) >= 0 
                                                    ? 'mdi-trending-up' : 'mdi-trending-down'
                                                }`}></i>
                                            </span>
                                            <span className="text-muted small">Difference from opening</span>
                                        </div>
                                        <Button 
                                            variant="link" 
                                            size="sm" 
                                            className="p-1 text-decoration-none"
                                            onClick={() => navigate('/tally-comprehensive-detail')}
                                            title="View comprehensive financial analysis"
                                        >
                                            <i className="mdi mdi-chart-timeline-variant text-info"></i>
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Enhanced Charts Row */}
                    <Row className="fade-in g-3">
                        <Col xs={12} lg={6}>
                            <Card className="chart-container h-100">
                                <Card.Body>
                                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3">
                                        <h4 className="header-title mb-2 mb-sm-0">
                                            <i className="mdi mdi-chart-pie me-2"></i>
                                            Voucher Types Distribution
                                        </h4>
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            className="see-more-btn d-flex align-items-center"
                                            onClick={() => navigate('/tally-vouchers-detail')}
                                            title="View detailed vouchers list"
                                        >
                                            <i className="mdi mdi-arrow-right me-1"></i> 
                                            <span className="d-none d-sm-inline">See More</span>
                                            <span className="d-inline d-sm-none">Details</span>
                                        </Button>
                                    </div>
                                    {dashboardData.voucherSummary && dashboardData.voucherSummary.length > 0 ? (
                                        <Chart
                                            key={`voucher-pie-${dashboardData.voucherSummary.length}-${Date.now()}`}
                                            options={{
                                                chart: { 
                                                    type: 'pie', 
                                                    height: 300,
                                                    background: 'transparent',
                                                    animations: {
                                                        enabled: true,
                                                        easing: 'easeinout',
                                                        speed: 800,
                                                        animateGradually: {
                                                            enabled: true,
                                                            delay: 150
                                                        },
                                                        dynamicAnimation: {
                                                            enabled: true,
                                                            speed: 350
                                                        }
                                                    },
                                                    redrawOnParentResize: true,
                                                    redrawOnWindowResize: true,
                                                    fontFamily: 'inherit'
                                                },
                                                theme: {
                                                    mode: layoutColor === 'dark' ? 'dark' : 'light'
                                                },
                                                labels: validateChartLabels(dashboardData.voucherSummary),
                                                colors: getChartTheme().colors,
                                                legend: { 
                                                    position: 'bottom',
                                                    horizontalAlign: 'center',
                                                    floating: false,
                                                    fontSize: '14px',
                                                    fontFamily: 'inherit',
                                                    fontWeight: 400,
                                                    labels: {
                                                        colors: getChartTheme().textColor,
                                                        useSeriesColors: false
                                                    },
                                                    markers: {
                                                        width: 12,
                                                        height: 12,
                                                        strokeWidth: 0,
                                                        radius: 12
                                                    },
                                                    itemMargin: {
                                                        horizontal: 10,
                                                        vertical: 5
                                                    }
                                                },
                                                plotOptions: {
                                                    pie: {
                                                        startAngle: -90,
                                                        endAngle: 270,
                                                        expandOnClick: false
                                                    }
                                                },
                                                dataLabels: {
                                                    enabled: true,
                                                    style: {
                                                        fontSize: '12px',
                                                        fontFamily: 'inherit',
                                                        fontWeight: 'bold',
                                                        colors: ['#fff']
                                                    },
                                                    background: {
                                                        enabled: false
                                                    },
                                                    dropShadow: {
                                                        enabled: false
                                                    },
                                                    formatter: function (val, opts) {
                                                        try {
                                                            const seriesIndex = opts.seriesIndex;
                                                            if (seriesIndex >= 0 && seriesIndex < dashboardData.voucherSummary.length) {
                                                                const count = dashboardData.voucherSummary[seriesIndex].count || 0;
                                                                const percentage = parseFloat(val);
                                                                return percentage > 5 ? count.toString() : '';
                                                            }
                                                            return '';
                                                        } catch (error) {
                                                            console.warn('DataLabel formatting error:', error);
                                                            return '';
                                                        }
                                                    }
                                                },
                                                tooltip: {
                                                    enabled: true,
                                                    theme: layoutColor === 'dark' ? 'dark' : 'light',
                                                    style: {
                                                        fontSize: '14px',
                                                        fontFamily: 'inherit'
                                                    },
                                                    y: {
                                                        formatter: function(val, opts) {
                                                            try {
                                                                const seriesIndex = opts.seriesIndex;
                                                                if (seriesIndex >= 0 && seriesIndex < dashboardData.voucherSummary.length) {
                                                                    const summary = dashboardData.voucherSummary[seriesIndex];
                                                                    const count = summary.count || 0;
                                                                    const amount = summary.totalAmount || 0;
                                                                    const avgAmount = count > 0 ? (amount / count) : 0;
                                                                    
                                                                    return `Count: ${count}
Amount: ₹${amount.toLocaleString('en-IN')}
Avg: ₹${avgAmount.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
                                                                }
                                                                return `Count: ${val}`;
                                                            } catch (error) {
                                                                console.warn('Tooltip formatting error:', error);
                                                                return `Count: ${val}`;
                                                            }
                                                        }
                                                    }
                                                },
                                                responsive: [{
                                                    breakpoint: 768,
                                                    options: {
                                                        chart: {
                                                            height: 250
                                                        },
                                                        legend: {
                                                            position: 'bottom',
                                                            fontSize: '12px'
                                                        }
                                                    }
                                                }],
                                                stroke: {
                                                    show: false,
                                                    width: 0
                                                },
                                                fill: {
                                                    type: 'gradient',
                                                    gradient: {
                                                        shade: 'light',
                                                        type: 'horizontal',
                                                        shadeIntensity: 0.5,
                                                        gradientToColors: undefined,
                                                        inverseColors: true,
                                                        opacityFrom: 1,
                                                        opacityTo: 1,
                                                        stops: [0, 50, 100]
                                                    }
                                                }
                                            }}
                                            series={validateChartData(dashboardData.voucherSummary, 'count')}
                                            type="pie"
                                            height={300}
                                        />
                                    ) : (
                                        <div className="text-center text-muted py-5">
                                            <i className="mdi mdi-chart-pie mdi-48px"></i>
                                            <p>No voucher data available</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col xs={12} lg={6}>
                            <Card className="chart-container h-100">
                                <Card.Body>
                                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3">
                                        <h4 className="header-title mb-2 mb-sm-0">
                                            <i className="mdi mdi-sitemap me-2"></i>
                                            Group Summary by Nature
                                        </h4>
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            className="see-more-btn d-flex align-items-center"
                                            onClick={() => navigate('/tally-comprehensive-detail')}
                                            title="View comprehensive analytics"
                                        >
                                            <i className="mdi mdi-chart-bar me-1"></i> 
                                            <span className="d-none d-sm-inline">Analyze</span>
                                            <span className="d-inline d-sm-none">Charts</span>
                                        </Button>
                                    </div>
                                    {dashboardData.groupSummary && dashboardData.groupSummary.length > 0 ? (
                                        <Chart
                                            options={{
                                                chart: { 
                                                    type: 'bar', 
                                                    height: 300,
                                                    background: 'transparent'
                                                },
                                                theme: {
                                                    mode: layoutColor === 'dark' ? 'dark' : 'light'
                                                },
                                                xaxis: { 
                                                    categories: dashboardData.groupSummary.map(item => item._id || 'Other'),
                                                    labels: {
                                                        style: {
                                                            colors: getChartTheme().textColor
                                                        }
                                                    }
                                                },
                                                yaxis: {
                                                    labels: {
                                                        style: {
                                                            colors: getChartTheme().textColor
                                                        }
                                                    }
                                                },
                                                colors: [getChartTheme().colors[0]],
                                                plotOptions: {
                                                    bar: {
                                                        horizontal: false,
                                                        columnWidth: '50%',
                                                    }
                                                },
                                                dataLabels: {
                                                    enabled: true,
                                                    style: {
                                                        colors: ['#fff']
                                                    }
                                                },
                                                grid: {
                                                    borderColor: getChartTheme().gridColor
                                                },
                                                tooltip: {
                                                    theme: layoutColor === 'dark' ? 'dark' : 'light',
                                                    y: {
                                                        formatter: function(val, opts) {
                                                            const group = dashboardData.groupSummary[opts.dataPointIndex];
                                                            return `Groups: ${val}<br/>Opening: ₹${group.totalOpeningBalance?.toLocaleString() || 0}<br/>Closing: ₹${group.totalClosingBalance?.toLocaleString() || 0}`;
                                                        }
                                                    }
                                                }
                                            }}
                                            series={[{
                                                name: 'Groups',
                                                data: dashboardData.groupSummary.map(item => item.count)
                                            }]}
                                            type="bar"
                                            height={300}
                                        />
                                    ) : (
                                        <div className="text-center text-muted py-5">
                                            <i className="mdi mdi-chart-bar mdi-48px"></i>
                                            <p>No group data available</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Stock Summary Chart */}
                    <Row className="g-3">
                        <Col xs={12}>
                            <Card className="chart-container">
                                <Card.Body>
                                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3">
                                        <h4 className="header-title mb-2 mb-sm-0">
                                            <i className="mdi mdi-package-variant me-2"></i>
                                            Stock Summary by Category
                                        </h4>
                                        <Button 
                                            variant="outline-primary" 
                                            size="sm"
                                            className="d-flex align-items-center"
                                            onClick={() => navigate('/tally-stock-items-detail')}
                                            title="View detailed stock items list"
                                        >
                                            <i className="mdi mdi-package-variant me-1"></i> 
                                            <span className="d-none d-md-inline">View Stock Details</span>
                                            <span className="d-inline d-md-none">Stock Details</span>
                                        </Button>
                                    </div>
                                    {dashboardData.stockSummary && dashboardData.stockSummary.length > 0 ? (
                                        <Chart
                                            options={{
                                                chart: { 
                                                    type: 'bar', 
                                                    height: 350,
                                                    background: 'transparent'
                                                },
                                                theme: {
                                                    mode: layoutColor === 'dark' ? 'dark' : 'light'
                                                },
                                                xaxis: { 
                                                    categories: dashboardData.stockSummary.slice(0, 10).map(item => item._id || 'Uncategorized'),
                                                    labels: {
                                                        style: {
                                                            colors: getChartTheme().textColor
                                                        }
                                                    }
                                                },
                                                colors: [getChartTheme().colors[2], getChartTheme().colors[3]],
                                                plotOptions: {
                                                    bar: {
                                                        horizontal: false,
                                                        columnWidth: '60%',
                                                    }
                                                },
                                                dataLabels: {
                                                    enabled: true,
                                                    style: {
                                                        colors: ['#fff']
                                                    },
                                                    formatter: function (val) {
                                                        return val > 1000000 ? (val/1000000).toFixed(1) + 'M' : 
                                                               val > 1000 ? (val/1000).toFixed(1) + 'K' : val;
                                                    }
                                                },
                                                grid: {
                                                    borderColor: getChartTheme().gridColor
                                                },
                                                yaxis: [{
                                                    title: { 
                                                        text: 'Item Count',
                                                        style: {
                                                            color: getChartTheme().textColor
                                                        }
                                                    },
                                                    labels: {
                                                        style: {
                                                            colors: getChartTheme().textColor
                                                        }
                                                    }
                                                }, {
                                                    opposite: true,
                                                    title: { 
                                                        text: 'Total Value (₹)',
                                                        style: {
                                                            color: getChartTheme().textColor
                                                        }
                                                    },
                                                    labels: {
                                                        style: {
                                                            colors: getChartTheme().textColor
                                                        }
                                                    }
                                                }],
                                                tooltip: {
                                                    theme: layoutColor === 'dark' ? 'dark' : 'light',
                                                    y: {
                                                        formatter: function(val, opts) {
                                                            const stock = dashboardData.stockSummary[opts.dataPointIndex];
                                                            if (opts.seriesIndex === 0) {
                                                                return `Items: ${val}<br/>Total Qty: ${stock.totalQty?.toLocaleString() || 0}`;
                                                            } else {
                                                                return `Value: ₹${val.toLocaleString()}<br/>Avg Value: ₹${(val / stock.itemCount).toFixed(2)}`;
                                                            }
                                                        }
                                                    }
                                                }
                                            }}
                                            series={[
                                                {
                                                    name: 'Item Count',
                                                    data: dashboardData.stockSummary.slice(0, 10).map(item => item.itemCount)
                                                },
                                                {
                                                    name: 'Total Value (₹)',
                                                    data: dashboardData.stockSummary.slice(0, 10).map(item => Math.round(item.totalValue || 0)),
                                                    yAxisIndex: 1
                                                }
                                            ]}
                                            type="bar"
                                            height={350}
                                        />
                                    ) : (
                                        <div className="text-center text-muted py-5">
                                            <i className="mdi mdi-package-variant mdi-48px"></i>
                                            <p>No stock data available</p>
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Advanced Analytics Section */}
                    {dashboardData.summary && (
                        <Row className="fade-in">
                            <Col xs={12}>
                                <Card className="comprehensive-analytics-card">
                                    <Card.Body>
                                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3">
                                            <div className="flex-grow-1">
                                                <h4 className="header-title mb-2">
                                                    <i className="mdi mdi-chart-timeline-variant me-2"></i>
                                                    Comprehensive Analytics Overview
                                                </h4>
                                                <p className="text-muted mb-0 d-none d-md-block">
                                                    Detailed insights from your Tally data with interactive visualizations
                                                </p>
                                                <p className="text-muted mb-0 d-block d-md-none">
                                                    Detailed Tally data insights
                                                </p>
                                            </div>
                                            <Button 
                                                variant="primary" 
                                                size="sm"
                                                className="d-flex align-items-center"
                                                onClick={() => navigate('/tally-comprehensive-detail')}
                                                title="View comprehensive analytics dashboard"
                                            >
                                                <i className="mdi mdi-chart-timeline-variant me-1"></i> 
                                                <span className="d-none d-sm-inline">Full Analytics</span>
                                                <span className="d-inline d-sm-none">Analytics</span>
                                            </Button>
                                        </div>
                                        
                        {/* Mini Analytics Cards */}
                        <Row className="mb-4 g-3">
                            <Col xs={12} sm={6} lg={3}>
                                <div className="mini-stat h-100">
                                    <div className="mini-stat-icon bg-primary">
                                        <i className="mdi mdi-database"></i>
                                    </div>
                                    <div className="mini-stat-info">
                                        <h6 className="mb-1">Total Records</h6>
                                        <h4 className="mb-0">
                                            {(
                                                (dashboardData.summary?.companies || 0) +
                                                (dashboardData.summary?.ledgers || 0) +
                                                (dashboardData.summary?.vouchers || 0) +
                                                (dashboardData.summary?.stockItems || 0) +
                                                (dashboardData.summary?.groups || 0) +
                                                (dashboardData.summary?.costCenters || 0) +
                                                (dashboardData.summary?.currencies || 0)
                                            ).toLocaleString()}
                                        </h4>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} sm={6} lg={3}>
                                <div className="mini-stat h-100">
                                    <div className="mini-stat-icon bg-success">
                                        <i className="mdi mdi-trending-up"></i>
                                    </div>
                                    <div className="mini-stat-info">
                                        <h6 className="mb-1">Data Coverage</h6>
                                        <h4 className="mb-0">
                                            {dashboardData.summary?.ledgers > 0 && dashboardData.summary?.vouchers > 0 ? '95%' : 
                                             dashboardData.summary?.ledgers > 0 || dashboardData.summary?.vouchers > 0 ? '70%' : '25%'}
                                        </h4>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} sm={6} lg={3}>
                                <div className="mini-stat h-100">
                                    <div className="mini-stat-icon bg-warning">
                                        <i className="mdi mdi-clock-outline"></i>
                                    </div>
                                    <div className="mini-stat-info">
                                        <h6 className="mb-1">Last Sync</h6>
                                        <h4 className="mb-0" style={{ fontSize: '1.2rem' }}>
                                            {dashboardData.summary?.lastSync ? 
                                                new Date(dashboardData.summary.lastSync).toLocaleDateString() : 
                                                'Never'
                                            }
                                        </h4>
                                    </div>
                                </div>
                            </Col>
                            <Col xs={12} sm={6} lg={3}>
                                <div className="mini-stat h-100">
                                    <div className="mini-stat-icon bg-info">
                                        <i className="mdi mdi-chart-pie"></i>
                                    </div>
                                    <div className="mini-stat-info">
                                        <h6 className="mb-1">Data Health</h6>
                                        <h4 className="mb-0" style={{ fontSize: '1.1rem' }}>
                                            {dashboardData.summary?.vouchers > 0 && dashboardData.summary?.ledgers > 0 ? 
                                                'Excellent' : dashboardData.summary?.ledgers > 0 ? 'Good' : 'Needs Sync'}
                                        </h4>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                        
                        {/* Financial Balance Trends */}
                        {dashboardData.financialSummary && (
                            <Row className="mb-4 g-3">
                                <Col xs={12} lg={6}>
                                    <div className="financial-insight-card h-100">
                                        <h5 className="mb-3">
                                            <i className="mdi mdi-chart-line text-primary me-2"></i>
                                            Financial Balance Analysis
                                        </h5>
                                        <div className="balance-metrics">
                                            <div className="metric-item d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center py-2 border-bottom">
                                                <span className="metric-label mb-1 mb-sm-0">Opening Balance</span>
                                                <span className="metric-value text-info fw-bold">
                                                    ₹{dashboardData.financialSummary.totalOpeningBalance?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                            <div className="metric-item d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center py-2 border-bottom">
                                                <span className="metric-label mb-1 mb-sm-0">Closing Balance</span>
                                                <span className="metric-value text-primary fw-bold">
                                                    ₹{dashboardData.financialSummary.totalClosingBalance?.toLocaleString() || '0'}
                                                </span>
                                            </div>
                                            <div className="metric-item d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center py-2">
                                                <span className="metric-label mb-1 mb-sm-0">Net Movement</span>
                                                <span className={`metric-value fw-bold ${
                                                    ((dashboardData.financialSummary.totalClosingBalance || 0) - 
                                                     (dashboardData.financialSummary.totalOpeningBalance || 0)) >= 0 
                                                    ? 'text-success' : 'text-danger'
                                                }`}>
                                                    ₹{((dashboardData.financialSummary.totalClosingBalance || 0) - 
                                                       (dashboardData.financialSummary.totalOpeningBalance || 0)).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                                <Col xs={12} lg={6}>
                                    <div className="data-distribution-card h-100">
                                        <h5 className="mb-3">
                                            <i className="mdi mdi-database-outline text-success me-2"></i>
                                            Data Distribution
                                        </h5>
                                        <div className="distribution-items">
                                            <div className="distribution-item mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="small">Ledgers</span>
                                                    <span className="small fw-bold">{dashboardData.summary?.ledgers || 0}</span>
                                                </div>
                                                <ProgressBar 
                                                    now={Math.min(100, (dashboardData.summary?.ledgers || 0) / 10)} 
                                                    variant="primary" 
                                                    className="mb-0" 
                                                    style={{height: '6px'}}
                                                />
                                            </div>
                                            <div className="distribution-item mb-3">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="small">Vouchers</span>
                                                    <span className="small fw-bold">{dashboardData.summary?.vouchers || 0}</span>
                                                </div>
                                                <ProgressBar 
                                                    now={Math.min(100, (dashboardData.summary?.vouchers || 0) / 50)} 
                                                    variant="success" 
                                                    className="mb-0" 
                                                    style={{height: '6px'}}
                                                />
                                            </div>
                                            <div className="distribution-item">
                                                <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <span className="small">Stock Items</span>
                                                    <span className="small fw-bold">{dashboardData.summary?.stockItems || 0}</span>
                                                </div>
                                                <ProgressBar 
                                                    now={Math.min(100, (dashboardData.summary?.stockItems || 0) / 20)} 
                                                    variant="warning" 
                                                    className="mb-0" 
                                                    style={{height: '6px'}}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        )}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}

                    {/* Financial Trends Analysis */}
                    {dashboardData.voucherSummary && dashboardData.voucherSummary.length > 0 && (
                        <Row className="fade-in">
                            <Col lg={8}>
                                <Card className="chart-container">
                                    <Card.Body>
                                        <Row className="mb-3">
                                            <Col lg={8}>
                                                <h4 className="header-title">
                                                    <i className="mdi mdi-chart-timeline-variant text-primary me-2"></i>
                                                    Voucher Amount Distribution
                                                </h4>
                                                <p className="text-muted mb-0">Financial transaction amounts by voucher type</p>
                                            </Col>
                                            <Col lg={4} className="text-end">
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm"
                                                    onClick={() => navigate('/tally-vouchers-detail')}
                                                    title="View detailed voucher analysis"
                                                >
                                                    <i className="mdi mdi-chart-bar"></i> Details
                                                </Button>
                                            </Col>
                                        </Row>
                                        <Chart
                                            key={`voucher-donut-${dashboardData.voucherSummary.length}-${Date.now()}`}
                                            options={{
                                                chart: { 
                                                    type: 'donut', 
                                                    height: 300,
                                                    background: 'transparent',
                                                    animations: {
                                                        enabled: true,
                                                        easing: 'easeinout',
                                                        speed: 800,
                                                        animateGradually: {
                                                            enabled: true,
                                                            delay: 150
                                                        },
                                                        dynamicAnimation: {
                                                            enabled: true,
                                                            speed: 350
                                                        }
                                                    },
                                                    redrawOnParentResize: true,
                                                    redrawOnWindowResize: true,
                                                    fontFamily: 'inherit'
                                                },
                                                theme: {
                                                    mode: layoutColor === 'dark' ? 'dark' : 'light'
                                                },
                                                labels: validateChartLabels(dashboardData.voucherSummary),
                                                colors: getChartTheme().colors,
                                                legend: { 
                                                    position: 'bottom',
                                                    horizontalAlign: 'center',
                                                    floating: false,
                                                    fontSize: '14px',
                                                    fontFamily: 'inherit',
                                                    fontWeight: 400,
                                                    labels: {
                                                        colors: getChartTheme().textColor,
                                                        useSeriesColors: false
                                                    },
                                                    markers: {
                                                        width: 12,
                                                        height: 12,
                                                        strokeWidth: 0,
                                                        radius: 12
                                                    },
                                                    itemMargin: {
                                                        horizontal: 10,
                                                        vertical: 5
                                                    }
                                                },
                                                plotOptions: {
                                                    pie: {
                                                        startAngle: -90,
                                                        endAngle: 270,
                                                        donut: {
                                                            size: '65%',
                                                            background: 'transparent',
                                                            labels: {
                                                                show: true,
                                                                name: {
                                                                    show: true,
                                                                    fontSize: '16px',
                                                                    fontFamily: 'inherit',
                                                                    fontWeight: 600,
                                                                    color: getChartTheme().textColor,
                                                                    offsetY: -10,
                                                                    formatter: function (val) {
                                                                        return val;
                                                                    }
                                                                },
                                                                value: {
                                                                    show: true,
                                                                    fontSize: '14px',
                                                                    fontFamily: 'inherit',
                                                                    fontWeight: 400,
                                                                    color: getChartTheme().textColor,
                                                                    offsetY: 10,
                                                                    formatter: function (val) {
                                                                        const numVal = parseFloat(val);
                                                                        if (isNaN(numVal) || numVal <= 0) return '₹0';
                                                                        return '₹' + numVal.toLocaleString('en-IN', {
                                                                            maximumFractionDigits: 0
                                                                        });
                                                                    }
                                                                },
                                                                total: {
                                                                    show: true,
                                                                    showAlways: true,
                                                                    label: 'Total Amount',
                                                                    fontSize: '16px',
                                                                    fontFamily: 'inherit',
                                                                    fontWeight: 600,
                                                                    color: getChartTheme().textColor,
                                                                    formatter: function (w) {
                                                                        try {
                                                                            const total = w.globals.seriesTotals.reduce((a, b) => {
                                                                                const numA = parseFloat(a) || 0;
                                                                                const numB = parseFloat(b) || 0;
                                                                                return numA + numB;
                                                                            }, 0);
                                                                            return total > 0 ? '₹' + total.toLocaleString('en-IN', {
                                                                                maximumFractionDigits: 0
                                                                            }) : '₹0';
                                                                        } catch (error) {
                                                                            console.warn('Chart total calculation error:', error);
                                                                            return '₹0';
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        },
                                                        expandOnClick: false
                                                    }
                                                },
                                                dataLabels: {
                                                    enabled: true,
                                                    style: {
                                                        fontSize: '12px',
                                                        fontFamily: 'inherit',
                                                        fontWeight: 'bold',
                                                        colors: ['#fff']
                                                    },
                                                    background: {
                                                        enabled: false
                                                    },
                                                    dropShadow: {
                                                        enabled: false
                                                    },
                                                    formatter: function (val, opts) {
                                                        try {
                                                            const percentage = parseFloat(val);
                                                            if (isNaN(percentage) || percentage <= 0) return '';
                                                            return percentage > 5 ? percentage.toFixed(1) + '%' : '';
                                                        } catch (error) {
                                                            return '';
                                                        }
                                                    }
                                                },
                                                tooltip: {
                                                    enabled: true,
                                                    theme: layoutColor === 'dark' ? 'dark' : 'light',
                                                    style: {
                                                        fontSize: '14px',
                                                        fontFamily: 'inherit'
                                                    },
                                                    y: {
                                                        formatter: function(val, opts) {
                                                            try {
                                                                const numVal = parseFloat(val);
                                                                if (isNaN(numVal) || numVal <= 0) return '₹0';
                                                                
                                                                const seriesIndex = opts.seriesIndex;
                                                                const voucherType = opts.w.globals.labels[seriesIndex];
                                                                const voucherData = dashboardData.voucherSummary.find(item => item._id === voucherType);
                                                                const count = voucherData ? voucherData.count || 0 : 0;
                                                                const avgAmount = count > 0 ? (numVal / count) : 0;
                                                                
                                                                return `Amount: ₹${numVal.toLocaleString('en-IN')}
Count: ${count} vouchers
Avg: ₹${avgAmount.toLocaleString('en-IN', {maximumFractionDigits: 0})}`;
                                                            } catch (error) {
                                                                console.warn('Tooltip formatting error:', error);
                                                                return '₹0';
                                                            }
                                                        }
                                                    }
                                                },
                                                responsive: [{
                                                    breakpoint: 768,
                                                    options: {
                                                        chart: {
                                                            height: 250
                                                        },
                                                        legend: {
                                                            position: 'bottom',
                                                            fontSize: '12px'
                                                        },
                                                        plotOptions: {
                                                            pie: {
                                                                donut: {
                                                                    size: '70%',
                                                                    labels: {
                                                                        value: {
                                                                            fontSize: '12px'
                                                                        },
                                                                        total: {
                                                                            fontSize: '14px'
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }],
                                                stroke: {
                                                    show: false,
                                                    width: 0
                                                },
                                                fill: {
                                                    type: 'gradient',
                                                    gradient: {
                                                        shade: 'light',
                                                        type: 'horizontal',
                                                        shadeIntensity: 0.5,
                                                        gradientToColors: undefined,
                                                        inverseColors: true,
                                                        opacityFrom: 1,
                                                        opacityTo: 1,
                                                        stops: [0, 50, 100]
                                                    }
                                                }
                                            }}
                                            series={validateChartData(dashboardData.voucherSummary, 'amount')}
                                            type="donut"
                                            height={300}
                                        />
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col lg={4}>
                                <Card className="comprehensive-analytics-card">
                                    <Card.Body>
                                        <h5 className="mb-3">
                                            <i className="mdi mdi-information-outline text-info me-2"></i>
                                            Quick Insights
                                        </h5>
                                        <div className="insights-list">
                                            <div className="insight-item">
                                                <div className="insight-icon bg-primary">
                                                    <i className="mdi mdi-file-document"></i>
                                                </div>
                                                <div className="insight-content">
                                                    <span className="insight-label">Total Vouchers</span>
                                                    <span className="insight-value">
                                                        {dashboardData.summary?.vouchers?.toLocaleString() || '0'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="insight-item">
                                                <div className="insight-icon bg-success">
                                                    <i className="mdi mdi-cash-multiple"></i>
                                                </div>
                                                <div className="insight-content">
                                                    <span className="insight-label">Total Amount</span>
                                                    <span className="insight-value">
                                                        ₹{dashboardData.voucherSummary.reduce((acc, item) => acc + (item.totalAmount || 0), 0).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="insight-item">
                                                <div className="insight-icon bg-warning">
                                                    <i className="mdi mdi-chart-bar"></i>
                                                </div>
                                                <div className="insight-content">
                                                    <span className="insight-label">Avg. per Voucher</span>
                                                    <span className="insight-value">
                                                        ₹{(dashboardData.voucherSummary.reduce((acc, item) => acc + (item.totalAmount || 0), 0) / 
                                                           dashboardData.voucherSummary.reduce((acc, item) => acc + (item.count || 0), 0) || 0).toFixed(0)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="insight-item">
                                                <div className="insight-icon bg-info">
                                                    <i className="mdi mdi-format-list-numbered"></i>
                                                </div>
                                                <div className="insight-content">
                                                    <span className="insight-label">Voucher Types</span>
                                                    <span className="insight-value">
                                                        {dashboardData.voucherSummary.length}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4">
                                            <h6 className="mb-2">Top Voucher Type</h6>
                                            {dashboardData.voucherSummary[0] && (
                                                <div className="top-voucher-info">
                                                    <Badge 
                                                        bg="primary" 
                                                        className="me-2 px-3 py-2"
                                                    >
                                                        {dashboardData.voucherSummary[0]._id}
                                                    </Badge>
                                                    <div className="small text-muted mt-1">
                                                        {dashboardData.voucherSummary[0].count} vouchers • 
                                                        ₹{dashboardData.voucherSummary[0].totalAmount?.toLocaleString() || '0'}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                    )}

                    {/* Enhanced Tables Row */}
                    <Row>
                        <Col lg={6}>
                            <Card>
                                <Card.Body>
                                    <Row>
                                        <Col lg={8}>
                                            <h4 className="header-title">Recent Vouchers</h4>
                                        </Col>
                                        <Col lg={4} className="text-end">
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm"
                                                onClick={() => navigate('/tally-vouchers-detail')}
                                                title="View all vouchers with filters and search"
                                            >
                                                <i className="mdi mdi-eye"></i> View All
                                            </Button>
                                        </Col>
                                    </Row>
                                        <Table responsive className="table-sm">
                                            <thead>
                                                <tr>
                                                    <th></th>
                                                    <th>Date</th>
                                                    <th>Voucher No</th>
                                                    <th>Type</th>
                                                    <th>Party</th>
                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dashboardData.recentActivities?.vouchers && dashboardData.recentActivities.vouchers.length > 0 ? 
                                                    dashboardData.recentActivities.vouchers.map((voucher, index) => (
                                                        <React.Fragment key={index}>
                                                            <tr>
                                                                <td>
                                                                    <Button 
                                                                        variant="outline-secondary" 
                                                                        size="sm" 
                                                                        onClick={() => toggleVoucherRow(index)}
                                                                        title={expandedVoucherRows.includes(index) ? "Hide Details" : "Show Details"}
                                                                    >
                                                                        <i className={`mdi ${expandedVoucherRows.includes(index) ? 'mdi-chevron-up' : 'mdi-chevron-down'}`}></i>
                                                                    </Button>
                                                                </td>
                                                                <td>{new Date(voucher.date).toLocaleDateString()}</td>
                                                                <td>{voucher.voucherNumber}</td>
                                                                <td>
                                                                    <Badge bg="info" className="text-truncate" title="Voucher Type">
                                                                        {voucher.voucherType}
                                                                    </Badge>
                                                                </td>
                                                                <td className="text-truncate" style={{maxWidth: '120px'}}>
                                                                    {voucher.party || 'N/A'}
                                                                </td>
                                                                <td>₹{voucher.amount?.toLocaleString() || 0}</td>
                                                            </tr>
                                                            {expandedVoucherRows.includes(index) && (
                                                                <tr>
                                                                    <td colSpan="6" className="bg-light">
                                                                        <div className="p-2">
                                                                            <strong>All Fields:</strong>
                                                                            <ul className="mb-0">
                                                                                {Object.entries(voucher).map(([key, value]) => (
                                                                                    <li key={key}>
                                                                                        <Badge bg="secondary" className="me-2" title={key === 'rawData' ? 'New Field' : ''}>
                                                                                            {key}
                                                                                        </Badge>
                                                                                        <span title={key === 'rawData' ? 'Raw field from Tally sync' : ''}>
                                                                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                                        </span>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan="6" className="text-center text-muted">No vouchers available</td>
                                                        </tr>
                                                    )
                                                }
                                            </tbody>
                                        </Table>
                                        <div className="text-center mt-2">
                                            <small className="text-muted">
                                                Showing recent vouchers. 
                                                <Button 
                                                    variant="link" 
                                                    size="sm" 
                                                    className="p-0 ms-1"
                                                    onClick={() => navigate('/tally-vouchers-detail')}
                                                >
                                                    Click to see all with advanced filters
                                                </Button>
                                            </small>
                                        </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={6}>
                            <Card>
                                <Card.Body>
                                    <Row>
                                        <Col lg={8}>
                                            <h4 className="header-title">Recent Ledgers</h4>
                                        </Col>
                                        <Col lg={4} className="text-end">
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm"
                                                onClick={() => navigate('/tally-ledgers-detail')}
                                                title="View all ledgers with balance analysis"
                                            >
                                                <i className="mdi mdi-account-multiple"></i> View All
                                            </Button>
                                        </Col>
                                    </Row>
                                        <Table responsive className="table-sm">
                                            <thead>
                                                <tr>
                                                    <th></th>
                                                    <th>Ledger Name</th>
                                                    <th>Parent</th>
                                                    <th>Opening Balance</th>
                                                    <th>Closing Balance</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dashboardData.recentActivities?.ledgers && dashboardData.recentActivities.ledgers.length > 0 ? 
                                                    dashboardData.recentActivities.ledgers.map((ledger, index) => (
                                                        <React.Fragment key={index}>
                                                            <tr>
                                                                <td>
                                                                    <Button 
                                                                        variant="outline-secondary" 
                                                                        size="sm" 
                                                                        onClick={() => toggleLedgerRow(index)}
                                                                        title={expandedLedgerRows.includes(index) ? "Hide Details" : "Show Details"}
                                                                    >
                                                                        <i className={`mdi ${expandedLedgerRows.includes(index) ? 'mdi-chevron-up' : 'mdi-chevron-down'}`}></i>
                                                                    </Button>
                                                                </td>
                                                                <td className="text-truncate" style={{maxWidth: '120px'}}>
                                                                    {ledger.name}
                                                                </td>
                                                                <td className="text-truncate" style={{maxWidth: '100px'}}>
                                                                    {ledger.parent || 'N/A'}
                                                                </td>
                                                                <td>
                                                                    <span className={ledger.openingBalance >= 0 ? 'text-success' : 'text-danger'}>
                                                                        ₹{Math.abs(ledger.openingBalance || 0).toLocaleString()}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className={ledger.closingBalance >= 0 ? 'text-success' : 'text-danger'}>
                                                                        ₹{Math.abs(ledger.closingBalance || 0).toLocaleString()}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                            {expandedLedgerRows.includes(index) && (
                                                                <tr>
                                                                    <td colSpan="5" className="bg-light">
                                                                        <div className="p-2">
                                                                            <strong>All Fields:</strong>
                                                                            <ul className="mb-0">
                                                                                {Object.entries(ledger).map(([key, value]) => (
                                                                                    <li key={key}>
                                                                                        <Badge bg="secondary" className="me-2" title={key === 'rawData' ? 'New Field' : ''}>
                                                                                            {key}
                                                                                        </Badge>
                                                                                        <span title={key === 'rawData' ? 'Raw field from Tally sync' : ''}>
                                                                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                                        </span>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan="5" className="text-center text-muted">No ledgers available</td>
                                                        </tr>
                                                    )
                                                }
                                            </tbody>
                                        </Table>
                                        <div className="text-center mt-2">
                                            <small className="text-muted">
                                                Showing recent ledgers. 
                                                <Button 
                                                    variant="link" 
                                                    size="sm" 
                                                    className="p-0 ms-1"
                                                    onClick={() => navigate('/tally-ledgers-detail')}
                                                >
                                                    View detailed balance analysis
                                                </Button>
                                            </small>
                                        </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    {/* Recent Stock Items */}
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <Card.Body>
                                    <Row>
                                        <Col lg={8}>
                                            <h4 className="header-title">Recent Stock Items</h4>
                                        </Col>
                                        <Col lg={4} className="text-end">
                                            <div className="d-flex gap-2 justify-content-end">
                                                <Button 
                                                    variant="outline-success" 
                                                    size="sm"
                                                    onClick={() => navigate('/tally-comprehensive-detail')}
                                                    title="View comprehensive analytics dashboard"
                                                >
                                                    <i className="mdi mdi-chart-timeline-variant"></i> Analytics
                                                </Button>
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm"
                                                    onClick={() => navigate('/tally-stock-items-detail')}
                                                    title="View detailed stock management"
                                                >
                                                    <i className="mdi mdi-package-variant"></i> Manage Stock
                                                </Button>
                                            </div>
                                        </Col>
                                    </Row>
                                        <Table responsive className="table-sm">
                                            <thead>
                                                <tr>
                                                    <th></th>
                                                    <th>Item Name</th>
                                                    <th>Closing Qty</th>
                                                    <th>Closing Value</th>
                                                    <th>Base Units</th>
                                                    <th>Last Updated</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dashboardData.recentActivities?.stockItems && dashboardData.recentActivities.stockItems.length > 0 ? 
                                                    dashboardData.recentActivities.stockItems.map((item, index) => (
                                                        <React.Fragment key={index}>
                                                            <tr>
                                                                <td>
                                                                    <Button 
                                                                        variant="outline-secondary" 
                                                                        size="sm" 
                                                                        onClick={() => toggleStockRow(index)}
                                                                        title={expandedStockRows.includes(index) ? "Hide Details" : "Show Details"}
                                                                    >
                                                                        <i className={`mdi ${expandedStockRows.includes(index) ? 'mdi-chevron-up' : 'mdi-chevron-down'}`}></i>
                                                                    </Button>
                                                                </td>
                                                                <td className="text-truncate" style={{maxWidth: '200px'}}>
                                                                    {item.name}
                                                                </td>
                                                                <td>
                                                                    <Badge bg={item.closingQty > 0 ? 'success' : 'warning'}>
                                                                        {item.closingQty} {item.baseUnits}
                                                                    </Badge>
                                                                </td>
                                                                <td>₹{item.closingValue?.toLocaleString() || 0}</td>
                                                                <td>{item.baseUnits}</td>
                                                                <td>{new Date(item.lastUpdated).toLocaleDateString()}</td>
                                                                <td>
                                                                    <Badge bg={
                                                                        item.closingQty > 50 ? 'success' : 
                                                                        item.closingQty > 10 ? 'warning' : 'danger'
                                                                    }>
                                                                        {item.closingQty > 50 ? 'Good Stock' : 
                                                                         item.closingQty > 10 ? 'Low Stock' : 'Out of Stock'}
                                                                    </Badge>
                                                                </td>
                                                            </tr>
                                                            {expandedStockRows.includes(index) && (
                                                                <tr>
                                                                    <td colSpan="7" className="bg-light">
                                                                        <div className="p-2">
                                                                            <strong>All Fields:</strong>
                                                                            <ul className="mb-0">
                                                                                {Object.entries(item).map(([key, value]) => (
                                                                                    <li key={key}>
                                                                                        <Badge bg="secondary" className="me-2" title={key === 'rawData' ? 'New Field' : ''}>
                                                                                            {key}
                                                                                        </Badge>
                                                                                        <span title={key === 'rawData' ? 'Raw field from Tally sync' : ''}>
                                                                                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                                                                        </span>
                                                                                    </li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    )) : (
                                                        <tr>
                                                            <td colSpan="7" className="text-center text-muted">No stock items available</td>
                                                        </tr>
                                                    )
                                                }
                                            </tbody>
                                        </Table>
                                        <div className="text-center mt-3">
                                            <Row>
                                                <Col md={6}>
                                                    <small className="text-muted">
                                                        Recent stock activity summary. 
                                                        <Button 
                                                            variant="link" 
                                                            size="sm" 
                                                            className="p-0 ms-1"
                                                            onClick={() => navigate('/tally-stock-items-detail')}
                                                        >
                                                            View detailed inventory management
                                                        </Button>
                                                    </small>
                                                </Col>
                                                <Col md={6}>
                                                    <small className="text-muted">
                                                        Need insights? 
                                                        <Button 
                                                            variant="link" 
                                                            size="sm" 
                                                            className="p-0 ms-1"
                                                            onClick={() => navigate('/tally-comprehensive-detail')}
                                                        >
                                                            Explore comprehensive analytics
                                                        </Button>
                                                    </small>
                                                </Col>
                                            </Row>
                                        </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </>
            )}

            {/* Floating Action Button */}
            {dashboardData && (
                <Button 
                    variant="primary" 
                    className="tally-fab"
                    onClick={() => navigate('/tally-comprehensive-detail')}
                    title="Open Comprehensive Analytics"
                >
                    <i className="mdi mdi-chart-timeline-variant mdi-24px"></i>
                </Button>
            )}
        </>
    );
};

export default TallyDashboard;
