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

    // Enhanced chart configurations with professional styling
    const getChartConfig = (title, labels, colors) => ({
        chart: { 
            type: 'pie', 
            height: 380,
            background: 'transparent',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 1000,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 400
                }
            },
            dropShadow: {
                enabled: true,
                top: 3,
                left: 3,
                blur: 8,
                opacity: 0.12
            }
        },
        labels: labels,
        colors: colors,
        legend: { 
            position: 'bottom',
            horizontalAlign: 'center',
            fontSize: '13px',
            fontFamily: 'inherit',
            fontWeight: 500,
            labels: {
                colors: getChartTheme().textColor,
                useSeriesColors: true
            },
            markers: {
                width: 14,
                height: 14,
                strokeWidth: 2,
                strokeColor: '#fff',
                radius: 14
            },
            itemMargin: {
                horizontal: 12,
                vertical: 6
            }
        },
        title: { 
            text: title, 
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 600,
                color: getChartTheme().textColor
            },
            margin: 20
        },
        dataLabels: {
            enabled: true,
            style: {
                fontSize: '12px',
                fontFamily: 'inherit',
                fontWeight: '600',
                colors: ['#fff']
            },
            background: {
                enabled: true,
                foreColor: '#fff',
                borderRadius: 4,
                padding: 4,
                opacity: 0.9,
                borderWidth: 1,
                borderColor: '#fff'
            },
            dropShadow: {
                enabled: true,
                top: 1,
                left: 1,
                blur: 2,
                opacity: 0.3
            },
            formatter: function (val) {
                return val > 8 ? val.toFixed(1) + '%' : '';
            }
        },
        stroke: {
            show: true,
            width: 2,
            colors: ['#fff']
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: layoutColor === 'dark' ? 'dark' : 'light',
                type: 'radial',
                shadeIntensity: 0.6,
                gradientToColors: colors.map(color => color + '80'),
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 0.8,
                stops: [0, 100]
            }
        },
        states: {
            hover: {
                filter: {
                    type: 'lighten',
                    value: 0.15
                }
            },
            active: {
                allowMultipleDataPointsSelection: false,
                filter: {
                    type: 'darken',
                    value: 0.7
                }
            }
        },
        tooltip: {
            enabled: true,
            theme: layoutColor === 'dark' ? 'dark' : 'light',
            style: {
                fontSize: '13px',
                fontFamily: 'inherit'
            }
        }
    });

    const barChartConfig = (categories, title) => ({
        chart: { 
            type: 'bar', 
            height: 380,
            background: 'transparent',
            animations: {
                enabled: true,
                easing: 'easeinout',
                speed: 1000,
                animateGradually: {
                    enabled: true,
                    delay: 100
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 400
                }
            },
            dropShadow: {
                enabled: true,
                top: 2,
                left: 2,
                blur: 6,
                opacity: 0.1
            },
            toolbar: {
                show: true,
                tools: {
                    download: true,
                    selection: false,
                    zoom: true,
                    zoomin: true,
                    zoomout: true,
                    pan: false,
                    reset: true
                }
            }
        },
        xaxis: { 
            categories: categories,
            labels: {
                style: {
                    colors: getChartTheme().textColor,
                    fontSize: '12px',
                    fontWeight: 500
                },
                rotate: -45,
                rotateAlways: true,
                maxHeight: 80
            },
            axisBorder: {
                show: true,
                color: getChartTheme().gridColor,
                height: 1,
                width: '100%'
            },
            axisTicks: {
                show: true,
                borderType: 'solid',
                color: getChartTheme().gridColor,
                height: 6
            }
        },
        yaxis: {
            labels: {
                style: {
                    colors: getChartTheme().textColor,
                    fontSize: '12px',
                    fontWeight: 500
                },
                formatter: function (val) {
                    return val.toFixed(0);
                }
            }
        },
        title: { 
            text: title, 
            align: 'center',
            style: {
                fontSize: '18px',
                fontWeight: 600,
                color: getChartTheme().textColor
            },
            margin: 20
        },
        colors: getChartTheme().colors.slice(0, 4),
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '60%',
                endingShape: 'rounded',
                borderRadius: 4,
                dataLabels: {
                    position: 'top'
                }
            }
        },
        dataLabels: { 
            enabled: true,
            formatter: function (val) {
                return val > 0 ? val.toString() : '';
            },
            offsetY: -20,
            style: {
                fontSize: '12px',
                colors: [getChartTheme().textColor],
                fontWeight: 600
            },
            background: {
                enabled: true,
                foreColor: getChartTheme().textColor,
                borderRadius: 2,
                padding: 4,
                opacity: 0.9,
                borderWidth: 1,
                borderColor: getChartTheme().gridColor
            }
        },
        grid: {
            borderColor: getChartTheme().gridColor,
            strokeDashArray: 3,
            position: 'back',
            xaxis: {
                lines: {
                    show: false
                }
            },
            yaxis: {
                lines: {
                    show: true
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: layoutColor === 'dark' ? 'dark' : 'light',
                type: 'vertical',
                shadeIntensity: 0.5,
                gradientToColors: getChartTheme().colors.slice(0, 4).map(color => color + '80'),
                inverseColors: false,
                opacityFrom: 1,
                opacityTo: 0.8,
                stops: [0, 100]
            }
        },
        states: {
            hover: {
                filter: {
                    type: 'lighten',
                    value: 0.1
                }
            },
            active: {
                allowMultipleDataPointsSelection: false,
                filter: {
                    type: 'darken',
                    value: 0.7
                }
            }
        },
        tooltip: {
            enabled: true,
            theme: layoutColor === 'dark' ? 'dark' : 'light',
            style: {
                fontSize: '13px',
                fontFamily: 'inherit'
            }
        }
    });

    return (
        <>
            <Row>
                <Col xs={12}>
                    <div className="page-title-box">
                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                            <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-2 gap-md-3">
                                <div>
                                    <h4 className="page-title mb-2">
                                        <i className="mdi mdi-chart-timeline-variant me-2"></i>
                                        <span className="d-none d-lg-inline">Tally Comprehensive Analytics</span>
                                        <span className="d-inline d-lg-none">Analytics Dashboard</span>
                                    </h4>
                                    <nav aria-label="breadcrumb">
                                        <ol className="breadcrumb m-0">
                                            <li className="breadcrumb-item">
                                                <Button 
                                                    variant="link" 
                                                    size="sm"
                                                    className="p-0 text-decoration-none"
                                                    onClick={() => navigate('/tally-dashboard')}
                                                >
                                                    <i className="mdi mdi-view-dashboard me-1"></i>
                                                    Dashboard
                                                </Button>
                                            </li>
                                            <li className="breadcrumb-item active">Comprehensive View</li>
                                        </ol>
                                    </nav>
                                </div>
                                <ThemeToggle size="sm" className="theme-toggle-dashboard" />
                            </div>
                            <div className="d-flex flex-wrap gap-2">
                                <Button 
                                    variant="secondary" 
                                    size="sm"
                                    className="d-flex align-items-center"
                                    onClick={() => navigate('/tally-dashboard')}
                                >
                                    <i className="mdi mdi-arrow-left me-1"></i> 
                                    <span className="d-none d-sm-inline">Back</span>
                                </Button>
                                <Button 
                                    variant="primary" 
                                    size="sm"
                                    onClick={fetchComprehensiveData} 
                                    disabled={loading}
                                    className="d-flex align-items-center"
                                >
                                    <i className="mdi mdi-refresh me-1"></i> 
                                    <span className="d-none d-md-inline">Full Sync (All except vouchers)</span>
                                    <span className="d-inline d-md-none">Full Sync</span>
                                </Button>
                                <Button 
                                    variant="warning" 
                                    size="sm"
                                    onClick={() => navigate('/tally-vouchers-detail')}
                                    className="d-flex align-items-center"
                                >
                                    <i className="mdi mdi-file-document me-1"></i> 
                                    <span className="d-none d-md-inline">Fetch Vouchers (Batch Only)</span>
                                    <span className="d-inline d-md-none">Vouchers</span>
                                </Button>
                            </div>
                        </div>
                        <div className="mt-2 d-none d-lg-block">
                            <small className="text-muted">
                                <i className="mdi mdi-information-outline me-1"></i>
                                Use <strong>Full Sync</strong> for all Tally data except vouchers. Use <strong>Fetch Vouchers</strong> for batch voucher sync only.
                            </small>
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
                        <Row className="g-3">
                            {/* Summary Cards */}
                            <Col xs={12} sm={6} md={4} lg={2}>
                                <Card className="widget-flat bg-primary text-white h-100">
                                    <Card.Body className="text-center d-flex flex-column">
                                        <i className="mdi mdi-office-building widget-icon mb-2"></i>
                                        <h3 className="mt-2 mb-2">{comprehensiveData.summary?.companies || 0}</h3>
                                        <p className="mb-0 small">Companies</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={2}>
                                <Card className="widget-flat bg-success text-white h-100">
                                    <Card.Body className="text-center d-flex flex-column">
                                        <i className="mdi mdi-account-multiple widget-icon mb-2"></i>
                                        <h3 className="mt-2 mb-2">{comprehensiveData.summary?.ledgers || 0}</h3>
                                        <p className="mb-0 small">Sundry Debtors</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={2}>
                                <Card className="widget-flat bg-info text-white h-100">
                                    <Card.Body className="text-center d-flex flex-column">
                                        <i className="mdi mdi-sitemap widget-icon mb-2"></i>
                                        <h3 className="mt-2 mb-2">{comprehensiveData.summary?.groups || 0}</h3>
                                        <p className="mb-0 small">Groups</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={2}>
                                <Card className="widget-flat bg-warning text-white h-100">
                                    <Card.Body className="text-center d-flex flex-column">
                                        <i className="mdi mdi-package-variant widget-icon mb-2"></i>
                                        <h3 className="mt-2 mb-2">{comprehensiveData.summary?.stockItems || 0}</h3>
                                        <p className="mb-0 small">Stock Items</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={2}>
                                <Card className="widget-flat bg-danger text-white h-100">
                                    <Card.Body className="text-center d-flex flex-column">
                                        <i className="mdi mdi-file-document widget-icon mb-2"></i>
                                        <h3 className="mt-2 mb-2">{comprehensiveData.summary?.vouchers || 0}</h3>
                                        <p className="mb-0 small">Vouchers</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} sm={6} md={4} lg={2}>
                                <Card className="widget-flat bg-secondary text-white h-100">
                                    <Card.Body className="text-center d-flex flex-column">
                                        <i className="mdi mdi-currency-usd widget-icon mb-2"></i>
                                        <h3 className="mt-2 mb-2">{comprehensiveData.summary?.currencies || 0}</h3>
                                        <p className="mb-0 small">Currencies</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Row>
                        
                        {/* Financial Summary */}
                        <Row className="mt-4 g-3">
                            <Col xs={12} md={6} lg={4}>
                                <Card className="financial-card h-100">
                                    <Card.Body className="text-center d-flex flex-column">
                                        <div className="financial-icon bg-success mb-3">
                                            <i className="mdi mdi-bank"></i>
                                        </div>
                                        <h6 className="text-muted mb-2">Total Opening Balance</h6>
                                        <h3 className="text-success mb-0">
                                            {formatCurrency(comprehensiveData.financialSummary?.totalOpeningBalance || 0)}
                                        </h3>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} md={6} lg={4}>
                                <Card className="financial-card h-100">
                                    <Card.Body className="text-center d-flex flex-column">
                                        <div className="financial-icon bg-primary mb-3">
                                            <i className="mdi mdi-cash-multiple"></i>
                                        </div>
                                        <h6 className="text-muted mb-2">Total Closing Balance</h6>
                                        <h3 className="text-primary mb-0">
                                            {formatCurrency(comprehensiveData.financialSummary?.totalClosingBalance || 0)}
                                        </h3>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col xs={12} md={12} lg={4}>
                                <Card className="financial-card h-100">
                                    <Card.Body className="text-center d-flex flex-column">
                                        <div className={`financial-icon mb-3 ${
                                            ((comprehensiveData.financialSummary?.totalClosingBalance || 0) - 
                                             (comprehensiveData.financialSummary?.totalOpeningBalance || 0)) >= 0 
                                            ? 'bg-success' : 'bg-danger'
                                        }`}>
                                            <i className="mdi mdi-chart-line"></i>
                                        </div>
                                        <h6 className="text-muted mb-2">Net Change</h6>
                                        <h3 className={`mb-0 ${
                                            ((comprehensiveData.financialSummary?.totalClosingBalance || 0) - 
                                             (comprehensiveData.financialSummary?.totalOpeningBalance || 0)) >= 0 
                                            ? 'text-success' : 'text-danger'
                                        }`}>
                                            {formatCurrency(
                                                (comprehensiveData.financialSummary?.totalClosingBalance || 0) - 
                                                (comprehensiveData.financialSummary?.totalOpeningBalance || 0)
                                            )}
                                        </h3>
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
                                                                    {comprehensiveData.recentActivities?.ledgers?.map((ledger, index) => (
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
