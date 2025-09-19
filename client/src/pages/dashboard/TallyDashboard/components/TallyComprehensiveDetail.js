// @flow
import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Table, Badge, Tab, Tabs } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Chart from 'react-apexcharts';
import { APICore } from '../../../../helpers/api/apiCore';
import MainLoader from '../../../../components/MainLoader';
import ThemeToggle from '../../../../components/ThemeToggle';
import axios from 'axios';
import '../TallyDashboard.css';

const TallyComprehensiveDetail = () => {
    const [comprehensiveData, setComprehensiveData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const navigate = useNavigate();

    // Get theme from Redux store for charts
    const { layoutColor } = useSelector((state) => ({
        layoutColor: state.Layout.layoutColor,
    }));
    
    // Theme-aware chart colors
    const getChartTheme = () => {
        const isDark = layoutColor === 'dark';
        return {
            colors: isDark ? ['#667eea', '#f093fb', '#764ba2', '#f5576c', '#4facfe', '#00f2fe'] 
                          : ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
            textColor: isDark ? '#e3e6f0' : '#6c757d',
            gridColor: isDark ? '#404954' : '#f1f3fa',
            backgroundColor: isDark ? 'transparent' : 'transparent'
        };
    };

    // Fetch comprehensive dashboard data
    const fetchComprehensiveData = async () => {
        setLoading(true);
        setError(null);
        try {
            const api = new APICore();
            const loggedInUser = api.getLoggedInUser();
            const token = loggedInUser?.token;
            
            if (!token) {
                navigate('/account/login');
                return;
            }
            
            const response = await axios.get('/tally/dashboard/comprehensive', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.status === 200) {
                setComprehensiveData(response.data.data);
                setError(null);
            } else {
                setError(`Server returned status: ${response.data.status}`);
            }
        } catch (error) {
            console.error('Comprehensive data fetch error:', error);
            
            if (error.response?.status === 401) {
                const api = new APICore();
                api.setLoggedInUser(null);
                navigate('/account/login');
                return;
            }
            
            setError(error.response?.data?.message || 'Failed to fetch comprehensive data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);
            try {
                const api = new APICore();
                const loggedInUser = api.getLoggedInUser();
                const token = loggedInUser?.token;
                
                if (!token) {
                    navigate('/account/login');
                    return;
                }
                
                const response = await axios.get('/tally/dashboard/comprehensive', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data.status === 200) {
                    setComprehensiveData(response.data.data);
                    setError(null);
                } else {
                    setError(`Server returned status: ${response.data.status}`);
                }
            } catch (error) {
                console.error('Comprehensive data fetch error:', error);
                
                if (error.response?.status === 401) {
                    const api = new APICore();
                    api.setLoggedInUser(null);
                    navigate('/account/login');
                    return;
                }
                
                setError(error.response?.data?.message || 'Failed to fetch comprehensive data');
            } finally {
                setLoading(false);
            }
        };
        
        loadData();
    }, [navigate]);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    // Chart configurations
    const getChartConfig = (title, labels, colors) => ({
        chart: { type: 'pie', height: 350 },
        labels: labels,
        colors: colors,
        legend: { position: 'bottom' },
        title: { text: title, align: 'center' },
        dataLabels: {
            enabled: true,
            formatter: function (val) {
                return val.toFixed(1) + '%'
            }
        }
    });

    const barChartConfig = (categories, title) => ({
        chart: { type: 'bar', height: 350 },
        xaxis: { categories: categories },
        title: { text: title, align: 'center' },
        colors: ['#727cf5', '#0acf97', '#fa5c7c', '#ffbc00'],
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '50%',
            }
        },
        dataLabels: { enabled: true }
    });

    return (
        <>
            <Row>
                <Col xs={12}>
                    <div className="page-title-box d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                            <div>
                                <h4 className="page-title mb-0">Tally Comprehensive Analytics</h4>
                                <ol className="breadcrumb m-0">
                                    <li className="breadcrumb-item">
                                        <Button 
                                            variant="link" 
                                            className="p-0 text-decoration-none"
                                            onClick={() => navigate('/tally-dashboard')}
                                        >
                                            Dashboard
                                        </Button>
                                    </li>
                                    <li className="breadcrumb-item active">Comprehensive View</li>
                                </ol>
                            </div>
                            <ThemeToggle size="sm" className="theme-toggle-dashboard ms-3" />
                        </div>
                        <div>
                            <Button 
                                variant="secondary" 
                                className="me-2"
                                onClick={() => navigate('/tally-dashboard')}
                            >
                                <i className="mdi mdi-arrow-left"></i> Back
                            </Button>
                            <Button variant="primary" onClick={fetchComprehensiveData} disabled={loading}>
                                <i className="mdi mdi-refresh"></i> Full Sync (All except vouchers)
                            </Button>
                            <Button variant="warning" className="ms-2" onClick={() => navigate('/tally-vouchers-detail')}>
                                <i className="mdi mdi-file-document"></i> Fetch Vouchers (Batch Only)
                            </Button>
                            <span className="ms-2 text-muted" style={{fontSize: '0.95em'}}>
                                Use <b>Full Sync</b> for all Tally data except vouchers. Use <b>Fetch Vouchers</b> for batch voucher sync only.
                            </span>
                        </div>
                    </div>
                </Col>
            </Row>

            {error && (
                <Row>
                    <Col xs={12}>
                        <div className="alert alert-danger">
                            <strong>Error:</strong> {error}
                        </div>
                    </Col>
                </Row>
            )}

            {loading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
                    <MainLoader />
                </div>
            ) : comprehensiveData ? (
                <Row>
                    <Col xs={12}>
                        <Card>
                            <Card.Body>
                                <Tabs
                                    activeKey={activeTab}
                                    onSelect={(k) => setActiveTab(k)}
                                    className="nav-bordered mb-3"
                                >
                                    {/* Overview Tab */}
                                    <Tab eventKey="overview" title="📊 Overview">
                                        <Row>
                                            {/* Summary Cards */}
                                            <Col md={2}>
                                                <Card className="widget-flat bg-primary text-white">
                                                    <Card.Body className="text-center">
                                                        <i className="mdi mdi-office-building widget-icon"></i>
                                                        <h3 className="mt-2">{comprehensiveData.summary?.companies || 0}</h3>
                                                        <p className="mb-0">Companies</p>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={2}>
                                                <Card className="widget-flat bg-success text-white">
                                                    <Card.Body className="text-center">
                                                        <i className="mdi mdi-account-multiple widget-icon"></i>
                                                        <h3 className="mt-2">{comprehensiveData.summary?.ledgers || 0}</h3>
                                                        <p className="mb-0">Sundry Debtors</p>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={2}>
                                                <Card className="widget-flat bg-info text-white">
                                                    <Card.Body className="text-center">
                                                        <i className="mdi mdi-sitemap widget-icon"></i>
                                                        <h3 className="mt-2">{comprehensiveData.summary?.groups || 0}</h3>
                                                        <p className="mb-0">Groups</p>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={2}>
                                                <Card className="widget-flat bg-warning text-white">
                                                    <Card.Body className="text-center">
                                                        <i className="mdi mdi-package-variant widget-icon"></i>
                                                        <h3 className="mt-2">{comprehensiveData.summary?.stockItems || 0}</h3>
                                                        <p className="mb-0">Stock Items</p>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={2}>
                                                <Card className="widget-flat bg-danger text-white">
                                                    <Card.Body className="text-center">
                                                        <i className="mdi mdi-file-document widget-icon"></i>
                                                        <h3 className="mt-2">{comprehensiveData.summary?.vouchers || 0}</h3>
                                                        <p className="mb-0">Vouchers</p>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={2}>
                                                <Card className="widget-flat bg-secondary text-white">
                                                    <Card.Body className="text-center">
                                                        <i className="mdi mdi-currency-usd widget-icon"></i>
                                                        <h3 className="mt-2">{comprehensiveData.summary?.currencies || 0}</h3>
                                                        <p className="mb-0">Currencies</p>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>

                                        {/* Financial Summary */}
                                        <Row className="mt-4">
                                            <Col md={4}>
                                                <Card className="text-center">
                                                    <Card.Body>
                                                        <h5 className="text-muted">Total Opening Balance</h5>
                                                        <h2 className="text-success">
                                                            {formatCurrency(comprehensiveData.financialSummary?.totalOpeningBalance || 0)}
                                                        </h2>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={4}>
                                                <Card className="text-center">
                                                    <Card.Body>
                                                        <h5 className="text-muted">Total Closing Balance</h5>
                                                        <h2 className="text-primary">
                                                            {formatCurrency(comprehensiveData.financialSummary?.totalClosingBalance || 0)}
                                                        </h2>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col md={4}>
                                                <Card className="text-center">
                                                    <Card.Body>
                                                        <h5 className="text-muted">Net Change</h5>
                                                        <h2 className={
                                                            ((comprehensiveData.financialSummary?.totalClosingBalance || 0) - 
                                                             (comprehensiveData.financialSummary?.totalOpeningBalance || 0)) >= 0 
                                                            ? 'text-success' : 'text-danger'
                                                        }>
                                                            {formatCurrency(
                                                                (comprehensiveData.financialSummary?.totalClosingBalance || 0) - 
                                                                (comprehensiveData.financialSummary?.totalOpeningBalance || 0)
                                                            )}
                                                        </h2>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </Tab>

                                    {/* Charts Tab */}
                                    <Tab eventKey="charts" title="📈 Analytics">
                                        <Row>
                                            <Col lg={6}>
                                                <Card>
                                                    <Card.Body>
                                                        {comprehensiveData.voucherSummary && comprehensiveData.voucherSummary.length > 0 ? (
                                                            <Chart
                                                                options={getChartConfig(
                                                                    'Voucher Types Distribution',
                                                                    comprehensiveData.voucherSummary.map(item => item._id || 'Unknown'),
                                                                    ['#727cf5', '#0acf97', '#fa5c7c', '#ffbc00', '#39afd1', '#6c757d']
                                                                )}
                                                                series={comprehensiveData.voucherSummary.map(item => item.count)}
                                                                type="pie"
                                                                height={350}
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
                                            <Col lg={6}>
                                                <Card>
                                                    <Card.Body>
                                                        {comprehensiveData.groupSummary && comprehensiveData.groupSummary.length > 0 ? (
                                                            <Chart
                                                                options={barChartConfig(
                                                                    comprehensiveData.groupSummary.map(item => item._id || 'Other'),
                                                                    'Group Summary by Nature'
                                                                )}
                                                                series={[{
                                                                    name: 'Groups',
                                                                    data: comprehensiveData.groupSummary.map(item => item.count)
                                                                }]}
                                                                type="bar"
                                                                height={350}
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
                                        
                                        <Row className="mt-3">
                                            <Col lg={12}>
                                                <Card>
                                                    <Card.Body>
                                                        {comprehensiveData.stockSummary && comprehensiveData.stockSummary.length > 0 ? (
                                                            <Chart
                                                                options={barChartConfig(
                                                                    comprehensiveData.stockSummary.slice(0, 10).map(item => item._id || 'Uncategorized'),
                                                                    'Top 10 Stock Categories'
                                                                )}
                                                                series={[
                                                                    {
                                                                        name: 'Item Count',
                                                                        data: comprehensiveData.stockSummary.slice(0, 10).map(item => item.itemCount)
                                                                    },
                                                                    {
                                                                        name: 'Total Value (₹)',
                                                                        data: comprehensiveData.stockSummary.slice(0, 10).map(item => Math.round(item.totalValue || 0))
                                                                    }
                                                                ]}
                                                                type="bar"
                                                                height={400}
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
                                    </Tab>

                                    {/* Recent Activity Tab */}
                                    <Tab eventKey="activity" title="🔄 Recent Activity">
                                        <Row>
                                            <Col lg={6}>
                                                <Card>
                                                    <Card.Body>
                                                        <h5 className="card-title">Recent Vouchers</h5>
                                                        <div className="table-responsive">
                                                            <Table size="sm" hover>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Date</th>
                                                                        <th>Voucher No</th>
                                                                        <th>Type</th>
                                                                        <th>Amount</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {comprehensiveData.recentActivities?.vouchers?.slice(0, 10).map((voucher, index) => (
                                                                        <tr key={index}>
                                                                            <td>{new Date(voucher.date).toLocaleDateString()}</td>
                                                                            <td>{voucher.voucherNumber}</td>
                                                                            <td>
                                                                                <Badge bg="info">{voucher.voucherType}</Badge>
                                                                            </td>
                                                                            <td>{formatCurrency(voucher.amount || 0)}</td>
                                                                        </tr>
                                                                    )) || (
                                                                        <tr>
                                                                            <td colSpan="4" className="text-center text-muted">
                                                                                No recent vouchers
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </Table>
                                                        </div>
                                                        <div className="mt-3">
                                                            <Button 
                                                                variant="outline-primary" 
                                                                size="sm"
                                                                onClick={() => navigate('/tally-vouchers-detail')}
                                                            >
                                                                View All Vouchers <i className="mdi mdi-arrow-right"></i>
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                            <Col lg={6}>
                                                <Card>
                                                    <Card.Body>
                                                        <h5 className="card-title">Recent Sundry Debtors</h5>
                                                        <div className="table-responsive">
                                                            <Table size="sm" hover>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Ledger Name</th>
                                                                        <th>Group</th>
                                                                        <th>Closing Balance</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {comprehensiveData.recentActivities?.ledgers?.slice(0, 10).map((ledger, index) => (
                                                                        <tr key={index}>
                                                                            <td className="text-truncate" style={{ maxWidth: '150px' }}>
                                                                                {ledger.name}
                                                                            </td>
                                                                            <td>{ledger.parent || 'N/A'}</td>
                                                                            <td>
                                                                                <span className={ledger.closingBalance >= 0 ? 'text-success' : 'text-danger'}>
                                                                                    {formatCurrency(Math.abs(ledger.closingBalance || 0))}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    )) || (
                                                                        <tr>
                                                                            <td colSpan="3" className="text-center text-muted">
                                                                                No recent ledgers
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </Table>
                                                        </div>
                                                        <div className="mt-3">
                                                            <Button 
                                                                variant="outline-primary" 
                                                                size="sm"
                                                                onClick={() => navigate('/tally-ledgers-detail')}
                                                            >
                                                                View All Ledgers <i className="mdi mdi-arrow-right"></i>
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>
                                        
                                        <Row className="mt-3">
                                            <Col lg={12}>
                                                <Card>
                                                    <Card.Body>
                                                        <h5 className="card-title">Recent Stock Items</h5>
                                                        <div className="table-responsive">
                                                            <Table size="sm" hover>
                                                                <thead>
                                                                    <tr>
                                                                        <th>Item Name</th>
                                                                        <th>Closing Qty</th>
                                                                        <th>Units</th>
                                                                        <th>Closing Value</th>
                                                                        <th>Status</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {comprehensiveData.recentActivities?.stockItems?.slice(0, 10).map((item, index) => (
                                                                        <tr key={index}>
                                                                            <td className="text-truncate" style={{ maxWidth: '200px' }}>
                                                                                {item.name}
                                                                            </td>
                                                                            <td>{(item.closingQty || 0).toLocaleString()}</td>
                                                                            <td>
                                                                                <Badge bg="info">{item.baseUnits || 'N/A'}</Badge>
                                                                            </td>
                                                                            <td>{formatCurrency(item.closingValue || 0)}</td>
                                                                            <td>
                                                                                <Badge bg={
                                                                                    item.closingQty > 50 ? 'success' : 
                                                                                    item.closingQty > 10 ? 'warning' : 'danger'
                                                                                }>
                                                                                    {item.closingQty > 50 ? 'Good' : 
                                                                                     item.closingQty > 10 ? 'Low' : 'Critical'}
                                                                                </Badge>
                                                                            </td>
                                                                        </tr>
                                                                    )) || (
                                                                        <tr>
                                                                            <td colSpan="5" className="text-center text-muted">
                                                                                No recent stock items
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </tbody>
                                                            </Table>
                                                        </div>
                                                        <div className="mt-3">
                                                            <Button 
                                                                variant="outline-primary" 
                                                                size="sm"
                                                                onClick={() => navigate('/tally-stock-items-detail')}
                                                            >
                                                                View All Stock Items <i className="mdi mdi-arrow-right"></i>
                                                            </Button>
                                                        </div>
                                                    </Card.Body>
                                                </Card>
                                            </Col>
                                        </Row>
                                    </Tab>
                                </Tabs>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            ) : (
                <Row>
                    <Col xs={12}>
                        <Card>
                            <Card.Body className="text-center">
                                <h5>No Data Available</h5>
                                <p>Unable to load comprehensive dashboard data.</p>
                                <Button variant="primary" onClick={fetchComprehensiveData}>
                                    <i className="mdi mdi-refresh"></i> Retry
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}
        </>
    );
};

export default TallyComprehensiveDetail;
