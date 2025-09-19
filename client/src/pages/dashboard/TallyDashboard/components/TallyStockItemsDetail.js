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
    const [itemsPerPage] = useState(20);
    const navigate = useNavigate();

    // Fetch stock items data with pagination and filters
    const fetchStockItemsData = useCallback(async (page = 1, search = '', category = '', stock = '') => {
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
                ...(stock && { stock })
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
            fetchStockItemsData(prev, searchTerm, categoryFilter, stockFilter);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            const next = currentPage + 1;
            setCurrentPage(next);
            fetchStockItemsData(next, searchTerm, categoryFilter, stockFilter);
        }
    };

    // Handle pagination change
    const handlePageChange = (event, page) => {
        setCurrentPage(page);
        fetchStockItemsData(page, searchTerm, categoryFilter, stockFilter);
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
                fetchStockItemsData(1, searchTerm, value, stockFilter);
                break;
            case 'stock':
                setStockFilter(value);
                // Immediate search for dropdown changes
                setCurrentPage(1);
                fetchStockItemsData(1, searchTerm, categoryFilter, value);
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
        setCurrentPage(1);
        fetchStockItemsData(1, '', '', '');
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
                                            placeholder="Search by item name..."
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
                                            <option value="out-of-stock">Out of Stock</option>
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
                                                    <th>Category</th>
                                                    <th>Opening Qty</th>
                                                    <th>Closing Qty</th>
                                                    <th>Units</th>
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
                                                        return (
                                                            <tr key={item._id || index}>
                                                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                                <td>
                                                                    <div className="d-flex flex-column">
                                                                        <strong className="text-truncate" style={{ maxWidth: '200px' }}>
                                                                            {item.name || 'N/A'}
                                                                        </strong>
                                                                        {item.alias && (
                                                                            <small className="text-muted">({item.alias})</small>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="text-truncate" style={{ maxWidth: '120px' }}>
                                                                        {item.category || item.parent || 'N/A'}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <span className="fw-bold">
                                                                        {(item.openingQty || 0).toLocaleString()}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <span className="fw-bold">
                                                                        {(item.closingQty || 0).toLocaleString()}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <Badge bg="info">
                                                                        {item.baseUnits || item.units || 'N/A'}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    {formatCurrency(item.openingValue || 0)}
                                                                </td>
                                                                <td>
                                                                    {formatCurrency(item.closingValue || 0)}
                                                                </td>
                                                                <td>
                                                                    <Badge bg={stockStatus.color}>
                                                                        {stockStatus.text}
                                                                    </Badge>
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
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="10" className="text-center text-muted py-4">
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
