// @flow
import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Table, Badge, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { APICore } from '../../../../helpers/api/apiCore';
import MainLoader from '../../../../components/MainLoader';
import axios from 'axios';
import config from '../../../../config';
import '../TallyDashboard.css';

const TallyLedgersDetail = () => {
    const [ledgersData, setLedgersData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [groupFilter, setGroupFilter] = useState('');
    const [balanceFilter, setBalanceFilter] = useState('');
    const [availableGroups, setAvailableGroups] = useState([]);
    const [itemsPerPage] = useState(20);
    const [expandedRows, setExpandedRows] = useState({}); // Track expanded rows for dropdown details
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [quickDateRange, setQuickDateRange] = useState('');
    const [relatedInvoices, setRelatedInvoices] = useState({}); // Store related invoices by ledger ID
    const navigate = useNavigate();

    // Fetch ledgers data with pagination and filters
    const fetchLedgersData = useCallback(async (page = 1, search = '', group = '', balance = '', fromDateParam = '', toDateParam = '') => {
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
                ...(group && { group }),
                ...(balance && { balance }),
                ...(fromDateParam && { fromDate: fromDateParam }),
                ...(toDateParam && { toDate: toDateParam })
            });
            
            const response = await axios.get(`${window.location.origin}${config.API_URL}tally/ledgers?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.status === 200) {
                const list = response.data.data.ledgers || [];
                list.sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0));
                
                // Debug logging - remove after testing
                console.log('🔍 Ledger data received:', list.slice(0, 3));
                console.log('🔍 Sample ledger balance data:', list.length > 0 ? {
                    name: list[0].name,
                    openingBalance: list[0].openingBalance,
                    closingBalance: list[0].closingBalance,
                    parent: list[0].parent,
                    group: list[0].group
                } : 'No data');
                
                // Test name cleaning functions
                if (list.length > 0) {
                    const sampleName = list[0].name;
                    console.log('🧹 Name cleaning test:', {
                        original: sampleName,
                        cleaned: sampleName ? sampleName.replace(/\s*\([^)]*\)/g, '').trim() : 'N/A',
                        address: sampleName ? sampleName.match(/\(([^)]+)\)/g)?.map(match => match.slice(1, -1)).join(', ') || null : null
                    });
                }
                
                setLedgersData(list);
                const total = response.data.data.total;
                const computedTotalPages = total ? Math.ceil(total / itemsPerPage) : Math.max(1, Math.ceil(list.length / itemsPerPage));
                setTotalPages(computedTotalPages);
                
                // Extract unique groups for filter dropdown
                const ledgers = response.data.data.ledgers || [];
                const groups = [...new Set(ledgers.map(ledger => ledger.parent || ledger.group).filter(Boolean))];
                console.log('🔍 Available groups extracted:', groups.slice(0, 10));
                setAvailableGroups(groups);
                
                setError(null);
            } else {
                setError(`Server returned status: ${response.data.status}`);
            }
        } catch (error) {
            console.error('Ledgers fetch error:', error);
            
            if (error.response?.status === 401) {
                const api = new APICore();
                api.setLoggedInUser(null);
                navigate('/account/login');
                return;
            }
            
            setError(error.response?.data?.message || 'Failed to fetch ledgers data');
        } finally {
            setLoading(false);
        }
    }, [navigate, itemsPerPage]);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            const prev = currentPage - 1;
            setCurrentPage(prev);
            fetchLedgersData(prev, searchTerm, groupFilter, balanceFilter, fromDate, toDate);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            const next = currentPage + 1;
            setCurrentPage(next);
            fetchLedgersData(next, searchTerm, groupFilter, balanceFilter, fromDate, toDate);
        }
    };

    // Handle search
    const handleSearch = () => {
        setCurrentPage(1);
        fetchLedgersData(1, searchTerm, groupFilter, balanceFilter, fromDate, toDate);
    };

    // Handle filter change and auto-search
    const handleFilterChange = (filterType, value) => {
        switch (filterType) {
            case 'search':
                setSearchTerm(value);
                break;
            case 'group':
                setGroupFilter(value);
                // Immediate search for dropdown changes
                setCurrentPage(1);
                fetchLedgersData(1, searchTerm, value, balanceFilter, fromDate, toDate);
                break;
            case 'balance':
                setBalanceFilter(value);
                // Immediate search for dropdown changes
                setCurrentPage(1);
                fetchLedgersData(1, searchTerm, groupFilter, value, fromDate, toDate);
                break;
            case 'fromDate':
                setFromDate(value);
                break;
            case 'toDate':
                setToDate(value);
                break;
            default:
                break;
        }
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
        fetchLedgersData(1, searchTerm, groupFilter, balanceFilter, formatDate(startDate), formatDate(endDate));
    };

    // Handle date range reset
    const handleDateRangeReset = () => {
        setFromDate('');
        setToDate('');
        setQuickDateRange('');
        setCurrentPage(1);
        fetchLedgersData(1, searchTerm, groupFilter, balanceFilter, '', '');
    };

    // Handle filter reset
    const handleReset = () => {
        setSearchTerm('');
        setGroupFilter('');
        setBalanceFilter('');
        setFromDate('');
        setToDate('');
        setQuickDateRange('');
        setCurrentPage(1);
        fetchLedgersData(1, '', '', '', '', '');
    };

    // Handle export
    const handleExport = async () => {
        try {
            const api = new APICore();
            const loggedInUser = api.getLoggedInUser();
            const token = loggedInUser?.token;
            
            if (!token) {
                navigate('/account/login');
                return;
            }
            
            const params = new URLSearchParams({
                export: 'true',
                ...(searchTerm && { search: searchTerm }),
                ...(groupFilter && { group: groupFilter }),
                ...(balanceFilter && { balance: balanceFilter }),
                ...(fromDate && { fromDate: fromDate }),
                ...(toDate && { toDate: toDate })
            });
            
            const response = await axios.get(`${window.location.origin}${config.API_URL}tally/ledgers?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `ledgers_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data. Please try again.');
        }
    };

    // Debounced search for text input only
    useEffect(() => {
        if (searchTerm === '') {
            // If search is cleared, fetch all data with current filters
            setCurrentPage(1);
            fetchLedgersData(1, '', groupFilter, balanceFilter, fromDate, toDate);
            return;
        }

        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            fetchLedgersData(1, searchTerm, groupFilter, balanceFilter, fromDate, toDate);
        }, 500); // 500ms delay for debounced search

        return () => clearTimeout(timeoutId);
    }, [searchTerm, groupFilter, balanceFilter, fromDate, toDate, fetchLedgersData]);

    useEffect(() => {
        console.log('🚀 TallyLedgersDetail component mounted');
        fetchLedgersData(1, '', '', '', '', '');
    }, [fetchLedgersData]);
    
    // Debug effect to monitor expandedRows changes
    useEffect(() => {
        console.log('🔍 ExpandedRows state changed:', expandedRows);
    }, [expandedRows]);

    // Toggle row expansion for detailed view
    const toggleRowExpansion = async (ledgerId, ledgerName) => {
        const isCurrentlyExpanded = expandedRows[ledgerId];
        
        setExpandedRows(prev => ({
            ...prev,
            [ledgerId]: !prev[ledgerId]
        }));

        // Fetch related invoices if expanding and not already loaded
        if (!isCurrentlyExpanded && !relatedInvoices[ledgerId]) {
            await fetchRelatedInvoices(ledgerId, ledgerName);
        }
    };

    // Fetch related invoices/vouchers for a specific ledger
    const fetchRelatedInvoices = async (ledgerId, ledgerName) => {
        try {
            const api = new APICore();
            const loggedInUser = api.getLoggedInUser();
            const token = loggedInUser?.token;
            
            if (!token) {
                navigate('/account/login');
                return;
            }

            // Search for vouchers related to this ledger
            const params = new URLSearchParams({
                name: ledgerName,
                page: '1',
                limit: '10' // Get last 10 invoices
            });

            const response = await axios.get(`${window.location.origin}${config.API_URL}tally/vouchers-by-employee?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 200) {
                setRelatedInvoices(prev => ({
                    ...prev,
                    [ledgerId]: response.data.data.vouchers || []
                }));
            }
        } catch (error) {
            console.error('Error fetching related invoices:', error);
            setRelatedInvoices(prev => ({
                ...prev,
                [ledgerId]: []
            }));
        }
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    // Get balance badge color
    const getBalanceBadge = (amount) => {
        if (amount > 0) return 'success';
        if (amount < 0) return 'danger';
        return 'secondary';
    };

    // Helper function to extract main name without brackets
    const getCleanLedgerName = (name) => {
        if (!name) return 'N/A';
        // Remove anything in brackets (including the brackets)
        return name.replace(/\s*\([^)]*\)/g, '').trim();
    };

    // Helper function to extract address from brackets
    const getAddressFromName = (name) => {
        if (!name) return null;
        // Extract content from brackets
        const matches = name.match(/\(([^)]+)\)/g);
        if (matches && matches.length > 0) {
            // Remove the parentheses and return the content
            return matches.map(match => match.slice(1, -1)).join(', ');
        }
        return null;
    };

    return (
        <>
            <Row>
                <Col xs={12}>
                    <div className="page-title-box">
                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center gap-3">
                            <div>
                                <h4 className="page-title mb-2">
                                    <i className="mdi mdi-account-multiple me-2"></i>
                                    <span className="d-none d-md-inline">Ledgers - Detailed View</span>
                                    <span className="d-inline d-md-none">Ledgers Detail</span>
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
                                        <li className="breadcrumb-item active">Ledgers Detail</li>
                                    </ol>
                                </nav>
                            </div>
                            <div className="d-flex gap-2">
                                <Button 
                                    variant="secondary" 
                                    size="sm"
                                    className="d-flex align-items-center"
                                    onClick={() => navigate('/tally-dashboard')}
                                >
                                    <i className="mdi mdi-arrow-left me-1"></i> 
                                    <span className="d-none d-sm-inline">Back to Dashboard</span>
                                    <span className="d-inline d-sm-none">Back</span>
                                </Button>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Filters */}
            <Row className="mb-3">
                <Col xs={12}>
                    <Card className="filter-card">
                        <Card.Body>
                            <Row className="g-3 align-items-end">
                                <Col xs={12} md={6} lg={3}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            <i className="mdi mdi-magnify me-1"></i>
                                            Search Ledgers
                                        </Form.Label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type="text"
                                                placeholder="Search by ledger name..."
                                                value={searchTerm}
                                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                                className="search-input"
                                            />
                                            {loading && searchTerm && (
                                                <div className="position-absolute top-50 end-0 translate-middle-y me-3">
                                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                        <span className="visually-hidden">Searching...</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Form.Group>
                                </Col>
                                <Col xs={12} sm={6} md={6} lg={2}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            <i className="mdi mdi-sitemap me-1"></i>
                                            Group
                                        </Form.Label>
                                        <Form.Select
                                            value={groupFilter}
                                            onChange={(e) => handleFilterChange('group', e.target.value)}
                                            className="filter-select"
                                        >
                                            <option value="">All Groups</option>
                                            {/* Static common groups */}
                                            <option value="Current Assets">Current Assets</option>
                                            <option value="Current Liabilities">Current Liabilities</option>
                                            <option value="Fixed Assets">Fixed Assets</option>
                                            <option value="Sundry Debtors">Sundry Debtors</option>
                                            <option value="Sundry Creditors">Sundry Creditors</option>
                                            <option value="Cash-in-Hand">Cash-in-Hand</option>
                                            <option value="Bank Accounts">Bank Accounts</option>
                                            {/* Dynamic groups from data */}
                                            {availableGroups
                                                .filter(group => !['Current Assets', 'Current Liabilities', 'Fixed Assets', 'Sundry Debtors', 'Sundry Creditors', 'Cash-in-Hand', 'Bank Accounts'].includes(group))
                                                .map(group => (
                                                    <option key={group} value={group}>{group}</option>
                                                ))
                                            }
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col xs={12} sm={6} md={6} lg={2}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            <i className="mdi mdi-cash me-1"></i>
                                            Balance Type
                                        </Form.Label>
                                        <Form.Select
                                            value={balanceFilter}
                                            onChange={(e) => handleFilterChange('balance', e.target.value)}
                                            className="filter-select"
                                        >
                                            <option value="">All Balances</option>
                                            <option value="positive">Positive Balance</option>
                                            <option value="negative">Negative Balance</option>
                                            <option value="zero">Zero Balance</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col xs={12} md={6} lg={3}>
                                    <div className="d-flex flex-column flex-sm-row gap-2">
                                        <Button 
                                            variant="primary" 
                                            size="sm"
                                            onClick={handleSearch} 
                                            disabled={loading}
                                            className="flex-fill d-flex align-items-center justify-content-center"
                                        >
                                            <i className="mdi mdi-magnify me-1"></i> 
                                            <span className="d-none d-sm-inline">Search</span>
                                        </Button>
                                        <Button 
                                            variant="outline-secondary" 
                                            size="sm"
                                            onClick={handleReset}
                                            className="flex-fill d-flex align-items-center justify-content-center"
                                        >
                                            <i className="mdi mdi-refresh me-1"></i> 
                                            <span className="d-none d-sm-inline">Reset</span>
                                        </Button>
                                    </div>
                                </Col>
                                <Col xs={12} md={6} lg={2}>
                                    <Button 
                                        variant="success" 
                                        size="sm"
                                        onClick={handleExport} 
                                        disabled={loading}
                                        className="w-100 d-flex align-items-center justify-content-center"
                                    >
                                        <i className="mdi mdi-download me-1"></i> 
                                        <span className="d-none d-sm-inline">Export</span>
                                        <span className="d-inline d-sm-none">CSV</span>
                                    </Button>
                                </Col>
                            </Row>
                            
                            {/* Date Range Filter Row */}
                            <Row className="g-3 align-items-end mt-3 pt-3 border-top">
                                <Col xs={12} sm={6} md={4} lg={2}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            <i className="mdi mdi-calendar-start me-1"></i>
                                            From Date
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={fromDate}
                                            onChange={(e) => handleFilterChange('fromDate', e.target.value)}
                                            className="date-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} sm={6} md={4} lg={2}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            <i className="mdi mdi-calendar-end me-1"></i>
                                            To Date
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={toDate}
                                            onChange={(e) => handleFilterChange('toDate', e.target.value)}
                                            className="date-input"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12} sm={6} md={4} lg={3}>
                                    <Form.Group>
                                        <Form.Label className="fw-semibold">
                                            <i className="mdi mdi-calendar-clock me-1"></i>
                                            Quick Ranges
                                        </Form.Label>
                                        <Form.Select
                                            value={quickDateRange}
                                            onChange={(e) => handleQuickDateRange(e.target.value)}
                                            className="filter-select"
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
                                <Col xs={12} sm={6} md={12} lg={5}>
                                    <div className="d-flex flex-column flex-sm-row gap-2">
                                        <Button 
                                            variant="outline-info" 
                                            size="sm"
                                            onClick={handleDateRangeReset}
                                            className="flex-fill d-flex align-items-center justify-content-center"
                                        >
                                            <i className="mdi mdi-calendar-remove me-1"></i> 
                                            <span className="d-none d-md-inline">Clear Dates</span>
                                            <span className="d-inline d-md-none">Clear</span>
                                        </Button>
                                        <Button 
                                            variant="info" 
                                            size="sm"
                                            onClick={handleSearch}
                                            disabled={loading}
                                            className="flex-fill d-flex align-items-center justify-content-center"
                                        >
                                            <i className="mdi mdi-calendar-check me-1"></i> 
                                            <span className="d-none d-md-inline">Apply Date Filter</span>
                                            <span className="d-inline d-md-none">Apply</span>
                                        </Button>
                                    </div>
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

            {/* Ledgers Table */}
            <Row>
                <Col xs={12}>
                    <Card className="data-table-card">
                        <Card.Body>
                            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-3">
                                <div>
                                    <h4 className="header-title mb-1">
                                        <i className="mdi mdi-account-multiple me-2"></i>
                                        Ledgers Details 
                                        {!loading && ledgersData.length > 0 && (
                                            <span className="text-muted small"> ({ledgersData.length} records)</span>
                                        )}
                                    </h4>
                                    {(searchTerm || groupFilter || balanceFilter) && (
                                        <Badge bg="info" className="small">
                                            <i className="mdi mdi-filter me-1"></i>
                                            Filtered Results
                                        </Badge>
                                    )}
                                </div>
                                <div className="d-flex flex-wrap gap-2">
                                    <Button 
                                        variant="info" 
                                        size="sm" 
                                        onClick={() => fetchLedgersData(currentPage, searchTerm, groupFilter, balanceFilter, fromDate, toDate)} 
                                        disabled={loading}
                                        className="d-flex align-items-center"
                                    >
                                        <i className="mdi mdi-refresh me-1"></i> 
                                        <span className="d-none d-sm-inline">Refresh</span>
                                    </Button>
                                    {(searchTerm || groupFilter || balanceFilter) && (
                                        <Button 
                                            variant="outline-secondary" 
                                            size="sm" 
                                            onClick={handleReset}
                                            className="d-flex align-items-center"
                                        >
                                            <i className="mdi mdi-filter-remove me-1"></i> 
                                            <span className="d-none d-sm-inline">Clear Filters</span>
                                        </Button>
                                    )}
                                </div>
                            </div>                            {loading ? (
                                <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                                    <MainLoader />
                                </div>
                            ) : (
                                <>
                                    <div className="table-responsive">
                                        <Table hover className="mb-0">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th style={{ width: '40px' }}></th> {/* Dropdown toggle column */}
                                                    <th>#</th>
                                                    <th>Date</th>
                                                    <th>Ledger Name</th>
                                                    <th>Parent</th>
                                                    <th>Group</th>
                                                    <th>Opening Balance</th>
                                                    <th>Closing Balance</th>
                                                    <th>Net Change</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {ledgersData.length > 0 ? (
                                                    ledgersData.map((ledger, index) => {
                                                        const netChange = (ledger.closingBalance || 0) - (ledger.openingBalance || 0);
                                                        const dateValue = ledger.lastUpdated || ledger.updatedAt || ledger.createdAt;
                                                        const formattedDate = dateValue ? new Date(dateValue).toLocaleDateString() : 'N/A';
                                                        const ledgerId = ledger._id || index;
                                                        const isExpanded = expandedRows[ledgerId];
                                                        
                                                        return (
                                                            <React.Fragment key={ledgerId}>
                                                                <tr>
                                                                    <td className="text-center">
                                                                        <Button
                                                                            variant="outline-secondary"
                                                                            size="sm"
                                                                            onClick={() => toggleRowExpansion(ledgerId, ledger.name)}
                                                                            title={isExpanded ? "Hide Details" : "Show Details"}
                                                                        >
                                                                            <i className={`mdi ${isExpanded ? 'mdi-chevron-up' : 'mdi-chevron-down'}`}></i>
                                                                        </Button>
                                                                    </td>
                                                                    <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                                    <td>{formattedDate}</td>
                                                                    <td>
                                                                        <div className="d-flex flex-column">
                                                                            <strong>{getCleanLedgerName(ledger.name)}</strong>
                                                                            {(getAddressFromName(ledger.name) || ledger.aliasName) && (
                                                                                <small className="text-muted">
                                                                                    {getAddressFromName(ledger.name) && (
                                                                                        <span>{getAddressFromName(ledger.name)}</span>
                                                                                    )}
                                                                                    {getAddressFromName(ledger.name) && ledger.aliasName && ' • '}
                                                                                    {ledger.aliasName && (
                                                                                        <span>Alias: {ledger.aliasName}</span>
                                                                                    )}
                                                                                </small>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="text-truncate" style={{ maxWidth: '120px' }}>
                                                                            {ledger.parent || 'N/A'}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="text-truncate" style={{ maxWidth: '120px' }}>
                                                                            {ledger.group || ledger.stockGroup || 'N/A'}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <Badge bg={getBalanceBadge(ledger.openingBalance)}>
                                                                            {formatCurrency(ledger.openingBalance || 0)}
                                                                        </Badge>
                                                                        {/* Debug info - remove after testing */}
                                                                        <div className="small text-muted" style={{ fontSize: '10px' }}>
                                                                            Raw: {JSON.stringify(ledger.openingBalance)}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <Badge bg={getBalanceBadge(ledger.closingBalance)}>
                                                                            {formatCurrency(ledger.closingBalance || 0)}
                                                                        </Badge>
                                                                        {/* Debug info - remove after testing */}
                                                                        <div className="small text-muted" style={{ fontSize: '10px' }}>
                                                                            Raw: {JSON.stringify(ledger.closingBalance)}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <span className={`fw-bold ${netChange >= 0 ? 'text-success' : 'text-danger'}`}>
                                                                            {netChange >= 0 ? '+' : ''}{formatCurrency(netChange)}
                                                                        </span>
                                                                    </td>
                                                                    <td>
                                                                        <Badge bg={ledger.isActive !== false ? 'success' : 'secondary'}>
                                                                            {ledger.isActive !== false ? 'Active' : 'Inactive'}
                                                                        </Badge>
                                                                    </td>
                                                                    <td>
                                                                        <div className="d-flex gap-1">
                                                                            <Button 
                                                                                variant="outline-primary" 
                                                                                size="sm"
                                                                                title="View Details"
                                                                                onClick={() => toggleRowExpansion(ledgerId, ledger.name)}
                                                                            >
                                                                                <i className="mdi mdi-eye"></i>
                                                                            </Button>
                                                                            <Button 
                                                                                variant="outline-info" 
                                                                                size="sm"
                                                                                title="Statement"
                                                                            >
                                                                                <i className="mdi mdi-file-document"></i>
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                {/* Collapsible detailed row */}
                                                                {isExpanded && (
                                                                    <tr>
                                                                        <td colSpan="11" className="bg-light p-0">
                                                                            <div className="p-3">
                                                                                <Row>
                                                                                    <Col md={6}>
                                                                                        <h6 className="text-primary mb-3">Basic Information</h6>
                                                                                        <Table size="sm" className="mb-0">
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <td><strong>Ledger Name:</strong></td>
                                                                                                    <td>{getCleanLedgerName(ledger.name)}</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><strong>Full Name (Raw):</strong></td>
                                                                                                    <td className="small text-muted">{ledger.name || 'N/A'}</td>
                                                                                                </tr>
                                                                                                {getAddressFromName(ledger.name) && (
                                                                                                    <tr>
                                                                                                        <td><strong>Address from Name:</strong></td>
                                                                                                        <td>{getAddressFromName(ledger.name)}</td>
                                                                                                    </tr>
                                                                                                )}
                                                                                                <tr>
                                                                                                    <td><strong>Alias Name:</strong></td>
                                                                                                    <td>{ledger.aliasName || 'N/A'}</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><strong>Reserved Name:</strong></td>
                                                                                                    <td>{ledger.reservedName || 'N/A'}</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><strong>Parent:</strong></td>
                                                                                                    <td>{ledger.parent || 'N/A'}</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><strong>GUID:</strong></td>
                                                                                                    <td className="font-monospace small">{ledger.guid || 'N/A'}</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><strong>Master ID:</strong></td>
                                                                                                    <td>{ledger.masterId || 'N/A'}</td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </Table>
                                                                                    </Col>
                                                                                    <Col md={6}>
                                                                                        <h6 className="text-primary mb-3">Contact & Tax Information</h6>
                                                                                        <Table size="sm" className="mb-0">
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <td><strong>Contact Person:</strong></td>
                                                                                                    <td>{ledger.contactPerson || 'N/A'}</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><strong>Phone:</strong></td>
                                                                                                    <td>{ledger.ledgerPhone || 'N/A'}</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><strong>Email:</strong></td>
                                                                                                    <td>{ledger.email || 'N/A'}</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><strong>GSTIN:</strong></td>
                                                                                                    <td className="font-monospace">{ledger.gstin || 'N/A'}</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><strong>Registration Type:</strong></td>
                                                                                                    <td>{ledger.gstregistrationtype || 'N/A'}</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><strong>Website:</strong></td>
                                                                                                    <td>{ledger.website || 'N/A'}</td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </Table>
                                                                                    </Col>
                                                                                </Row>
                                                                                
                                                                                <Row className="mt-3">
                                                                                    <Col md={6}>
                                                                                        <h6 className="text-primary mb-3">Financial Information</h6>
                                                                                        <Table size="sm" className="mb-0">
                                                                                            <tbody>
                                                                                                <tr>
                                                                                                    <td><strong>Opening Balance:</strong></td>
                                                                                                    <td>
                                                                                                        <Badge bg={getBalanceBadge(ledger.openingBalance)} className="me-2">
                                                                                                            {formatCurrency(ledger.openingBalance || 0)}
                                                                                                        </Badge>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><strong>Closing Balance:</strong></td>
                                                                                                    <td>
                                                                                                        <Badge bg={getBalanceBadge(ledger.closingBalance)} className="me-2">
                                                                                                            {formatCurrency(ledger.closingBalance || 0)}
                                                                                                        </Badge>
                                                                                                    </td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><strong>Credit Limit:</strong></td>
                                                                                                    <td>{ledger.creditLimit ? formatCurrency(ledger.creditLimit) : 'N/A'}</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><strong>Credit Period:</strong></td>
                                                                                                    <td>{ledger.creditPeriod ? `${ledger.creditPeriod} days` : 'N/A'}</td>
                                                                                                </tr>
                                                                                                <tr>
                                                                                                    <td><strong>Interest Rate:</strong></td>
                                                                                                    <td>{ledger.interestRate ? `${ledger.interestRate}%` : 'N/A'}</td>
                                                                                                </tr>
                                                                                            </tbody>
                                                                                        </Table>
                                                                                    </Col>
                                                                                    <Col md={6}>
                                                                                        <h6 className="text-primary mb-3">Address & Bank Details</h6>
                                                                                        {ledger.addressList && ledger.addressList.length > 0 && (
                                                                                            <div className="mb-3">
                                                                                                <strong>Address:</strong>
                                                                                                <div className="small text-muted">
                                                                                                    {ledger.addressList.join(', ')}
                                                                                                </div>
                                                                                            </div>
                                                                                        )}
                                                                                        {ledger.bankDetails && (
                                                                                            <Table size="sm" className="mb-0">
                                                                                                <tbody>
                                                                                                    <tr>
                                                                                                        <td><strong>Bank Name:</strong></td>
                                                                                                        <td>{ledger.bankDetails.bankName || 'N/A'}</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td><strong>Account Number:</strong></td>
                                                                                                        <td className="font-monospace">{ledger.bankDetails.accountNumber || 'N/A'}</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td><strong>IFSC Code:</strong></td>
                                                                                                        <td className="font-monospace">{ledger.bankDetails.ifscCode || 'N/A'}</td>
                                                                                                    </tr>
                                                                                                    <tr>
                                                                                                        <td><strong>Branch:</strong></td>
                                                                                                        <td>{ledger.bankDetails.branchName || 'N/A'}</td>
                                                                                                    </tr>
                                                                                                </tbody>
                                                                                            </Table>
                                                                                        )}
                                                                                    </Col>
                                                                                </Row>
                                                                                
                                                                                {ledger.billWiseDetails && ledger.billWiseDetails.length > 0 && (
                                                                                    <Row className="mt-3">
                                                                                        <Col md={12}>
                                                                                            <h6 className="text-primary mb-3">Bill-wise Details</h6>
                                                                                            <div className="table-responsive">
                                                                                                <Table size="sm" className="mb-0">
                                                                                                    <thead>
                                                                                                        <tr>
                                                                                                            <th>Bill Name</th>
                                                                                                            <th>Date</th>
                                                                                                            <th>Amount</th>
                                                                                                            <th>Type</th>
                                                                                                        </tr>
                                                                                                    </thead>
                                                                                                    <tbody>
                                                                                                        {ledger.billWiseDetails.slice(0, 5).map((bill, billIndex) => (
                                                                                                            <tr key={billIndex}>
                                                                                                                <td>{bill.billName || 'N/A'}</td>
                                                                                                                <td>{bill.billDate ? new Date(bill.billDate).toLocaleDateString() : 'N/A'}</td>
                                                                                                                <td>{bill.billAmount ? formatCurrency(bill.billAmount) : 'N/A'}</td>
                                                                                                                <td>
                                                                                                                    <Badge bg={bill.billCredit ? 'success' : 'info'}>
                                                                                                                        {bill.billCredit ? 'Credit' : 'Debit'}
                                                                                                                    </Badge>
                                                                                                                </td>
                                                                                                            </tr>
                                                                                                        ))}
                                                                                                    </tbody>
                                                                                                </Table>
                                                                                            </div>
                                                                                        </Col>
                                                                                    </Row>
                                                                                )}
                                                                                
                                                                                {/* Related Invoices/Vouchers Section */}
                                                                                <Row className="mt-3">
                                                                                    <Col md={12}>
                                                                                        <h6 className="text-primary mb-3">
                                                                                            <i className="mdi mdi-file-document-multiple me-2"></i>
                                                                                            Related Invoices/Vouchers
                                                                                        </h6>
                                                                                        {relatedInvoices[ledgerId] ? (
                                                                                            relatedInvoices[ledgerId].length > 0 ? (
                                                                                                <div className="table-responsive">
                                                                                                    <Table size="sm" className="mb-0" hover>
                                                                                                        <thead className="table-light">
                                                                                                            <tr>
                                                                                                                <th>Date</th>
                                                                                                                <th>Voucher No.</th>
                                                                                                                <th>Type</th>
                                                                                                                <th>Party</th>
                                                                                                                <th>Amount</th>
                                                                                                                <th>Narration</th>
                                                                                                            </tr>
                                                                                                        </thead>
                                                                                                        <tbody>
                                                                                                            {relatedInvoices[ledgerId].slice(0, 10).map((invoice, invIndex) => (
                                                                                                                <tr key={invIndex}>
                                                                                                                    <td>
                                                                                                                        {invoice.date ? new Date(invoice.date).toLocaleDateString() : 'N/A'}
                                                                                                                    </td>
                                                                                                                    <td className="font-monospace small">
                                                                                                                        {invoice.voucherNumber || 'N/A'}
                                                                                                                    </td>
                                                                                                                    <td>
                                                                                                                        <Badge bg="info" className="small">
                                                                                                                            {invoice.voucherType || 'N/A'}
                                                                                                                        </Badge>
                                                                                                                    </td>
                                                                                                                    <td className="text-truncate" style={{ maxWidth: '120px' }}>
                                                                                                                        {invoice.party || 'N/A'}
                                                                                                                    </td>
                                                                                                                    <td>
                                                                                                                        <Badge bg={getBalanceBadge(invoice.amount)} className="small">
                                                                                                                            {invoice.amount ? formatCurrency(invoice.amount) : '₹0.00'}
                                                                                                                        </Badge>
                                                                                                                    </td>
                                                                                                                    <td className="text-truncate small text-muted" style={{ maxWidth: '150px' }}>
                                                                                                                        {invoice.narration || 'N/A'}
                                                                                                                    </td>
                                                                                                                </tr>
                                                                                                            ))}
                                                                                                        </tbody>
                                                                                                    </Table>
                                                                                                    {relatedInvoices[ledgerId].length > 10 && (
                                                                                                        <div className="text-center mt-2">
                                                                                                            <small className="text-muted">
                                                                                                                Showing 10 of {relatedInvoices[ledgerId].length} invoices
                                                                                                            </small>
                                                                                                        </div>
                                                                                                    )}
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="text-center py-3 text-muted">
                                                                                                    <i className="mdi mdi-file-document-outline mdi-24px d-block mb-2"></i>
                                                                                                    <small>No related invoices found for this ledger</small>
                                                                                                </div>
                                                                                            )
                                                                                        ) : (
                                                                                            <div className="text-center py-3">
                                                                                                <div className="spinner-border spinner-border-sm text-primary me-2" role="status">
                                                                                                    <span className="visually-hidden">Loading...</span>
                                                                                                </div>
                                                                                                <small className="text-muted">Loading related invoices...</small>
                                                                                            </div>
                                                                                        )}
                                                                                    </Col>
                                                                                </Row>
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </React.Fragment>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="11" className="text-center text-muted py-4">
                                                            <i className="mdi mdi-account-multiple-outline mdi-48px d-block mb-2"></i>
                                                            No ledgers found. Try adjusting your filters.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>

                                    {/* Pagination */}
                                    <Row className="mt-3">
                                        <Col xs={12} className="d-flex justify-content-between align-items-center">
                                            <div className="text-muted small">Page {currentPage} of {totalPages}</div>
                                            <div className="d-flex gap-2">
                                                <Button variant="outline-secondary" size="sm" disabled={currentPage === 1} onClick={handlePrevPage}>Prev</Button>
                                                <Button variant="primary" size="sm" disabled={currentPage >= totalPages} onClick={handleNextPage}>Next</Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </>
    );
};

export default TallyLedgersDetail;
