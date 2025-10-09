// @flow
import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Table, Badge, Form, Modal, Spinner, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { APICore } from '../../../../helpers/api/apiCore';
import MainLoader from '../../../../components/MainLoader';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import '../TallyDashboard.css';

const EnhancedStockManagement = () => {
    // State management
    const [stockItemsData, setStockItemsData] = useState([]);
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        stockGroup: '',
        category: '',
        stockStatus: '',
        hasQuantity: null,
        hasValue: null
    });
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [itemsPerPage] = useState(20);
    const [expandedRows, setExpandedRows] = useState([]);
    const [selectedItems, setSelectedItems] = useState([]);
    
    // Modals
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedItemDetail, setSelectedItemDetail] = useState(null);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [bulkOperation, setBulkOperation] = useState('');
    
    const navigate = useNavigate();

    // Fetch dashboard data
    const fetchDashboardData = useCallback(async () => {
        try {
            const api = new APICore();
            const loggedInUser = api.getLoggedInUser();
            const token = loggedInUser?.token;
            
            if (!token) {
                navigate('/account/login');
                return;
            }
            
            const response = await axios.get('/api/stock/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.success) {
                setDashboardData(response.data.data);
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
        }
    }, [navigate]);

    // Fetch stock items with enhanced filtering
    const fetchStockItemsData = useCallback(async (page = 1) => {
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
                sortBy,
                sortOrder,
                ...(searchTerm && { search: searchTerm }),
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '' && v !== null))
            });
            
            const response = await axios.get(`/api/stock/items?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.success) {
                const responseData = response.data.data;
                setStockItemsData(responseData.items || []);
                setTotalPages(responseData.pagination?.totalPages || 1);
                setError(null);
            } else {
                setError('Failed to fetch stock items');
            }
        } catch (error) {
            console.error('Stock items fetch error:', error);
            
            if (error.response?.status === 401) {
                const api = new APICore();
                api.setLoggedInUser(null);
                navigate('/account/login');
                return;
            }
            
            setError(error.response?.data?.message || 'Failed to fetch stock items');
        } finally {
            setLoading(false);
        }
    }, [navigate, itemsPerPage, searchTerm, filters, sortBy, sortOrder]);

    // Fetch item details
    const fetchItemDetails = async (stockId) => {
        try {
            const api = new APICore();
            const loggedInUser = api.getLoggedInUser();
            const token = loggedInUser?.token;
            
            const response = await axios.get(`/api/stock/items/${stockId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.success) {
                setSelectedItemDetail(response.data.data);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('Item details fetch error:', error);
            alert('Failed to fetch item details');
        }
    };

    // Handle pagination
    const handlePageChange = (event, page) => {
        setCurrentPage(page);
        fetchStockItemsData(page);
    };

    // Handle filter changes
    const handleFilterChange = (filterName, value) => {
        setFilters(prev => ({ ...prev, [filterName]: value }));
        setCurrentPage(1);
    };

    // Handle sort changes
    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('asc');
        }
        setCurrentPage(1);
    };

    // Toggle row expansion
    const toggleRowExpansion = (itemId) => {
        setExpandedRows(prev => 
            prev.includes(itemId) 
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    // Handle item selection
    const handleItemSelection = (itemId, isSelected) => {
        setSelectedItems(prev => 
            isSelected 
                ? [...prev, itemId]
                : prev.filter(id => id !== itemId)
        );
    };

    // Reset filters
    const handleReset = () => {
        setSearchTerm('');
        setFilters({
            stockGroup: '',
            category: '',
            stockStatus: '',
            hasQuantity: null,
            hasValue: null
        });
        setSortBy('name');
        setSortOrder('asc');
        setCurrentPage(1);
    };

    // Export data
    const handleExport = async () => {
        try {
            const api = new APICore();
            const loggedInUser = api.getLoggedInUser();
            const token = loggedInUser?.token;
            
            const params = new URLSearchParams({
                format: 'csv',
                ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '' && v !== null))
            });
            
            const response = await axios.get(`/api/stock/export?${params}`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob'
            });
            
            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `stock-items-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Export error:', error);
            alert('Failed to export data. Please try again.');
        }
    };

    // Debounced search effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            fetchStockItemsData(1);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, fetchStockItemsData]);

    // Fetch data on filter/sort changes
    useEffect(() => {
        fetchStockItemsData(currentPage);
    }, [fetchStockItemsData, currentPage]);

    // Initial data fetch
    useEffect(() => {
        fetchDashboardData();
        fetchStockItemsData(1);
    }, [fetchDashboardData, fetchStockItemsData]);

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount || 0);
    };

    // Get status color
    const getStatusColor = (status) => {
        const colorMap = {
            'In Stock': 'success',
            'Low Stock': 'warning', 
            'Critical Stock': 'danger',
            'Out of Stock': 'secondary',
            'Overstock': 'info'
        };
        return colorMap[status] || 'secondary';
    };

    return (
        <>
            <Row>
                <Col xs={12}>
                    <div className="page-title-box d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="page-title">Enhanced Stock Management</h4>
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
                                <li className="breadcrumb-item active">Stock Management</li>
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

            {/* Dashboard Overview Cards */}
            {dashboardData && (
                <Row className="mb-3">
                    <Col lg={3} md={6}>
                        <Card className="widget-flat">
                            <Card.Body>
                                <div className="float-end">
                                    <i className="mdi mdi-package-variant widget-icon"></i>
                                </div>
                                <h5 className="text-muted fw-normal mt-0">Total Items</h5>
                                <h3 className="mt-3 mb-3">{dashboardData.statistics?.totalItems || 0}</h3>
                                <p className="mb-0 text-muted">
                                    <span className="text-success me-2">
                                        {dashboardData.statistics?.itemsInStock || 0} in stock
                                    </span>
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col lg={3} md={6}>
                        <Card className="widget-flat">
                            <Card.Body>
                                <div className="float-end">
                                    <i className="mdi mdi-alert-circle widget-icon bg-danger-lighten text-danger"></i>
                                </div>
                                <h5 className="text-muted fw-normal mt-0">Critical Stock</h5>
                                <h3 className="mt-3 mb-3">{dashboardData.alerts?.criticalStock?.length || 0}</h3>
                                <p className="mb-0 text-muted">
                                    <span className="text-danger">Needs attention</span>
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col lg={3} md={6}>
                        <Card className="widget-flat">
                            <Card.Body>
                                <div className="float-end">
                                    <i className="mdi mdi-currency-inr widget-icon bg-success-lighten text-success"></i>
                                </div>
                                <h5 className="text-muted fw-normal mt-0">Stock Value</h5>
                                <h3 className="mt-3 mb-3">
                                    {formatCurrency(dashboardData.statistics?.stockValue || 0)}
                                </h3>
                                <p className="mb-0 text-muted">
                                    <span className="text-success">Total inventory value</span>
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col lg={3} md={6}>
                        <Card className="widget-flat">
                            <Card.Body>
                                <div className="float-end">
                                    <i className="mdi mdi-trending-up widget-icon bg-info-lighten text-info"></i>
                                </div>
                                <h5 className="text-muted fw-normal mt-0">Stock Groups</h5>
                                <h3 className="mt-3 mb-3">{dashboardData.stockGroups?.length || 0}</h3>
                                <p className="mb-0 text-muted">
                                    <span className="text-info">Active categories</span>
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Filters and Controls */}
            <Row className="mb-3">
                <Col xs={12}>
                    <Card>
                        <Card.Body>
                            <Row className="align-items-end">
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Search Items</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Search by name, group, or category..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Stock Group</Form.Label>
                                        <Form.Select
                                            value={filters.stockGroup}
                                            onChange={(e) => handleFilterChange('stockGroup', e.target.value)}
                                        >
                                            <option value="">All Groups</option>
                                            {dashboardData?.stockGroups?.map(group => (
                                                <option key={group.name} value={group.name}>
                                                    {group.name} ({group.itemCount})
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Stock Status</Form.Label>
                                        <Form.Select
                                            value={filters.stockStatus}
                                            onChange={(e) => handleFilterChange('stockStatus', e.target.value)}
                                        >
                                            <option value="">All Status</option>
                                            <option value="In Stock">In Stock</option>
                                            <option value="Low Stock">Low Stock</option>
                                            <option value="Critical Stock">Critical Stock</option>
                                            <option value="Out of Stock">Out of Stock</option>
                                            <option value="Overstock">Overstock</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Sort By</Form.Label>
                                        <Form.Select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                        >
                                            <option value="name">Name</option>
                                            <option value="closingQty">Quantity</option>
                                            <option value="closingValue">Value</option>
                                            <option value="lastUpdated">Last Updated</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <div className="d-flex gap-2 align-items-end">
                                        <Button variant="outline-secondary" onClick={handleReset}>
                                            <i className="mdi mdi-refresh"></i> Reset
                                        </Button>
                                        <Button 
                                            variant="success" 
                                            onClick={handleExport}
                                            disabled={loading}
                                        >
                                            <i className="mdi mdi-download"></i> Export
                                        </Button>
                                        {selectedItems.length > 0 && (
                                            <Button 
                                                variant="primary" 
                                                onClick={() => setShowBulkModal(true)}
                                            >
                                                <i className="mdi mdi-check-all"></i> Bulk ({selectedItems.length})
                                            </Button>
                                        )}
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
                        <Alert variant="danger">
                            <strong>Error:</strong> {error}
                        </Alert>
                    </Col>
                </Row>
            )}

            {/* Enhanced Stock Items Table */}
            <Row>
                <Col xs={12}>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="header-title">
                                    Stock Items 
                                    {!loading && stockItemsData.length > 0 && (
                                        <span className="text-muted"> ({stockItemsData.length} items)</span>
                                    )}
                                </h4>
                                <Button 
                                    variant="info" 
                                    size="sm" 
                                    onClick={() => fetchStockItemsData(currentPage)}
                                    disabled={loading}
                                >
                                    {loading ? <Spinner size="sm" /> : <i className="mdi mdi-refresh"></i>} Refresh
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
                                                    <th>
                                                        <Form.Check
                                                            type="checkbox"
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setSelectedItems(stockItemsData.map(item => item._id));
                                                                } else {
                                                                    setSelectedItems([]);
                                                                }
                                                            }}
                                                        />
                                                    </th>
                                                    <th>
                                                        <Button variant="link" className="text-white p-0" onClick={() => handleSort('name')}>
                                                            Item Name {sortBy === 'name' && <i className={`mdi mdi-arrow-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
                                                        </Button>
                                                    </th>
                                                    <th>Group/Category</th>
                                                    <th>
                                                        <Button variant="link" className="text-white p-0" onClick={() => handleSort('closingQty')}>
                                                            Quantity {sortBy === 'closingQty' && <i className={`mdi mdi-arrow-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
                                                        </Button>
                                                    </th>
                                                    <th>
                                                        <Button variant="link" className="text-white p-0" onClick={() => handleSort('closingValue')}>
                                                            Value {sortBy === 'closingValue' && <i className={`mdi mdi-arrow-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
                                                        </Button>
                                                    </th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stockItemsData.length > 0 ? (
                                                    stockItemsData.map((item, index) => (
                                                        <React.Fragment key={item._id || index}>
                                                            <tr>
                                                                <td>
                                                                    <Form.Check
                                                                        type="checkbox"
                                                                        checked={selectedItems.includes(item._id)}
                                                                        onChange={(e) => handleItemSelection(item._id, e.target.checked)}
                                                                    />
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column">
                                                                        <strong className="text-truncate" style={{ maxWidth: '200px' }} title={item.displayName}>
                                                                            {item.displayName || item.name}
                                                                        </strong>
                                                                        {item.aliasName && (
                                                                            <small className="text-muted" title={item.aliasName}>
                                                                                {item.aliasName}
                                                                            </small>
                                                                        )}
                                                                        {item.hsnCode && (
                                                                            <Badge bg="secondary" size="sm">HSN: {item.hsnCode}</Badge>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="text-truncate" style={{ maxWidth: '150px' }} title={item.groupPath}>
                                                                        {item.groupPath || 'N/A'}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column">
                                                                        <span className="fw-bold">
                                                                            {(item.closingQty || 0).toLocaleString()}
                                                                        </span>
                                                                        <small className="text-muted">
                                                                            {item.baseUnits || 'units'}
                                                                        </small>
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex flex-column">
                                                                        <span className="fw-bold">
                                                                            {formatCurrency(item.closingValue || 0)}
                                                                        </span>
                                                                        {item.valuePerUnit > 0 && (
                                                                            <small className="text-muted">
                                                                                {formatCurrency(item.valuePerUnit)}/unit
                                                                            </small>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <Badge 
                                                                        bg={getStatusColor(item.stockStatus)} 
                                                                        style={{ backgroundColor: item.statusColor }}
                                                                    >
                                                                        {item.stockStatus || 'Unknown'}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex gap-1">
                                                                        <Button 
                                                                            variant="outline-primary" 
                                                                            size="sm"
                                                                            title="Expand Details"
                                                                            onClick={() => toggleRowExpansion(item._id)}
                                                                        >
                                                                            <i className={`mdi mdi-chevron-${expandedRows.includes(item._id) ? 'up' : 'down'}`}></i>
                                                                        </Button>
                                                                        <Button 
                                                                            variant="outline-info" 
                                                                            size="sm"
                                                                            title="View Details"
                                                                            onClick={() => fetchItemDetails(item._id)}
                                                                        >
                                                                            <i className="mdi mdi-eye"></i>
                                                                        </Button>
                                                                        <Button 
                                                                            variant="outline-success" 
                                                                            size="sm"
                                                                            title="Stock Report"
                                                                        >
                                                                            <i className="mdi mdi-chart-line"></i>
                                                                        </Button>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                            
                                                            {/* Expanded Row Details */}
                                                            {expandedRows.includes(item._id) && (
                                                                <tr>
                                                                    <td colSpan="7" className="bg-light">
                                                                        <div className="p-3">
                                                                            <Row>
                                                                                <Col md={4}>
                                                                                    <h6>Pricing Information</h6>
                                                                                    <p><strong>Cost Price:</strong> {formatCurrency(item.costPrice || 0)}</p>
                                                                                    <p><strong>Selling Price:</strong> {formatCurrency(item.sellingPrice || 0)}</p>
                                                                                    {item.profitMargin && (
                                                                                        <p><strong>Profit Margin:</strong> {item.profitMargin}%</p>
                                                                                    )}
                                                                                </Col>
                                                                                <Col md={4}>
                                                                                    <h6>Stock Details</h6>
                                                                                    <p><strong>Opening Qty:</strong> {(item.openingQty || 0).toLocaleString()}</p>
                                                                                    <p><strong>Units:</strong> {item.baseUnits || 'N/A'}</p>
                                                                                    {item.reorderLevel > 0 && (
                                                                                        <p><strong>Reorder Level:</strong> {item.reorderLevel}</p>
                                                                                    )}
                                                                                </Col>
                                                                                <Col md={4}>
                                                                                    <h6>Additional Info</h6>
                                                                                    <p><strong>GST Applicable:</strong> {item.gstApplicable || 'N/A'}</p>
                                                                                    <p><strong>Last Updated:</strong> {item.lastUpdatedFormatted}</p>
                                                                                    {item.hasBatches && (
                                                                                        <Badge bg="info" className="me-2">Has Batches</Badge>
                                                                                    )}
                                                                                    {item.hasGodowns && (
                                                                                        <Badge bg="warning">Has Godowns</Badge>
                                                                                    )}
                                                                                </Col>
                                                                            </Row>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </React.Fragment>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="7" className="text-center text-muted py-4">
                                                            <i className="mdi mdi-package-variant-closed mdi-48px d-block mb-2"></i>
                                                            No stock items found. Try adjusting your filters.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                        <Row className="mt-3">
                                            <Col xs={12} className="d-flex justify-content-center">
                                                <Stack spacing={2}>
                                                    <Pagination 
                                                        count={totalPages} 
                                                        page={currentPage} 
                                                        onChange={handlePageChange}
                                                        color="primary"
                                                        showFirstButton 
                                                        showLastButton
                                                    />
                                                </Stack>
                                            </Col>
                                        </Row>
                                    )}
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Item Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Stock Item Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedItemDetail ? (
                        <Row>
                            <Col md={6}>
                                <h5>{selectedItemDetail.name}</h5>
                                <p><strong>Alias:</strong> {selectedItemDetail.aliasName || 'N/A'}</p>
                                <p><strong>Group:</strong> {selectedItemDetail.stockGroup || 'N/A'}</p>
                                <p><strong>Category:</strong> {selectedItemDetail.category || 'N/A'}</p>
                                <p><strong>HSN Code:</strong> {selectedItemDetail.hsnCode || 'N/A'}</p>
                            </Col>
                            <Col md={6}>
                                <p><strong>Closing Quantity:</strong> {(selectedItemDetail.closingQty || 0).toLocaleString()}</p>
                                <p><strong>Closing Value:</strong> {formatCurrency(selectedItemDetail.closingValue || 0)}</p>
                                <p><strong>Cost Price:</strong> {formatCurrency(selectedItemDetail.costPrice || 0)}</p>
                                <p><strong>Selling Price:</strong> {formatCurrency(selectedItemDetail.sellingPrice || 0)}</p>
                                <Badge bg={getStatusColor(selectedItemDetail.stockStatus)}>
                                    {selectedItemDetail.stockStatus}
                                </Badge>
                            </Col>
                            
                            {selectedItemDetail.movementHistory && selectedItemDetail.movementHistory.length > 0 && (
                                <Col xs={12} className="mt-3">
                                    <h6>Recent Movements</h6>
                                    <div className="table-responsive">
                                        <Table size="sm">
                                            <thead>
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Voucher</th>
                                                    <th>Type</th>
                                                    <th>Quantity</th>
                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedItemDetail.movementHistory.slice(0, 10).map((movement, idx) => (
                                                    <tr key={idx}>
                                                        <td>{new Date(movement.date).toLocaleDateString()}</td>
                                                        <td>{movement.voucherNumber}</td>
                                                        <td>
                                                            <Badge bg={movement.inward ? 'success' : 'danger'}>
                                                                {movement.voucherType}
                                                            </Badge>
                                                        </td>
                                                        <td>{movement.quantity.toLocaleString()}</td>
                                                        <td>{formatCurrency(movement.amount)}</td>
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
            </Modal>

            {/* Bulk Operations Modal */}
            <Modal show={showBulkModal} onHide={() => setShowBulkModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Bulk Operations ({selectedItems.length} items selected)</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="d-grid gap-2">
                        <Button variant="outline-success" onClick={() => alert('Update Status functionality to be implemented')}>
                            <i className="mdi mdi-tag-multiple"></i> Update Stock Status
                        </Button>
                        <Button variant="outline-info" onClick={() => alert('Update Group functionality to be implemented')}>
                            <i className="mdi mdi-folder-multiple"></i> Change Stock Group
                        </Button>
                        <Button variant="outline-warning" onClick={() => alert('Set Reorder Level functionality to be implemented')}>
                            <i className="mdi mdi-alert-circle-outline"></i> Set Reorder Level
                        </Button>
                        <Button variant="outline-secondary" onClick={() => alert('Deactivate functionality to be implemented')}>
                            <i className="mdi mdi-eye-off"></i> Deactivate Items
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

export default EnhancedStockManagement;