// @flow
import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Button, Table, Badge, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { APICore } from '../../../../helpers/api/apiCore';
import MainLoader from '../../../../components/MainLoader';
import axios from 'axios';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';

const TallyVouchersDetail = () => {
    const [vouchersData, setVouchersData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [voucherTypeFilter, setVoucherTypeFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [itemsPerPage] = useState(20);
    const navigate = useNavigate();

    // Fetch vouchers data with pagination and filters
    const fetchVouchersData = useCallback(async (page = 1, search = '', voucherType = '', date = '') => {
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
                ...(date && { date })
            });
            
            const response = await axios.get(`http://localhost:7010/api/tally/vouchers?${params}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.status === 200) {
                setVouchersData(response.data.data.vouchers || []);
                setTotalPages(Math.ceil((response.data.data.total || 0) / itemsPerPage));
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

    // Handle pagination change
    const handlePageChange = (event, page) => {
        setCurrentPage(page);
        fetchVouchersData(page, searchTerm, voucherTypeFilter, dateFilter);
    };

    // Handle search
    const handleSearch = () => {
        setCurrentPage(1);
        fetchVouchersData(1, searchTerm, voucherTypeFilter, dateFilter);
    };

    // Handle filter reset
    const handleReset = () => {
        setSearchTerm('');
        setVoucherTypeFilter('');
        setDateFilter('');
        setCurrentPage(1);
        fetchVouchersData(1, '', '', '');
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
                
                const response = await axios.get(`http://localhost:7010/api/tally/vouchers?${params}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data.status === 200) {
                    setVouchersData(response.data.data.vouchers || []);
                    setTotalPages(Math.ceil((response.data.data.total || 0) / itemsPerPage));
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
                                    <Button variant="success" disabled={loading}>
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
                                <Button variant="info" size="sm" onClick={() => fetchVouchersData(currentPage, searchTerm, voucherTypeFilter, dateFilter)}>
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
                                                        <tr key={voucher._id || index}>
                                                            <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                                            <td>
                                                                {voucher.date ? 
                                                                    new Date(voucher.date).toLocaleDateString('en-IN') : 
                                                                    'N/A'
                                                                }
                                                            </td>
                                                            <td>
                                                                <strong>{voucher.voucherNumber || 'N/A'}</strong>
                                                            </td>
                                                            <td>
                                                                <Badge bg={getVoucherTypeBadge(voucher.voucherType)}>
                                                                    {voucher.voucherType || 'Unknown'}
                                                                </Badge>
                                                            </td>
                                                            <td>
                                                                <div className="text-truncate" style={{ maxWidth: '150px' }}>
                                                                    {voucher.party || voucher.partyName || 'N/A'}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <div className="text-truncate" style={{ maxWidth: '120px' }}>
                                                                    {voucher.reference || voucher.narration || 'N/A'}
                                                                </div>
                                                            </td>
                                                            <td>
                                                                <span className={`fw-bold ${voucher.amount >= 0 ? 'text-success' : 'text-danger'}`}>
                                                                    {formatCurrency(Math.abs(voucher.amount || 0))}
                                                                </span>
                                                            </td>
                                                            <td>
                                                                <div className="text-truncate" style={{ maxWidth: '120px' }}>
                                                                    {voucher.companyName || 'N/A'}
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
                                                                        title="Edit"
                                                                    >
                                                                        <i className="mdi mdi-pencil"></i>
                                                                    </Button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="9" className="text-center text-muted py-4">
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
                                            <Col xs={12} className="d-flex justify-content-center">
                                                <Stack spacing={2}>
                                                    <Pagination 
                                                        count={totalPages} 
                                                        page={currentPage} 
                                                        onChange={handlePageChange}
                                                        color="primary"
                                                        size="large"
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
        </>
    );
};

export default TallyVouchersDetail;
