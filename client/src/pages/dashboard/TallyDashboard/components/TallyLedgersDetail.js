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
    const navigate = useNavigate();

    // Fetch ledgers data with pagination and filters
    const fetchLedgersData = useCallback(async (page = 1, search = '', group = '', balance = '') => {
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
                ...(balance && { balance })
            });
            
            const response = await axios.get(`http://localhost:7010/api/tally/ledgers?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.status === 200) {
                const list = response.data.data.ledgers || [];
                list.sort((a, b) => new Date(b.lastUpdated || 0) - new Date(a.lastUpdated || 0));
                setLedgersData(list);
                const total = response.data.data.total;
                const computedTotalPages = total ? Math.ceil(total / itemsPerPage) : Math.max(1, Math.ceil(list.length / itemsPerPage));
                setTotalPages(computedTotalPages);
                
                // Extract unique groups for filter dropdown
                const ledgers = response.data.data.ledgers || [];
                const groups = [...new Set(ledgers.map(ledger => ledger.parent || ledger.group).filter(Boolean))];
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

    // Handle pagination change
    const handlePageChange = (event, page) => {
        setCurrentPage(page);
        fetchLedgersData(page, searchTerm, groupFilter, balanceFilter);
    };

    const handlePrevPage = () => {
        if (currentPage > 1) {
            const prev = currentPage - 1;
            setCurrentPage(prev);
            fetchLedgersData(prev, searchTerm, groupFilter, balanceFilter);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            const next = currentPage + 1;
            setCurrentPage(next);
            fetchLedgersData(next, searchTerm, groupFilter, balanceFilter);
        }
    };

    // Handle search
    const handleSearch = () => {
        setCurrentPage(1);
        fetchLedgersData(1, searchTerm, groupFilter, balanceFilter);
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
                fetchLedgersData(1, searchTerm, value, balanceFilter);
                break;
            case 'balance':
                setBalanceFilter(value);
                // Immediate search for dropdown changes
                setCurrentPage(1);
                fetchLedgersData(1, searchTerm, groupFilter, value);
                break;
            default:
                break;
        }
    };

    // Handle filter reset
    const handleReset = () => {
        setSearchTerm('');
        setGroupFilter('');
        setBalanceFilter('');
        setCurrentPage(1);
        fetchLedgersData(1, '', '', '');
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
                ...(balanceFilter && { balance: balanceFilter })
            });
            
            const response = await axios.get(`http://localhost:7010/api/tally/ledgers?${params}`, {
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
            fetchLedgersData(1, '', groupFilter, balanceFilter);
            return;
        }

        const timeoutId = setTimeout(() => {
            setCurrentPage(1);
            fetchLedgersData(1, searchTerm, groupFilter, balanceFilter);
        }, 500); // 500ms delay for debounced search

        return () => clearTimeout(timeoutId);
    }, [searchTerm, groupFilter, balanceFilter, fetchLedgersData]);

    useEffect(() => {
        fetchLedgersData(1, '', '', '');
    }, [fetchLedgersData]);

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

    return (
        <>
            <Row>
                <Col xs={12}>
                    <div className="page-title-box d-flex justify-content-between align-items-center">
                        <div>
                            <h4 className="page-title">Sundry Debtors - Detailed View</h4>
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
                                <li className="breadcrumb-item active">Sundry Debtors Detail</li>
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
                                        <Form.Label>Search Ledgers</Form.Label>
                                        <div className="position-relative">
                                            <Form.Control
                                                type="text"
                                                placeholder="Search by ledger name..."
                                                value={searchTerm}
                                                onChange={(e) => handleFilterChange('search', e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
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
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Group</Form.Label>
                                        <Form.Select
                                            value={groupFilter}
                                            onChange={(e) => handleFilterChange('group', e.target.value)}
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
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Balance Type</Form.Label>
                                        <Form.Select
                                            value={balanceFilter}
                                            onChange={(e) => handleFilterChange('balance', e.target.value)}
                                        >
                                            <option value="">All Balances</option>
                                            <option value="positive">Positive Balance</option>
                                            <option value="negative">Negative Balance</option>
                                            <option value="zero">Zero Balance</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <div className="d-flex gap-2">
                                        <Button variant="primary" onClick={handleSearch} disabled={loading}>
                                            <i className="mdi mdi-magnify"></i> Search
                                        </Button>
                                        <Button variant="outline-secondary" onClick={handleReset}>
                                            <i className="mdi mdi-refresh"></i> Reset
                                        </Button>
                                    </div>
                                </Col>
                                <Col md={2} className="text-end">
                                    <Button variant="success" onClick={handleExport} disabled={loading}>
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

            {/* Ledgers Table */}
            <Row>
                <Col xs={12}>
                    <Card>
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="header-title">
                                    Sundry Debtors Details 
                                    {!loading && ledgersData.length > 0 && (
                                        <span className="text-muted"> ({ledgersData.length} records)</span>
                                    )}
                                    {(searchTerm || groupFilter || balanceFilter) && (
                                        <Badge bg="info" className="ms-2">Filtered</Badge>
                                    )}
                                </h4>
                                <div className="d-flex gap-2">
                                    <Button variant="info" size="sm" onClick={() => fetchLedgersData(currentPage, searchTerm, groupFilter, balanceFilter)} disabled={loading}>
                                        <i className="mdi mdi-refresh"></i> Refresh
                                    </Button>
                                    {(searchTerm || groupFilter || balanceFilter) && (
                                        <Button variant="outline-secondary" size="sm" onClick={handleReset}>
                                            <i className="mdi mdi-filter-remove"></i> Clear Filters
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
                                                    <th>#</th>
                                                    <th>Date</th>
                                                    <th>Ledger Name</th>
                                                    <th>Group/Parent</th>
                                                    <th>Opening Balance</th>
                                                    <th>Closing Balance</th>
                                                    <th>Net Change</th>
                                                    <th>Company</th>
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
                                                        return (
                                                            <tr key={ledger._id || index}>
                                                                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                                <td>{formattedDate}</td>
                                                                <td>
                                                                    <div className="d-flex flex-column">
                                                                        <strong>{ledger.name || 'N/A'}</strong>
                                                                        {ledger.alias && (
                                                                            <small className="text-muted">({ledger.alias})</small>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <div className="text-truncate" style={{ maxWidth: '150px' }}>
                                                                        {ledger.parent || ledger.group || 'N/A'}
                                                                    </div>
                                                                </td>
                                                                <td>
                                                                    <Badge bg={getBalanceBadge(ledger.openingBalance)}>
                                                                        {formatCurrency(Math.abs(ledger.openingBalance || 0))}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    <Badge bg={getBalanceBadge(ledger.closingBalance)}>
                                                                        {formatCurrency(Math.abs(ledger.closingBalance || 0))}
                                                                    </Badge>
                                                                </td>
                                                                <td>
                                                                    <span className={`fw-bold ${netChange >= 0 ? 'text-success' : 'text-danger'}`}>
                                                                        {netChange >= 0 ? '+' : ''}{formatCurrency(netChange)}
                                                                    </span>
                                                                </td>
                                                                <td>
                                                                    <div className="text-truncate" style={{ maxWidth: '120px' }}>
                                                                        {ledger.companyName || 'N/A'}
                                                                    </div>
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
                                                        );
                                                    })
                                                ) : (
                                                    <tr>
                                                        <td colSpan="10" className="text-center text-muted py-4">
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
