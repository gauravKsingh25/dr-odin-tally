// @flow
import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Table, Badge, Form, Modal, Spinner, Alert, Collapse, ProgressBar } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { APICore } from '../../../../helpers/api/apiCore';
import MainLoader from '../../../../components/MainLoader';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import '../TallyDashboard.css';

const TallyStockItemsDetail = () => {
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
    const [detailLoading, setDetailLoading] = useState(false);
    
    // Movement history modal
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [selectedItemHistory, setSelectedItemHistory] = useState(null);
    
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
            
            const response = await axios.post('/api/stock/dashboard', {
                companyId: loggedInUser.companyId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.success) {
                setDashboardData(response.data.data);
            }
        } catch (error) {
            console.error('Dashboard fetch error:', error);
            // Fallback to old API if new one fails
            console.log('Falling back to old stock API...');
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
            
            // Try new enhanced API first
            try {
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: itemsPerPage.toString(),
                    sortBy,
                    sortOrder,
                    ...(searchTerm && { search: searchTerm }),
                    ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '' && v !== null))
                });
                
                const response = await axios.post(`/api/stock/items?${params}`, {
                    companyId: loggedInUser.companyId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data && response.data.success) {
                    const responseData = response.data.data;
                    setStockItemsData(responseData.items || []);
                    setTotalPages(responseData.pagination?.totalPages || 1);
                    setError(null);
                    return;
                }
            } catch (enhancedError) {
                console.log('Enhanced API failed, falling back to old API:', enhancedError.message);
            }
            
            // Fallback to old API
            const params = new URLSearchParams({
                page: page.toString(),
                limit: itemsPerPage.toString(),
                ...(searchTerm && { search: searchTerm }),
                ...(filters.category && { category: filters.category }),
                ...(filters.stockStatus && { stock: filters.stockStatus })
            });
            
            const response = await axios.get(`/tally/stockitems?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.status === 200) {
                const responseData = response.data.data || {};
                const list = responseData.stockItems || [];
                list.sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0));
                setStockItemsData(list);
                
                // Handle pagination data
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
    }, [navigate, itemsPerPage, searchTerm, filters, sortBy, sortOrder]);

    // Fetch item details
    const fetchItemDetails = async (stockId) => {
        setDetailLoading(true);
        try {
            const api = new APICore();
            const loggedInUser = api.getLoggedInUser();
            const token = loggedInUser?.token;
            
            const response = await axios.post(`/api/stock/items/${stockId}`, {
                companyId: loggedInUser.companyId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.success) {
                setSelectedItemDetail(response.data.data);
                setShowDetailModal(true);
            }
        } catch (error) {
            console.error('Item details fetch error:', error);
            alert('Failed to fetch item details: ' + error.message);
        } finally {
            setDetailLoading(false);
        }
    };

    // Fetch movement history
    const fetchMovementHistory = async (item) => {
        setSelectedItemHistory({ ...item, movementHistory: null });
        setShowHistoryModal(true);
        
        try {
            const api = new APICore();
            const loggedInUser = api.getLoggedInUser();
            const token = loggedInUser?.token;
            
            const response = await axios.post(`/api/stock/items/${item._id}`, {
                companyId: loggedInUser.companyId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data && response.data.success) {
                setSelectedItemHistory(response.data.data);
            }
        } catch (error) {
            console.error('Movement history fetch error:', error);
            setSelectedItemHistory(prev => ({ ...prev, error: 'Failed to load movement history' }));
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
            
            // Try new API first
            try {
                const params = new URLSearchParams({
                    format: 'csv',
                    ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== '' && v !== null))
                });
                
                const response = await axios.post(`/api/stock/export?${params}`, {
                    companyId: loggedInUser.companyId
                }, {
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
                return;
            } catch (enhancedError) {
                console.log('Enhanced export failed, trying old API');
            }
            
            // Fallback to old export
            const params = new URLSearchParams({
                export: 'true',
                ...(searchTerm && { search: searchTerm }),
                ...(filters.category && { category: filters.category }),
                ...(filters.stockStatus && { stock: filters.stockStatus })
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

    // Debounced search effect
    useEffect(() => {
        if (searchTerm === '') {
            setCurrentPage(1);
            fetchStockItemsData(1);
            return;
        }

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

    // Get stock status badge
    const getStockStatusBadge = (quantity, status) => {
        if (status) {
            const colorMap = {
                'In Stock': 'success',
                'Low Stock': 'warning',
                'Critical Stock': 'danger',
                'Out of Stock': 'secondary',
                'Overstock': 'info'
            };
            return { color: colorMap[status] || 'secondary', text: status };
        }
        
        // Fallback calculation
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
                            <h4 className="page-title">Tally Stock Items - Enhanced Detailed View</h4>
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

            {/* Dashboard Overview Cards */}
            {dashboardData && (
                <Row className="mb-3">
                    <Col lg={3} md={6}>
                        <Card className="widget-flat">
                            <Card.Body>
                                <div className="float-end">
                                    <i className="mdi mdi-package-variant widget-icon bg-primary-lighten text-primary"></i>
                                </div>
                                <h5 className="text-muted fw-normal mt-0">Total Items</h5>
                                <h3 className="mt-3 mb-3">{dashboardData.statistics?.totalItems || 0}</h3>
                                <p className="mb-0 text-muted">
                                    <span className="text-success me-2">
                                        <i className="mdi mdi-arrow-up-bold"></i> {dashboardData.statistics?.itemsInStock || 0} in stock
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
                                    <span className="text-danger">
                                        <i className="mdi mdi-alert"></i> Needs attention
                                    </span>
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
                                    <span className="text-success">
                                        <i className="mdi mdi-trending-up"></i> Total inventory value
                                    </span>
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                    
                    <Col lg={3} md={6}>
                        <Card className="widget-flat">
                            <Card.Body>
                                <div className="float-end">
                                    <i className="mdi mdi-folder-multiple widget-icon bg-info-lighten text-info"></i>
                                </div>
                                <h5 className="text-muted fw-normal mt-0">Stock Groups</h5>
                                <h3 className="mt-3 mb-3">{dashboardData.stockGroups?.length || 0}</h3>
                                <p className="mb-0 text-muted">
                                    <span className="text-info">
                                        <i className="mdi mdi-folder"></i> Active categories
                                    </span>
                                </p>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            )}

            {/* Enhanced Filters */}
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
                                            placeholder="Search by name, HSN, group, category..."
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
                                            disabled={loading || stockItemsData.length === 0}
                                        >
                                            <i className="mdi mdi-download"></i> Export
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                            
                            {/* Quick Filters Row */}
                            <Row className="align-items-end mt-3">
                                <Col md={12}>
                                    <div className="d-flex gap-2 flex-wrap">
                                        <Button 
                                            variant={filters.hasQuantity === 'true' ? 'primary' : 'outline-primary'} 
                                            size="sm"
                                            onClick={() => handleFilterChange('hasQuantity', filters.hasQuantity === 'true' ? null : 'true')}
                                        >
                                            <i className="mdi mdi-package-variant"></i> Has Stock
                                        </Button>
                                        <Button 
                                            variant={filters.hasValue === 'true' ? 'primary' : 'outline-primary'} 
                                            size="sm"
                                            onClick={() => handleFilterChange('hasValue', filters.hasValue === 'true' ? null : 'true')}
                                        >
                                            <i className="mdi mdi-currency-inr"></i> Has Value
                                        </Button>
                                        <Button 
                                            variant={filters.stockStatus === 'Critical Stock' ? 'danger' : 'outline-danger'} 
                                            size="sm"
                                            onClick={() => handleFilterChange('stockStatus', filters.stockStatus === 'Critical Stock' ? '' : 'Critical Stock')}
                                        >
                                            <i className="mdi mdi-alert-circle"></i> Critical Only
                                        </Button>
                                        <Button 
                                            variant={sortBy === 'closingValue' ? 'success' : 'outline-success'} 
                                            size="sm"
                                            onClick={() => handleSort('closingValue')}
                                        >
                                            <i className="mdi mdi-sort-numeric"></i> Sort by Value
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
                        <Alert variant="danger" dismissible onClose={() => setError(null)}>
                            <Alert.Heading>Error Loading Stock Data</Alert.Heading>
                            <p>{error}</p>
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
                                    Enhanced Stock Item Details 
                                    {!loading && stockItemsData.length > 0 && (
                                        <span className="text-muted"> ({stockItemsData.length} records)</span>
                                    )}
                                </h4>
                                <div className="d-flex gap-2">
                                    <Button 
                                        variant="info" 
                                        size="sm" 
                                        onClick={() => fetchStockItemsData(currentPage)}
                                        disabled={loading}
                                    >
                                        {loading ? <Spinner size="sm" /> : <i className="mdi mdi-refresh"></i>} Refresh
                                    </Button>
                                    {selectedItems.length > 0 && (
                                        <Button variant="primary" size="sm">
                                            <i className="mdi mdi-check-all"></i> Selected ({selectedItems.length})
                                        </Button>
                                    )}
                                </div>
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
                                                    <th>Category/Group</th>
                                                    <th>
                                                        <Button variant="link" className="text-white p-0" onClick={() => handleSort('closingQty')}>
                                                            Stock Quantity {sortBy === 'closingQty' && <i className={`mdi mdi-arrow-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
                                                        </Button>
                                                    </th>
                                                    <th>
                                                        <Button variant="link" className="text-white p-0" onClick={() => handleSort('closingValue')}>
                                                            Stock Value {sortBy === 'closingValue' && <i className={`mdi mdi-arrow-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>}
                                                        </Button>
                                                    </th>
                                                    <th>Pricing</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stockItemsData.length > 0 ? (
                                                    stockItemsData.map((item, index) => {
                                                        const stockStatus = getStockStatusBadge(item.closingQty || 0, item.stockStatus);
                                                        const isExpanded = expandedRows.includes(item._id);
                                                        
                                                        return (
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
                                                                            <strong className="text-truncate" style={{ maxWidth: '200px' }} title={item.displayName || item.name}>
                                                                                {item.displayName || item.name || 'N/A'}
                                                                            </strong>
                                                                            {item.aliasName && (
                                                                                <small className="text-muted" title={item.aliasName}>
                                                                                    {item.aliasName}
                                                                                </small>
                                                                            )}
                                                                            <div className="d-flex gap-1 flex-wrap mt-1">
                                                                                {item.hsnCode && (
                                                                                    <Badge bg="secondary" size="sm">HSN: {item.hsnCode}</Badge>
                                                                                )}
                                                                                {item.stockItemCode && (
                                                                                    <Badge bg="info" size="sm">Code: {item.stockItemCode}</Badge>
                                                                                )}
                                                                                {item.gstApplicable === 'Yes' && (
                                                                                    <Badge bg="warning" size="sm">GST</Badge>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="text-truncate" style={{ maxWidth: '150px' }} title={item.groupPath || item.stockGroup || item.parent}>
                                                                            <div><strong>{item.stockGroup || item.parent || 'N/A'}</strong></div>
                                                                            {item.category && item.category !== item.stockGroup && (
                                                                                <small className="text-muted">{item.category}</small>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="d-flex flex-column">
                                                                            <span className="fw-bold">
                                                                                {(item.closingQty || 0).toLocaleString()}
                                                                            </span>
                                                                            <small className="text-muted">
                                                                                {item.baseUnits || item.units || 'units'}
                                                                            </small>
                                                                            {item.openingQty !== undefined && item.openingQty !== item.closingQty && (
                                                                                <small className="text-info">
                                                                                    Opening: {(item.openingQty || 0).toLocaleString()}
                                                                                </small>
                                                                            )}
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
                                                                            {item.openingValue !== undefined && item.openingValue !== item.closingValue && (
                                                                                <small className="text-info">
                                                                                    Opening: {formatCurrency(item.openingValue || 0)}
                                                                                </small>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="d-flex flex-column">
                                                                            {item.sellingPrice > 0 && (
                                                                                <span className="fw-bold text-success">
                                                                                    {formatCurrency(item.sellingPrice)}
                                                                                </span>
                                                                            )}
                                                                            {item.costPrice > 0 && (
                                                                                <small className="text-muted">
                                                                                    Cost: {formatCurrency(item.costPrice)}
                                                                                </small>
                                                                            )}
                                                                            {item.profitMargin && (
                                                                                <small className={`text-${item.profitMargin > 0 ? 'success' : 'danger'}`}>
                                                                                    Margin: {item.profitMargin}%
                                                                                </small>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="d-flex flex-column">
                                                                            <Badge 
                                                                                bg={stockStatus.color}
                                                                                style={item.statusColor ? { backgroundColor: item.statusColor } : {}}
                                                                            >
                                                                                {stockStatus.text}
                                                                            </Badge>
                                                                            {item.reorderLevel > 0 && (
                                                                                <small className="text-warning mt-1">
                                                                                    Reorder: {item.reorderLevel}
                                                                                </small>
                                                                            )}
                                                                        </div>
                                                                    </td>
                                                                    <td>
                                                                        <div className="d-flex gap-1 flex-wrap">
                                                                            <Button 
                                                                                variant={isExpanded ? "primary" : "outline-primary"} 
                                                                                size="sm"
                                                                                title="Expand/Collapse Details"
                                                                                onClick={() => toggleRowExpansion(item._id)}
                                                                            >
                                                                                <i className={`mdi mdi-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                                                                            </Button>
                                                                            <Button 
                                                                                variant="outline-info" 
                                                                                size="sm"
                                                                                title="View Full Details"
                                                                                onClick={() => fetchItemDetails(item._id)}
                                                                                disabled={detailLoading}
                                                                            >
                                                                                {detailLoading ? <Spinner size="sm" /> : <i className="mdi mdi-eye"></i>}
                                                                            </Button>
                                                                            <Button 
                                                                                variant="outline-success" 
                                                                                size="sm"
                                                                                title="Movement History"
                                                                                onClick={() => fetchMovementHistory(item)}
                                                                            >
                                                                                <i className="mdi mdi-chart-timeline-variant"></i>
                                                                            </Button>
                                                                            <Button 
                                                                                variant="outline-warning" 
                                                                                size="sm"
                                                                                title="Price Analysis"
                                                                                disabled={!item.priceDetails || item.priceDetails.length === 0}
                                                                            >
                                                                                <i className="mdi mdi-currency-inr"></i>
                                                                            </Button>
                                                                        </div>
                                                                    </td>
                                                                </tr>
                                                                
                                                                {/* Expanded Row Details */}
                                                                <tr>
                                                                    <td colSpan="8" className="p-0">
                                                                        <Collapse in={isExpanded}>
                                                                            <div className="bg-light p-3 border-top">
                                                                                <Row>
                                                                                    <Col md={3}>
                                                                                        <h6 className="text-primary"><i className="mdi mdi-information"></i> Basic Information</h6>
                                                                                        <p><strong>Full Name:</strong> {item.name}</p>
                                                                                        {item.description && (
                                                                                            <p><strong>Description:</strong> {item.description}</p>
                                                                                        )}
                                                                                        <p><strong>GUID:</strong> <code>{item.guid || 'N/A'}</code></p>
                                                                                        <p><strong>Master ID:</strong> {item.masterId || 'N/A'}</p>
                                                                                    </Col>
                                                                                    <Col md={3}>
                                                                                        <h6 className="text-success"><i className="mdi mdi-currency-inr"></i> Pricing Details</h6>
                                                                                        <p><strong>Cost Price:</strong> {formatCurrency(item.costPrice || 0)}</p>
                                                                                        <p><strong>Selling Price:</strong> {formatCurrency(item.sellingPrice || 0)}</p>
                                                                                        <p><strong>Standard Cost:</strong> {formatCurrency(item.standardCostPrice || 0)}</p>
                                                                                        {item.profitMargin && (
                                                                                            <p><strong>Profit Margin:</strong> 
                                                                                                <Badge bg={item.profitMargin > 0 ? 'success' : 'danger'} className="ms-2">
                                                                                                    {item.profitMargin}%
                                                                                                </Badge>
                                                                                            </p>
                                                                                        )}
                                                                                    </Col>
                                                                                    <Col md={3}>
                                                                                        <h6 className="text-info"><i className="mdi mdi-package-variant"></i> Stock Information</h6>
                                                                                        <p><strong>Base Units:</strong> {item.baseUnits || 'N/A'}</p>
                                                                                        {item.additionalUnits && (
                                                                                            <p><strong>Additional Units:</strong> {item.additionalUnits}</p>
                                                                                        )}
                                                                                        <p><strong>Costing Method:</strong> {item.costingMethod || 'N/A'}</p>
                                                                                        <p><strong>Valuation Method:</strong> {item.valuationMethod || 'N/A'}</p>
                                                                                        {item.reorderLevel > 0 && (
                                                                                            <p><strong>Reorder Level:</strong> 
                                                                                                <Badge bg="warning" className="ms-2">{item.reorderLevel}</Badge>
                                                                                            </p>
                                                                                        )}
                                                                                    </Col>
                                                                                    <Col md={3}>
                                                                                        <h6 className="text-warning"><i className="mdi mdi-file-document"></i> Compliance</h6>
                                                                                        <p><strong>GST Applicable:</strong> 
                                                                                            <Badge bg={item.gstApplicable === 'Yes' ? 'success' : 'secondary'} className="ms-2">
                                                                                                {item.gstApplicable || 'N/A'}
                                                                                            </Badge>
                                                                                        </p>
                                                                                        {item.hsnCode && (
                                                                                            <p><strong>HSN Code:</strong> <code>{item.hsnCode}</code></p>
                                                                                        )}
                                                                                        <p><strong>Tax Classification:</strong> {item.taxClassification || 'N/A'}</p>
                                                                                        <p><strong>Last Updated:</strong> {item.lastUpdatedFormatted || new Date(item.lastUpdated).toLocaleDateString()}</p>
                                                                                    </Col>
                                                                                </Row>
                                                                                
                                                                                {/* Additional Details Row */}
                                                                                <Row className="mt-2">
                                                                                    <Col xs={12}>
                                                                                        <div className="d-flex gap-2 flex-wrap">
                                                                                            {item.hasBatches && (
                                                                                                <Badge bg="info"><i className="mdi mdi-package-variant"></i> Has Batches</Badge>
                                                                                            )}
                                                                                            {item.hasGodowns && (
                                                                                                <Badge bg="warning"><i className="mdi mdi-store"></i> Has Godowns</Badge>
                                                                                            )}
                                                                                            {item.stockItemCode && (
                                                                                                <Badge bg="secondary"><i className="mdi mdi-barcode"></i> Coded Item</Badge>
                                                                                            )}
                                                                                            <Badge bg={stockStatus.color}>
                                                                                                <i className="mdi mdi-information"></i> {stockStatus.text}
                                                                                            </Badge>
                                                                                        </div>
                                                                                    </Col>
                                                                                </Row>
                                                                            </div>
                                                                        </Collapse>
                                                                    </td>
                                                                </tr>
                                                            </React.Fragment>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="8" className="text-center text-muted py-4">
                                                            <i className="mdi mdi-package-variant-closed mdi-48px d-block mb-2"></i>
                                                            No stock items found. Try adjusting your filters or search terms.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </Table>
                                    </div>

                                    {/* Enhanced Pagination */}
                                    {totalPages > 1 && (
                                        <Row className="mt-3">
                                            <Col xs={12}>
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div className="text-muted small">
                                                        Showing page {currentPage} of {totalPages}
                                                        {stockItemsData.length > 0 && (
                                                            <span> ({stockItemsData.length} items on this page)</span>
                                                        )}
                                                    </div>
                                                    <Stack spacing={2}>
                                                        <Pagination 
                                                            count={totalPages} 
                                                            page={currentPage} 
                                                            onChange={handlePageChange}
                                                            color="primary"
                                                            showFirstButton 
                                                            showLastButton
                                                            size="large"
                                                        />
                                                    </Stack>
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

            {/* Item Detail Modal */}
            <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="xl" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="mdi mdi-package-variant me-2"></i>
                        Complete Stock Item Details
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {selectedItemDetail ? (
                        <Row>
                            <Col md={6}>
                                <Card className="h-100">
                                    <Card.Header>
                                        <h5><i className="mdi mdi-information me-2"></i>Basic Information</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <p><strong>Name:</strong> {selectedItemDetail.name}</p>
                                        <p><strong>Alias:</strong> {selectedItemDetail.aliasName || 'N/A'}</p>
                                        <p><strong>Stock Group:</strong> {selectedItemDetail.stockGroup || 'N/A'}</p>
                                        <p><strong>Parent:</strong> {selectedItemDetail.parent || 'N/A'}</p>
                                        <p><strong>Category:</strong> {selectedItemDetail.category || 'N/A'}</p>
                                        <p><strong>HSN Code:</strong> {selectedItemDetail.hsnCode || 'N/A'}</p>
                                        <p><strong>Item Code:</strong> {selectedItemDetail.stockItemCode || 'N/A'}</p>
                                        <p><strong>Description:</strong> {selectedItemDetail.description || 'N/A'}</p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            <Col md={6}>
                                <Card className="h-100">
                                    <Card.Header>
                                        <h5><i className="mdi mdi-package me-2"></i>Stock & Pricing</h5>
                                    </Card.Header>
                                    <Card.Body>
                                        <p><strong>Closing Quantity:</strong> {(selectedItemDetail.closingQty || 0).toLocaleString()}</p>
                                        <p><strong>Closing Value:</strong> {formatCurrency(selectedItemDetail.closingValue || 0)}</p>
                                        <p><strong>Base Units:</strong> {selectedItemDetail.baseUnits || 'N/A'}</p>
                                        <p><strong>Cost Price:</strong> {formatCurrency(selectedItemDetail.costPrice || 0)}</p>
                                        <p><strong>Selling Price:</strong> {formatCurrency(selectedItemDetail.sellingPrice || 0)}</p>
                                        <p><strong>Stock Status:</strong> 
                                            <Badge bg={getStockStatusBadge(selectedItemDetail.closingQty, selectedItemDetail.stockStatus).color} className="ms-2">
                                                {selectedItemDetail.stockStatus}
                                            </Badge>
                                        </p>
                                        <p><strong>GST Applicable:</strong> 
                                            <Badge bg={selectedItemDetail.gstApplicable === 'Yes' ? 'success' : 'secondary'} className="ms-2">
                                                {selectedItemDetail.gstApplicable || 'N/A'}
                                            </Badge>
                                        </p>
                                    </Card.Body>
                                </Card>
                            </Col>
                            
                            {/* Movement History Section */}
                            {selectedItemDetail.movementHistory && selectedItemDetail.movementHistory.length > 0 && (
                                <Col xs={12} className="mt-3">
                                    <Card>
                                        <Card.Header>
                                            <h5><i className="mdi mdi-chart-timeline-variant me-2"></i>Recent Stock Movements</h5>
                                        </Card.Header>
                                        <Card.Body>
                                            <div className="table-responsive">
                                                <Table size="sm" striped>
                                                    <thead>
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Voucher</th>
                                                            <th>Type</th>
                                                            <th>Quantity</th>
                                                            <th>Rate</th>
                                                            <th>Amount</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedItemDetail.movementHistory.slice(0, 10).map((movement, idx) => (
                                                            <tr key={idx}>
                                                                <td>{new Date(movement.date).toLocaleDateString()}</td>
                                                                <td><code>{movement.voucherNumber}</code></td>
                                                                <td>
                                                                    <Badge bg={movement.inward ? 'success' : 'danger'}>
                                                                        {movement.voucherType}
                                                                    </Badge>
                                                                </td>
                                                                <td className={movement.inward ? 'text-success' : 'text-danger'}>
                                                                    {movement.inward ? '+' : ''}{movement.quantity.toLocaleString()}
                                                                </td>
                                                                <td>{formatCurrency(movement.rate)}</td>
                                                                <td className={movement.inward ? 'text-success' : 'text-danger'}>
                                                                    {formatCurrency(movement.amount)}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                            
                                            {/* Movement Statistics */}
                                            {selectedItemDetail.movementStats && (
                                                <Row className="mt-3">
                                                    <Col md={3}>
                                                        <div className="text-center">
                                                            <h5 className="text-primary">{selectedItemDetail.movementStats.totalTransactions || 0}</h5>
                                                            <p className="text-muted mb-0">Total Transactions</p>
                                                        </div>
                                                    </Col>
                                                    <Col md={3}>
                                                        <div className="text-center">
                                                            <h5 className="text-success">{(selectedItemDetail.movementStats.totalInward || 0).toLocaleString()}</h5>
                                                            <p className="text-muted mb-0">Total Inward</p>
                                                        </div>
                                                    </Col>
                                                    <Col md={3}>
                                                        <div className="text-center">
                                                            <h5 className="text-danger">{(selectedItemDetail.movementStats.totalOutward || 0).toLocaleString()}</h5>
                                                            <p className="text-muted mb-0">Total Outward</p>
                                                        </div>
                                                    </Col>
                                                    <Col md={3}>
                                                        <div className="text-center">
                                                            <h5 className="text-info">{formatCurrency(selectedItemDetail.movementStats.averageRate || 0)}</h5>
                                                            <p className="text-muted mb-0">Average Rate</p>
                                                        </div>
                                                    </Col>
                                                </Row>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                            )}
                            
                            {/* Recommendations Section */}
                            {selectedItemDetail.statusInfo && (
                                <Col xs={12} className="mt-3">
                                    <Alert variant="info">
                                        <Alert.Heading><i className="mdi mdi-lightbulb-on me-2"></i>Recommendation</Alert.Heading>
                                        <p className="mb-0">{selectedItemDetail.statusInfo.recommendation}</p>
                                    </Alert>
                                </Col>
                            )}
                        </Row>
                    ) : (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                            <p className="mt-2">Loading item details...</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
                        Close
                    </Button>
                    {selectedItemDetail && (
                        <Button variant="primary" onClick={() => fetchMovementHistory(selectedItemDetail)}>
                            <i className="mdi mdi-chart-timeline-variant me-2"></i>View Movement History
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>

            {/* Movement History Modal */}
            <Modal show={showHistoryModal} onHide={() => setShowHistoryModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="mdi mdi-chart-timeline-variant me-2"></i>
                        Movement History: {selectedItemHistory?.name}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                    {selectedItemHistory ? (
                        selectedItemHistory.movementHistory ? (
                            <>
                                {selectedItemHistory.movementHistory.length > 0 ? (
                                    <div className="table-responsive">
                                        <Table striped bordered hover size="sm">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>Date</th>
                                                    <th>Voucher</th>
                                                    <th>Type</th>
                                                    <th>Reference</th>
                                                    <th>Quantity</th>
                                                    <th>Rate</th>
                                                    <th>Amount</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {selectedItemHistory.movementHistory.map((movement, idx) => (
                                                    <tr key={idx}>
                                                        <td>{new Date(movement.date).toLocaleDateString()}</td>
                                                        <td><code>{movement.voucherNumber}</code></td>
                                                        <td>
                                                            <Badge bg={movement.inward ? 'success' : 'danger'}>
                                                                <i className={`mdi mdi-arrow-${movement.inward ? 'down' : 'up'} me-1`}></i>
                                                                {movement.voucherType}
                                                            </Badge>
                                                        </td>
                                                        <td>{movement.reference || 'N/A'}</td>
                                                        <td className={movement.inward ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                                            {movement.inward ? '+' : ''}{movement.quantity.toLocaleString()}
                                                        </td>
                                                        <td>{formatCurrency(movement.rate)}</td>
                                                        <td className={movement.inward ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                                            {formatCurrency(movement.amount)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                ) : (
                                    <Alert variant="info">
                                        <i className="mdi mdi-information me-2"></i>
                                        No movement history found for this item.
                                    </Alert>
                                )}
                            </>
                        ) : selectedItemHistory.error ? (
                            <Alert variant="danger">
                                <i className="mdi mdi-alert me-2"></i>
                                {selectedItemHistory.error}
                            </Alert>
                        ) : (
                            <div className="text-center py-4">
                                <Spinner animation="border" />
                                <p className="mt-2">Loading movement history...</p>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-4">
                            <Spinner animation="border" />
                            <p className="mt-2">Loading movement history...</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowHistoryModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default TallyStockItemsDetail;