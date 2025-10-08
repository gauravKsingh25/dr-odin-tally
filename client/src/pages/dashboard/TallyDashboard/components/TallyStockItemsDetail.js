// @flow
import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Table, Badge, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { APICore } from '../../../../helpers/api/apiCore';
import MainLoader from '../../../../components/MainLoader';
import ThemeToggle from '../../../../components/ThemeToggle';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import '../TallyDashboard.css';

const TallyStockItemsDetail = () => {
    const [stockItemsData, setStockItemsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [stockFilter, setStockFilter] = useState('');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [quickDateRange, setQuickDateRange] = useState('');
    const [itemsPerPage] = useState(20);
    const navigate = useNavigate();

    // Fetch stock items data with pagination and filters
    const fetchStockItemsData = useCallback(async (page = 1, search = '', category = '', stock = '', fromDateParam = '', toDateParam = '') => {
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
                ...(category && { category }),
                ...(stock && { stock }),
                ...(fromDateParam && { fromDate: fromDateParam }),
                ...(toDateParam && { toDate: toDateParam })
            });
            
            const response = await axios.get(`/tally/stockitems?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.status === 200) {
                const responseData = response.data.data || {};
                const list = responseData.stockItems || [];
                list.sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0));
                setStockItemsData(list);
                
                // Handle pagination data (fallback to length if total missing)
                const pagination = responseData.pagination || {};
                const total = pagination.total;
                const computedTotalPages = total ? Math.ceil(total / itemsPerPage) : Math.max(1, Math.ceil(list.length / itemsPerPage));
                setTotalPages(pagination.totalPages || computedTotalPages);
                setError(null);
            } else {
                setError(`Server returned status: ${response.data?.status || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Stock items fetch error:', error);
            
            if (error.response?.status === 401) {
                const api = new APICore();
                api.setLoggedInUser(null);
                navigate('/account/login');
                return;
            }
            
            // Better error handling for different scenarios
            let errorMessage = 'Failed to fetch stock items data';
            if (error.response?.status === 404) {
                errorMessage = 'Stock items endpoint not found. Please check server configuration.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [navigate, itemsPerPage]);

    const handlePrevPage = () => {
        if (currentPage > 1) {
            const prev = currentPage - 1;
            setCurrentPage(prev);
            fetchStockItemsData(prev, searchTerm, categoryFilter, stockFilter, fromDate, toDate);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            const next = currentPage + 1;
            setCurrentPage(next);
            fetchStockItemsData(next, searchTerm, categoryFilter, stockFilter, fromDate, toDate);
        }
    };

    // Handle pagination change
    const handlePageChange = (event, page) => {
        setCurrentPage(page);
        fetchStockItemsData(page, searchTerm, categoryFilter, stockFilter, fromDate, toDate);
    };

    // Handle filter change and auto-search
    const handleFilterChange = (filterType, value) => {
        switch (filterType) {
            case 'search':
                setSearchTerm(value);
                break;
            case 'category':
                setCategoryFilter(value);
                // Immediate search for dropdown changes
                setCurrentPage(1);
                fetchStockItemsData(1, searchTerm, value, stockFilter, fromDate, toDate);
                break;
            case 'stock':
                setStockFilter(value);
                // Immediate search for dropdown changes
                setCurrentPage(1);
                fetchStockItemsData(1, searchTerm, categoryFilter, value, fromDate, toDate);
                break;
            default:
                break;
        }
    };

    // Handle filter reset
    const handleReset = () => {
        setSearchTerm('');
        setCategoryFilter('');
        setStockFilter('');
        setFromDate('');
        setToDate('');
        setQuickDateRange('');
        setCurrentPage(1);
        fetchStockItemsData(1, '', '', '', '', '');
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
        fetchStockItemsData(1, searchTerm, categoryFilter, stockFilter, formatDate(startDate), formatDate(endDate));
    };

    // Handle date range reset
    const handleDateRangeReset = () => {
        setFromDate('');
        setToDate('');
        setQuickDateRange('');
        setCurrentPage(1);
        fetchStockItemsData(1, searchTerm, categoryFilter, stockFilter, '', '');
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
                ...(categoryFilter && { category: categoryFilter }),
                ...(stockFilter && { stock: stockFilter })
            });
            
            const response = await axios.get(`/tally/stockitems?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `stock-items_${new Date().toISOString().split('T')[0]}.csv`);
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
            fetchStockItemsData(1, '', categoryFilter, stockFilter);
            return;
        }

        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            fetchStockItemsData(1, searchTerm, categoryFilter, stockFilter);
        }, 500); // 500ms delay for debounced search

        return () => clearTimeout(timeoutId);
    }, [searchTerm, categoryFilter, stockFilter, fetchStockItemsData]);

    useEffect(() => {
        fetchStockItemsData(1, '', '', '');
    }, [fetchStockItemsData]);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    // Get stock status badge
    const getStockStatusBadge = (quantity) => {
        if (quantity > 50) return { color: 'success', text: 'Good Stock' };
        if (quantity > 10) return { color: 'warning', text: 'Low Stock' };
        if (quantity > 0) return { color: 'danger', text: 'Critical Stock' };
        return { color: 'secondary', text: 'Out of Stock' };
    };

    return (
        <>
            <Row>
                <Col xs={12}>
                    <div className="page-title-box d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="page-title">Tally Stock Items - Detailed View</h4>
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
                                <li className="breadcrumb-item active">Stock Items Detail</li>
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
                                        <Form.Label>Search Stock Items</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by name, code, HSN, or description..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Category</Form.Label>
                                        <Form.Select
                                            value={categoryFilter}
                                            onChange={(e) => handleFilterChange('category', e.target.value)}
                                        >
                                            <option value="">All Categories</option>
                                            <option value="Raw Materials">Raw Materials</option>
                                            <option value="Finished Goods">Finished Goods</option>
                                            <option value="Work in Progress">Work in Progress</option>
                                            <option value="Trading Goods">Trading Goods</option>
                                            <option value="Consumables">Consumables</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Stock Status</Form.Label>
                                        <Form.Select
                                            value={stockFilter}
                                            onChange={(e) => handleFilterChange('stock', e.target.value)}
                                        >
                                            <option value="">All Stock</option>
                                            <option value="in-stock">In Stock</option>
                                            <option value="low-stock">Low Stock</option>
                                            <option value="critical-stock">Critical Stock</option>
                                            <option value="out-of-stock">Out of Stock</option>
                                            <option value="overstock">Overstock</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <div className="d-flex gap-2 align-items-end">
                                        <Button variant="outline-secondary" onClick={handleReset}>
                                            <i className="mdi mdi-refresh"></i> Reset
                                        </Button>
                                    </div>
                                </Col>
                                <Col md={2} className="text-end">
                                    <Button 
                                        variant="success" 
                                        onClick={handleExport}
                                        disabled={loading || stockItemsData.length === 0}
                                    >
                                        <i className="mdi mdi-download"></i> Export
                                    </Button>
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
                                        onClick={() => fetchStockItemsData(1, searchTerm, categoryFilter, stockFilter, fromDate, toDate)}
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

            {/* Stock Items Table */}
            <Row>
                <Col xs={12}>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="header-title">
                                    Stock Item Details 
                                    {!loading && stockItemsData.length > 0 && (
                                        <span className="text-muted"> ({stockItemsData.length} records)</span>
                                    )}
                                </h4>
                                <Button variant="info" size="sm" onClick={() => fetchStockItemsData(currentPage, searchTerm, categoryFilter, stockFilter)}>
                                    <i className="mdi mdi-refresh"></i> Refresh
                                </Button>
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
                                                    <th>#</th>
                                                    <th>Item Name</th>
                                                    <th>HSN/Code</th>
                                                    <th>Category</th>
                                                    <th>Opening Qty</th>
                                                    <th>Closing Qty</th>
                                                    <th>Units</th>
                                                    <th>Rate/Price</th>
                                                    <th>Opening Value</th>
                                                    <th>Closing Value</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stockItemsData.length > 0 ? (
                                                    stockItemsData.map((item, index) => {
                                                        const stockStatus = getStockStatusBadge(item.closingQty || 0);
                                                        const rate = item.actualClosingRate || item.closingRate || 0;
                                                        const valueChange = item.valueChangePercent || 0;
                                                        
                                                        return (
                                                            <tr key={item._id || index}>
                                                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                                <td>
                                                                    <div className="d-flex flex-column">
                                                                        <strong className="text-truncate" style={{ maxWidth: '200px' }} title={item.name}>
                                                                            {item.name || 'N/A'}
                                                                        </strong>
                                                                        {item.aliasName && (
                                                                            <small className="text-muted" title={item.aliasName}>
                                                                                ({item.aliasName})
                                                                            </small>
                                                                        )}
                                                                        {item.description && (
                                                                            <small className="text-info" title={item.description}>
                                                                                {item.description.substring(0, 30)}
                                                                                {item.description.length > 30 && '...'}
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column">
                                                                        {item.hsnCode && (
                                                                            <Badge bg="secondary" className="mb-1">
                                                                                HSN: {item.hsnCode}
                                                                            </Badge>
                                                                        )}
                                                                        {item.stockItemCode && (
                                                                            <Badge bg="info">
                                                                                Code: {item.stockItemCode}
                                                                            </Badge>
                                                                        )}
                                                                        {!item.hsnCode && !item.stockItemCode && (
                                                                            <span className="text-muted">N/A</span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="text-truncate" style={{ maxWidth: '120px' }} title={item.category || item.parent || item.stockGroup}>
                                                                        {item.category || item.parent || item.stockGroup || 'N/A'}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span className="fw-bold">
                                                                        {(item.openingQty || 0).toLocaleString()}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column">
                                                                        <span className="fw-bold">
                                                                            {(item.closingQty || 0).toLocaleString()}
                                                                        </span>
                                                                        {item.reorderLevel > 0 && (
                                                                            <small className="text-warning">
                                                                                Reorder: {item.reorderLevel}
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <Badge bg="info">
                                                                        {item.baseUnits || item.units || 'N/A'}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column">
                                                                        <span className="fw-bold text-success">
                                                                            {formatCurrency(rate)}
                                                                        </span>
                                                                        {rate > 0 && item.closingQty > 0 && (
                                                                            <small className="text-muted">
                                                                                per {item.baseUnits || 'unit'}
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    {formatCurrency(item.openingValue || 0)}
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column">
                                                                        <span className="fw-bold">
                                                                            {formatCurrency(item.closingValue || 0)}
                                                                        </span>
                                                                        {valueChange !== 0 && (
                                                                            <small className={valueChange > 0 ? 'text-success' : 'text-danger'}>
                                                                                {valueChange > 0 ? '+' : ''}{valueChange.toFixed(1)}%
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column">
                                                                        <Badge bg={stockStatus.color} className="mb-1">
                                                                            {item.calculatedStockStatus || item.stockStatus || stockStatus.text}
                                                                        </Badge>
                                                                        {item.gstApplicable === 'Yes' && (
                                                                            <Badge bg="warning" size="sm">
                                                                                GST
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex gap-1">
                                                                        <Button 
                                                                            variant="outline-primary" 
                                                                            size="sm"
                                                                            title="View Details"
                                                                        >
                                                                            <i className="mdi mdi-eye"></i>
                                                                        </Button>
                                                                        <Button 
                                                                            variant="outline-info" 
                                                                            size="sm"
                                                                            title="Stock Report"
                                                                        >
                                                                            <i className="mdi mdi-chart-line"></i>
                                                                        </Button>
                                                                        <Button 
                                                                            variant="outline-success" 
                                                                            size="sm"
                                                                            title="Price History"
                                                                            disabled={!item.priceDetails || item.priceDetails.length === 0}
                                                                        >
                                                                            <i className="mdi mdi-currency-inr"></i>
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="12" className="text-center text-muted py-4">
                                                            <i className="mdi mdi-package-variant-closed mdi-48px d-block mb-2"></i>
                                                            No stock items found. Try adjusting your filters.
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

export default TallyStockItemsDetail;
