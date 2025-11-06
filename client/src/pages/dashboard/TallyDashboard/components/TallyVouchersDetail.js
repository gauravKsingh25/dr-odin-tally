// @flow
import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Table, Badge, Form, Modal, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { APICore } from '../../../../helpers/api/apiCore';
import MainLoader from '../../../../components/MainLoader';
import axios from 'axios';
import '../TallyDashboard.css';

const TallyVouchersDetail = () => {
    const [vouchersData, setVouchersData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [voucherTypeFilter, setVoucherTypeFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [quickDateRange, setQuickDateRange] = useState('');
    const [itemsPerPage] = useState(20);
    const [expandedRows, setExpandedRows] = useState([]);
    const [selectedVouchers, setSelectedVouchers] = useState([]);
    
    // Modal states
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedVoucherDetail, setSelectedVoucherDetail] = useState(null);
    const [showBulkModal, setShowBulkModal] = useState(false);
    
    const navigate = useNavigate();

    // Fetch vouchers data with pagination and filters
    const fetchVouchersData = useCallback(async (page = 1, search = '', voucherType = '', date = '', fromDateParam = '', toDateParam = '') => {
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
            
            const params = new URLSearchParams({
                page: page.toString(),
                limit: itemsPerPage.toString(),
                ...(search && { search }),
                ...(voucherType && { voucherType }),
                ...(date && { date }),
                ...(fromDateParam && { fromDate: fromDateParam }),
                ...(toDateParam && { toDate: toDateParam })
            });
            
            const response = await axios.get(`/tally/vouchers?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 120000 // 120 seconds
            });
            
            if (response.data.status === 200) {
                const list = response.data.data.vouchers || [];
                list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
                setVouchersData(list);
                const total = response.data.data.total;
                const computedTotalPages = total ? Math.ceil(total / itemsPerPage) : Math.max(1, Math.ceil(list.length / itemsPerPage));
                setTotalPages(computedTotalPages);
                setError(null);
            } else {
                setError(`Server returned status: ${response.data.status}`);
            }
        } catch (error) {
            console.error('Vouchers fetch error:', error);
            
            if (error.response?.status === 401) {
                const api = new APICore();
                api.setLoggedInUser(null);
                navigate('/account/login');
                return;
            }
            
            setError(error.response?.data?.message || 'Failed to fetch vouchers data');
        } finally {
            setLoading(false);
        }
    }, [navigate, itemsPerPage]);

    // Toggle row expansion
    const toggleRowExpansion = (voucherId) => {
        setExpandedRows(prev => 
            prev.includes(voucherId) 
                ? prev.filter(id => id !== voucherId)
                : [...prev, voucherId]
        );
    };

    // Handle voucher selection
    const handleVoucherSelection = (voucherId, isSelected) => {
        setSelectedVouchers(prev => 
            isSelected 
                ? [...prev, voucherId]
                : prev.filter(id => id !== voucherId)
        );
    };

    // Fetch voucher details for modal
    const fetchVoucherDetails = async (voucherId) => {
        try {
            const api = new APICore();
            const loggedInUser = api.getLoggedInUser();
            const token = loggedInUser?.token;
            
            const response = await axios.get(`/tally/vouchers/${voucherId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.status === 200) {
                setSelectedVoucherDetail(response.data.data);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('Voucher details fetch error:', error);
            alert('Failed to fetch voucher details');
        }
    };

    // Handle print voucher
    const handlePrintVoucher = (voucher) => {
        // Implementation for printing voucher
        console.log('Print voucher:', voucher);
        alert('Print functionality to be implemented');
    };

    // Handle edit voucher
    const handleEditVoucher = (voucher) => {
        // Implementation for editing voucher
        console.log('Edit voucher:', voucher);
        alert('Edit functionality to be implemented');
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            const prev = currentPage - 1;
            setCurrentPage(prev);
            fetchVouchersData(prev, searchTerm, voucherTypeFilter, dateFilter, fromDate, toDate);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            const next = currentPage + 1;
            setCurrentPage(next);
            fetchVouchersData(next, searchTerm, voucherTypeFilter, dateFilter, fromDate, toDate);
        }
    };

    // Handle search
    const handleSearch = () => {
        setCurrentPage(1);
        fetchVouchersData(1, searchTerm, voucherTypeFilter, dateFilter, fromDate, toDate);
    };

    // Handle filter reset
    const handleReset = () => {
        setSearchTerm('');
        setVoucherTypeFilter('');
        setDateFilter('');
        setFromDate('');
        setToDate('');
        setQuickDateRange('');
        setCurrentPage(1);
        fetchVouchersData(1, '', '', '', '', '');
    };

    // Handle quick date range selection
    const handleQuickDateRange = (range) => {
        setQuickDateRange(range);
        const today = new Date();
        let startDate = new Date();
        let endDate = new Date();

        switch (range) {
            case 'today':
                startDate = endDate = today;
                break;
            case 'yesterday':
                startDate = endDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
                break;
            case 'thisWeek':
                startDate = new Date(today.setDate(today.getDate() - today.getDay()));
                endDate = new Date();
                break;
            case 'lastWeek':
                startDate = new Date(today.setDate(today.getDate() - today.getDay() - 7));
                endDate = new Date(today.setDate(today.getDate() - today.getDay() - 1));
                break;
            case 'thisMonth':
                startDate = new Date(today.getFullYear(), today.getMonth(), 1);
                endDate = new Date();
                break;
            case 'lastMonth':
                startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                endDate = new Date(today.getFullYear(), today.getMonth(), 0);
                break;
            case 'thisQuarter':
                const quarter = Math.floor(today.getMonth() / 3);
                startDate = new Date(today.getFullYear(), quarter * 3, 1);
                endDate = new Date();
                break;
            case 'thisYear':
                startDate = new Date(today.getFullYear(), 0, 1);
                endDate = new Date();
                break;
            case 'last30days':
                startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
                endDate = new Date();
                break;
            case 'last90days':
                startDate = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
                endDate = new Date();
                break;
            default:
                return;
        }

        const formatDate = (date) => date.toISOString().split('T')[0];
        setFromDate(formatDate(startDate));
        setToDate(formatDate(endDate));
        
        // Auto-apply the filter
        setCurrentPage(1);
        fetchVouchersData(1, searchTerm, voucherTypeFilter, dateFilter, formatDate(startDate), formatDate(endDate));
    };

    // Handle date range reset
    const handleDateRangeReset = () => {
        setFromDate('');
        setToDate('');
        setQuickDateRange('');
        setCurrentPage(1);
        fetchVouchersData(1, searchTerm, voucherTypeFilter, dateFilter, '', '');
    };

    useEffect(() => {
        const loadInitialData = async () => {
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
                
                const params = new URLSearchParams({
                    page: '1',
                    limit: itemsPerPage.toString()
                });
                
                const response = await axios.get(`/tally/vouchers?${params}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 120000 // 120 seconds
                });
                
                if (response.data.status === 200) {
                    const list = response.data.data.vouchers || [];
                    list.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
                    setVouchersData(list);
                    const total = response.data.data.total;
                    const computedTotalPages = total ? Math.ceil(total / itemsPerPage) : Math.max(1, Math.ceil(list.length / itemsPerPage));
                    setTotalPages(computedTotalPages);
                    setError(null);
                } else {
                    setError(`Server returned status: ${response.data.status}`);
                }
            } catch (error) {
                console.error('Vouchers fetch error:', error);
                
                if (error.response?.status === 401) {
                    const api = new APICore();
                    api.setLoggedInUser(null);
                    navigate('/account/login');
                    return;
                }
                
                setError(error.response?.data?.message || 'Failed to fetch vouchers data');
            } finally {
                setLoading(false);
            }
        };
        
        loadInitialData();
    }, [navigate, itemsPerPage]);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    // Get voucher type badge color
    const getVoucherTypeBadge = (voucherType) => {
        const typeColors = {
            'Sales': 'success',
            'Purchase': 'primary',
            'Receipt': 'info',
            'Payment': 'warning',
            'Journal': 'secondary',
            'Contra': 'dark'
        };
        return typeColors[voucherType] || 'light';
    };

    return (
        <>
            <Row>
                <Col xs={12}>
                    <div className="page-title-box d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="page-title">Tally Vouchers - Detailed View</h4>
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
                                <li className="breadcrumb-item active">Vouchers Detail</li>
                            </ol>
                        </div>
                        <div>
                            <Button 
                                variant="secondary" 
                                onClick={() => navigate('/tally-dashboard')}
                            >
                                <i className="mdi mdi-arrow-left"></i> Back to Dashboard
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Filters */}
            <Row className="mb-3">
                <Col xs={12}>
                    <Card>
                        <Card.Body>
                            <Row className="align-items-end">
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Search Vouchers</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by voucher number or party name..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Voucher Type</Form.Label>
                                        <Form.Select
                                            value={voucherTypeFilter}
                                            onChange={(e) => setVoucherTypeFilter(e.target.value)}
                                        >
                                            <option value="">All Types</option>
                                            <option value="Sales">Sales</option>
                                            <option value="Purchase">Purchase</option>
                                            <option value="Receipt">Receipt</option>
                                            <option value="Payment">Payment</option>
                                            <option value="Journal">Journal</option>
                                            <option value="Contra">Contra</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={dateFilter}
                                            onChange={(e) => setDateFilter(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <div className="d-flex gap-2">
                                        <Button variant="primary" onClick={handleSearch} disabled={loading}>
                                            <i className="mdi mdi-magnify"></i> Search
                                        </Button>
                                        <Button variant="outline-secondary" onClick={handleReset}>
                                            <i className="mdi mdi-refresh"></i> Reset
                                        </Button>
                                    </div>
                                </Col>
                                <Col md={3} className="text-end">
                                    <div className="d-flex gap-2 justify-content-end">
                                        <Button variant="success" disabled={loading}>
                                            <i className="mdi mdi-download"></i> Export
                                        </Button>
                                        {selectedVouchers.length > 0 && (
                                            <Button 
                                                variant="info" 
                                                title={`${selectedVouchers.length} vouchers selected`}
                                                onClick={() => setShowBulkModal(true)}
                                            >
                                                <i className="mdi mdi-check-all"></i> Bulk ({selectedVouchers.length})
                                            </Button>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                            
                            {/* Date Range Filter Row */}
                            <Row className="align-items-end mt-3">
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>From Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => setFromDate(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>To Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => setToDate(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Quick Date Ranges</Form.Label>
                                        <Form.Select
                                            value={quickDateRange}
                                            onChange={(e) => handleQuickDateRange(e.target.value)}
                                        >
                                            <option value="">Select Range</option>
                                            <option value="today">Today</option>
                                            <option value="yesterday">Yesterday</option>
                                            <option value="thisWeek">This Week</option>
                                            <option value="lastWeek">Last Week</option>
                                            <option value="thisMonth">This Month</option>
                                            <option value="lastMonth">Last Month</option>
                                            <option value="thisQuarter">This Quarter</option>
                                            <option value="thisYear">This Year</option>
                                            <option value="last30days">Last 30 Days</option>
                                            <option value="last90days">Last 90 Days</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Button 
                                        variant="outline-info" 
                                        onClick={handleDateRangeReset}
                                        className="me-2"
                                    >
                                        <i className="mdi mdi-calendar-remove"></i> Clear Dates
                                    </Button>
                                    <Button 
                                        variant="info" 
                                        onClick={handleSearch}
                                        disabled={loading}
                                    >
                                        <i className="mdi mdi-calendar-check"></i> Apply Date Filter
                                    </Button>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
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

            {/* Vouchers Table */}
            <Row>
                <Col xs={12}>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="header-title">
                                    Voucher Details
                                    {!loading && vouchersData.length > 0 && (
                                        <span className="text-muted"> ({vouchersData.length} records)</span>
                                    )}
                                </h4>
                            </div>

                            {loading ? (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                                    <MainLoader />
                                </div>
                            ) : (
                                <>
                                    <div className="table-responsive">
                                        <Table hover className="mb-0">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>
                                                        <Form.Check
                                                            type="checkbox"
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedVouchers(vouchersData.map(voucher => voucher._id));
                                                                } else {
                                                                    setSelectedVouchers([]);
                                                                }
                                                            }}
                                                        />
                                                    </th>
                                                    <th>#</th>
                                                    <th>Date</th>
                                                    <th>Voucher No</th>
                                                    <th>Type</th>
                                                    <th>Party Name</th>
                                                    <th>Reference</th>
                                                    <th>Amount</th>
                                                    <th>Company</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {vouchersData.length > 0 ? (
                                                    vouchersData.map((voucher, index) => (
                                                        <React.Fragment key={voucher._id || index}>
                                                            <tr>
                                                                <td>
                                                                    <Form.Check
                                                                        type="checkbox"
                                                                        checked={selectedVouchers.includes(voucher._id)}
                                                                        onChange={(e) => handleVoucherSelection(voucher._id, e.target.checked)}
                                                                    />
                                                                </td>
                                                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                                <td>
                                                                    {voucher.date ? 
                                                                        new Date(voucher.date).toLocaleDateString('en-IN') : 
                                                                        'N/A'
                                                                    }
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column">
                                                                        <strong>{voucher.voucherNumber || 'N/A'}</strong>
                                                                        {voucher.originalRef && (
                                                                            <small className="text-muted">
                                                                                Ref: {voucher.originalRef}
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <Badge bg={getVoucherTypeBadge(voucher.voucherType)}>
                                                                        {voucher.voucherType || 'Unknown'}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    <div className="text-truncate" style={{ maxWidth: '150px' }} title={voucher.party || voucher.partyName}>
                                                                        {voucher.party || voucher.partyName || 'N/A'}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="text-truncate" style={{ maxWidth: '120px' }} title={voucher.reference || voucher.narration}>
                                                                        {voucher.reference || voucher.narration || 'N/A'}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span className={`fw-bold ${voucher.amount >= 0 ? 'text-success' : 'text-danger'}`}>
                                                                        {formatCurrency(Math.abs(voucher.amount || 0))}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div className="text-truncate" style={{ maxWidth: '120px' }} title={voucher.companyName}>
                                                                        {voucher.companyName || 'N/A'}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex gap-1">
                                                                        <Button 
                                                                            variant="outline-primary" 
                                                                            size="sm"
                                                                            title="Expand Details"
                                                                            onClick={() => toggleRowExpansion(voucher._id)}
                                                                        >
                                                                            <i className={`mdi mdi-chevron-${expandedRows.includes(voucher._id) ? 'up' : 'down'}`}></i>
                                                                        </Button>
                                                                        <Button 
                                                                            variant="outline-info" 
                                                                            size="sm"
                                                                            title="View Details"
                                                                            onClick={() => fetchVoucherDetails(voucher._id)}
                                                                        >
                                                                            <i className="mdi mdi-eye"></i>
                                                                        </Button>
                                                                        <Button 
                                                                            variant="outline-success" 
                                                                            size="sm"
                                                                            title="Print Voucher"
                                                                            onClick={() => handlePrintVoucher(voucher)}
                                                                        >
                                                                            <i className="mdi mdi-printer"></i>
                                                                        </Button>
                                                                        <Button 
                                                                            variant="outline-warning" 
                                                                            size="sm"
                                                                            title="Edit Voucher"
                                                                            onClick={() => handleEditVoucher(voucher)}
                                                                        >
                                                                            <i className="mdi mdi-pencil"></i>
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            
                                                            {/* Expanded Row Details */}
                                                            {expandedRows.includes(voucher._id) && (
                                                                <tr>
                                                                    <td colSpan="10" className="bg-light">
                                                                        <div className="p-3">
                                                                            <Row>
                                                                                <Col md={4}>
                                                                                    <h6 className="text-primary">Voucher Information</h6>
                                                                                    <p className="mb-2">
                                                                                        <strong>GUID:</strong> 
                                                                                        <small className="text-muted d-block">{voucher.guid || 'N/A'}</small>
                                                                                    </p>
                                                                                    <p className="mb-2">
                                                                                        <strong>Master ID:</strong> {voucher.masterId || 'N/A'}
                                                                                    </p>
                                                                                    <p className="mb-2">
                                                                                        <strong>Voucher Key:</strong> {voucher.voucherKey || 'N/A'}
                                                                                    </p>
                                                                                    <p className="mb-2">
                                                                                        <strong>Effective Date:</strong> {
                                                                                            voucher.effectiveDate ? 
                                                                                                new Date(voucher.effectiveDate).toLocaleDateString('en-IN') : 
                                                                                                'N/A'
                                                                                        }
                                                                                    </p>
                                                                                    {voucher.isDeemedPositive !== undefined && (
                                                                                        <p className="mb-2">
                                                                                            <strong>Is Deemed Positive:</strong> 
                                                                                            <Badge bg={voucher.isDeemedPositive ? 'success' : 'secondary'} className="ms-2">
                                                                                                {voucher.isDeemedPositive ? 'Yes' : 'No'}
                                                                                            </Badge>
                                                                                        </p>
                                                                                    )}
                                                                                </Col>
                                                                                <Col md={4}>
                                                                                    <h6 className="text-primary">Transaction Details</h6>
                                                                                    <p className="mb-2">
                                                                                        <strong>Party Ledger:</strong> {voucher.partyLedgerName || 'N/A'}
                                                                                    </p>
                                                                                    {voucher.basicBuyersOrderNo && (
                                                                                        <p className="mb-2">
                                                                                            <strong>Order No:</strong> {voucher.basicBuyersOrderNo}
                                                                                        </p>
                                                                                    )}
                                                                                    {voucher.basicBuyersOrderDate && (
                                                                                        <p className="mb-2">
                                                                                            <strong>Order Date:</strong> {
                                                                                                new Date(voucher.basicBuyersOrderDate).toLocaleDateString('en-IN')
                                                                                            }
                                                                                        </p>
                                                                                    )}
                                                                                    {voucher.persistedView && (
                                                                                        <p className="mb-2">
                                                                                            <strong>View:</strong> {voucher.persistedView}
                                                                                        </p>
                                                                                    )}
                                                                                    {voucher.voucherTypeName && (
                                                                                        <p className="mb-2">
                                                                                            <strong>Voucher Type Name:</strong> {voucher.voucherTypeName}
                                                                                        </p>
                                                                                    )}
                                                                                </Col>
                                                                                <Col md={4}>
                                                                                    <h6 className="text-primary">System Information</h6>
                                                                                    <p className="mb-2">
                                                                                        <strong>Company:</strong> {voucher.companyName || 'N/A'}
                                                                                    </p>
                                                                                    <p className="mb-2">
                                                                                        <strong>Created:</strong> {
                                                                                            voucher.createdAt ? 
                                                                                                new Date(voucher.createdAt).toLocaleDateString('en-IN') : 
                                                                                                'N/A'
                                                                                        }
                                                                                    </p>
                                                                                    <p className="mb-2">
                                                                                        <strong>Last Updated:</strong> {
                                                                                            voucher.updatedAt ? 
                                                                                                new Date(voucher.updatedAt).toLocaleDateString('en-IN') : 
                                                                                                'N/A'
                                                                                        }
                                                                                    </p>
                                                                                    {voucher.alternateCurrency && (
                                                                                        <p className="mb-2">
                                                                                            <strong>Currency:</strong> {voucher.alternateCurrency}
                                                                                        </p>
                                                                                    )}
                                                                                </Col>
                                                                            </Row>
                                                                            
                                                                            {/* Ledger Entries */}
                                                                            {voucher.allLedgerEntries && voucher.allLedgerEntries.length > 0 && (
                                                                                <Row className="mt-3">
                                                                                    <Col xs={12}>
                                                                                        <h6 className="text-primary">Ledger Entries</h6>
                                                                                        <div className="table-responsive">
                                                                                            <Table size="sm" className="border">
                                                                                                <thead className="table-secondary">
                                                                                                    <tr>
                                                                                                        <th>Ledger Name</th>
                                                                                                        <th>Is Deemed Positive</th>
                                                                                                        <th>Amount</th>
                                                                                                        <th>Type</th>
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody>
                                                                                                    {voucher.allLedgerEntries.slice(0, 5).map((entry, idx) => (
                                                                                                        <tr key={idx}>
                                                                                                            <td>{entry.ledgerName || 'N/A'}</td>
                                                                                                            <td>
                                                                                                                <Badge bg={entry.isDeemedPositive ? 'success' : 'danger'} size="sm">
                                                                                                                    {entry.isDeemedPositive ? 'Credit' : 'Debit'}
                                                                                                                </Badge>
                                                                                                            </td>
                                                                                                            <td className={entry.isDeemedPositive ? 'text-success' : 'text-danger'}>
                                                                                                                {formatCurrency(Math.abs(entry.amount || 0))}
                                                                                                            </td>
                                                                                                            <td>
                                                                                                                {entry.ledgerName?.includes('Sales') ? 'Sales' : 
                                                                                                                 entry.ledgerName?.includes('Purchase') ? 'Purchase' : 
                                                                                                                 entry.ledgerName?.includes('Cash') ? 'Cash' : 
                                                                                                                 'Other'}
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    ))}
                                                                                                    {voucher.allLedgerEntries.length > 5 && (
                                                                                                        <tr>
                                                                                                            <td colSpan="4" className="text-center text-muted">
                                                                                                                ... and {voucher.allLedgerEntries.length - 5} more entries
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    )}
                                                                                                </tbody>
                                                                                            </Table>
                                                                                        </div>
                                                                                    </Col>
                                                                                </Row>
                                                                            )}
                                                                            
                                                                            {/* Inventory Entries */}
                                                                            {voucher.allInventoryEntries && voucher.allInventoryEntries.length > 0 && (
                                                                                <Row className="mt-3">
                                                                                    <Col xs={12}>
                                                                                        <h6 className="text-primary">Inventory Entries</h6>
                                                                                        <div className="table-responsive">
                                                                                            <Table size="sm" className="border">
                                                                                                <thead className="table-secondary">
                                                                                                    <tr>
                                                                                                        <th>Stock Item</th>
                                                                                                        <th>Quantity</th>
                                                                                                        <th>Rate</th>
                                                                                                        <th>Amount</th>
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody>
                                                                                                    {voucher.allInventoryEntries.slice(0, 3).map((entry, idx) => (
                                                                                                        <tr key={idx}>
                                                                                                            <td>{entry.stockItemName || 'N/A'}</td>
                                                                                                            <td>{entry.actualQty || 0} {entry.primaryUnits || ''}</td>
                                                                                                            <td>{formatCurrency(entry.rate || 0)}</td>
                                                                                                            <td>{formatCurrency(entry.amount || 0)}</td>
                                                                                                        </tr>
                                                                                                    ))}
                                                                                                    {voucher.allInventoryEntries.length > 3 && (
                                                                                                        <tr>
                                                                                                            <td colSpan="4" className="text-center text-muted">
                                                                                                                ... and {voucher.allInventoryEntries.length - 3} more items
                                                                                                            </td>
                                                                                                        </tr>
                                                                                                    )}
                                                                                                </tbody>
                                                                                            </Table>
                                                                                        </div>
                                                                                    </Col>
                                                                                </Row>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="10" className="text-center text-muted py-4">
                                                            <i className="mdi mdi-file-document-outline mdi-48px d-block mb-2"></i>
                                                            No vouchers found. Try adjusting your filters.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <Row className="mt-3">
                                            <Col xs={12} className="d-flex justify-content-between align-items-center">
                                                <div className="text-muted small">
                                                    Page {currentPage} of {totalPages} 
                                                    <span className="ms-2">({vouchersData.length} vouchers)</span>
                                                </div>
                                                <div className="d-flex gap-2">
                                                    <Button 
                                                        variant="outline-secondary" 
                                                        size="sm" 
                                                        disabled={currentPage === 1} 
                                                        onClick={handlePrevPage}
                                                    >
                                                        <i className="mdi mdi-chevron-left"></i> Prev
                                                    </Button>
                                                    <span className="align-self-center text-muted small px-2">
                                                        {currentPage} / {totalPages}
                                                    </span>
                                                    <Button 
                                                        variant="outline-primary" 
                                                        size="sm" 
                                                        disabled={currentPage >= totalPages} 
                                                        onClick={handleNextPage}
                                                    >
                                                        Next <i className="mdi mdi-chevron-right"></i>
                                                    </Button>
                                                </div>
                                            </Col>
                                        </Row>
                                    )}
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Voucher Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>Voucher Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedVoucherDetail ? (
                        <Row>
                            <Col md={6}>
                                <h5>{selectedVoucherDetail.voucherNumber}</h5>
                                <p><strong>Type:</strong> {selectedVoucherDetail.voucherType}</p>
                                <p><strong>Date:</strong> {
                                    selectedVoucherDetail.date ? 
                                        new Date(selectedVoucherDetail.date).toLocaleDateString('en-IN') : 
                                        'N/A'
                                }</p>
                                <p><strong>Party:</strong> {selectedVoucherDetail.party || selectedVoucherDetail.partyName || 'N/A'}</p>
                                <p><strong>Reference:</strong> {selectedVoucherDetail.reference || selectedVoucherDetail.narration || 'N/A'}</p>
                                <p><strong>Amount:</strong> {formatCurrency(selectedVoucherDetail.amount || 0)}</p>
                            </Col>
                            <Col md={6}>
                                <p><strong>Company:</strong> {selectedVoucherDetail.companyName || 'N/A'}</p>
                                <p><strong>GUID:</strong> <small>{selectedVoucherDetail.guid || 'N/A'}</small></p>
                                <p><strong>Master ID:</strong> {selectedVoucherDetail.masterId || 'N/A'}</p>
                                <p><strong>Voucher Key:</strong> {selectedVoucherDetail.voucherKey || 'N/A'}</p>
                                <p><strong>Effective Date:</strong> {
                                    selectedVoucherDetail.effectiveDate ? 
                                        new Date(selectedVoucherDetail.effectiveDate).toLocaleDateString('en-IN') : 
                                        'N/A'
                                }</p>
                            </Col>
                            
                            {/* Complete Ledger Entries */}
                            {selectedVoucherDetail.allLedgerEntries && selectedVoucherDetail.allLedgerEntries.length > 0 && (
                                <Col xs={12} className="mt-3">
                                    <h6>All Ledger Entries</h6>
                                    <div className="table-responsive">
                                        <Table striped size="sm">
                                            <thead>
                                                <tr>
                                                    <th>Ledger Name</th>
                                                    <th>Is Deemed Positive</th>
                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedVoucherDetail.allLedgerEntries.map((entry, idx) => (
                                                    <tr key={idx}>
                                                        <td>{entry.ledgerName || 'N/A'}</td>
                                                        <td>
                                                            <Badge bg={entry.isDeemedPositive ? 'success' : 'danger'}>
                                                                {entry.isDeemedPositive ? 'Credit' : 'Debit'}
                                                            </Badge>
                                                        </td>
                                                        <td className={entry.isDeemedPositive ? 'text-success' : 'text-danger'}>
                                                            {formatCurrency(Math.abs(entry.amount || 0))}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Col>
                            )}
                            
                            {/* Complete Inventory Entries */}
                            {selectedVoucherDetail.allInventoryEntries && selectedVoucherDetail.allInventoryEntries.length > 0 && (
                                <Col xs={12} className="mt-3">
                                    <h6>All Inventory Entries</h6>
                                    <div className="table-responsive">
                                        <Table striped size="sm">
                                            <thead>
                                                <tr>
                                                    <th>Stock Item</th>
                                                    <th>Quantity</th>
                                                    <th>Rate</th>
                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedVoucherDetail.allInventoryEntries.map((entry, idx) => (
                                                    <tr key={idx}>
                                                        <td>{entry.stockItemName || 'N/A'}</td>
                                                        <td>{entry.actualQty || 0} {entry.primaryUnits || ''}</td>
                                                        <td>{formatCurrency(entry.rate || 0)}</td>
                                                        <td>{formatCurrency(entry.amount || 0)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </Col>
                            )}
                        </Row>
                    ) : (
                        <div className="text-center">
                            <Spinner animation="border" />
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Close
                    </Button>
                    <Button variant="success" onClick={() => selectedVoucherDetail && handlePrintVoucher(selectedVoucherDetail)}>
                        <i className="mdi mdi-printer"></i> Print
                    </Button>
                    <Button variant="warning" onClick={() => selectedVoucherDetail && handleEditVoucher(selectedVoucherDetail)}>
                        <i className="mdi mdi-pencil"></i> Edit
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Bulk Operations Modal */}
            <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Bulk Operations ({selectedVouchers.length} vouchers selected)</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-grid gap-2">
                        <Button variant="outline-success" onClick={() => alert('Print Selected functionality to be implemented')}>
                            <i className="mdi mdi-printer-multiple"></i> Print Selected Vouchers
                        </Button>
                        <Button variant="outline-info" onClick={() => alert('Export Selected functionality to be implemented')}>
                            <i className="mdi mdi-file-export"></i> Export Selected to CSV
                        </Button>
                        <Button variant="outline-warning" onClick={() => alert('Bulk Edit functionality to be implemented')}>
                            <i className="mdi mdi-pencil-box-multiple"></i> Bulk Edit
                        </Button>
                        <Button variant="outline-danger" onClick={() => alert('Delete Selected functionality to be implemented')}>
                            <i className="mdi mdi-delete-multiple"></i> Delete Selected
                        </Button>
                        <Button variant="outline-secondary" onClick={() => alert('Archive Selected functionality to be implemented')}>
                            <i className="mdi mdi-archive"></i> Archive Selected
                        </Button>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBulkModal(false)}>
                        Cancel
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default TallyVouchersDetail;
