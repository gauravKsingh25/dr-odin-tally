import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Col, Button, Row, Modal, Badge, Alert, Accordion, InputGroup } from 'react-bootstrap';
import './style.css';
import { APICore } from '../../../helpers/api/apiCore';
import ToastHandle from '../../../constants/Toaster/Toaster';
import MainLoader from '../../../components/MainLoader';
import moment from 'moment';

const api = new APICore();

function ManualVoucherUpload() {
    // State for voucher lists
    const [recentManualVouchers, setRecentManualVouchers] = useState([]);
    const [allVouchers, setAllVouchers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Pagination for all vouchers
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });
    
    // State for filters (all vouchers)
    const [filters, setFilters] = useState({
        search: '',
        voucherType: '',
        party: '',
        startDate: '',
        endDate: ''
    });
    
    // State for CRUD operations
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [formData, setFormData] = useState(getEmptyFormData());
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);
    
    // State for delete confirmation
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [voucherToDelete, setVoucherToDelete] = useState(null);
    
    function getEmptyFormData() {
        return {
            // Basic Information
            date: moment().format('YYYY-MM-DD'),
            voucherNumber: '',
            voucherType: 'Sales',
            voucherTypeName: '',
            
            // Party Information
            party: '',
            partyledgername: '',
            
            // Financial Details
            amount: '',
            narration: '',
            reference: '',
            isDeemedPositive: true,
            
            // Additional Dates
            voucherDate: moment().format('YYYY-MM-DD'),
            effectiveDate: '',
            basicvoucherdate: '',
            
            // Master IDs
            guid: '',
            masterId: '',
            alterid: '',
            
            // Inventory Entries (Array)
            inventoryEntries: [],
            
            // Ledger Entries (Array)
            ledgerEntries: [],
            
            // Bank Details
            bankDetails: {
                transactionType: '',
                instrumentDate: '',
                instrumentNumber: '',
                bankName: '',
                bankAccountNumber: '',
                ifscCode: '',
                payeeName: '',
                chequeNumber: '',
                chequeCrossComment: '',
                favouringName: '',
                clearanceDate: ''
            },
            
            // GST Details
            gstDetails: {
                cgstAmount: '',
                sgstAmount: '',
                igstAmount: '',
                cessAmount: '',
                placeOfSupply: '',
                partyGSTIN: '',
                gstTaxType: '',
                isReverseChargeApplicable: false
            },
            
            // E-Invoice Details
            eInvoiceDetails: {
                eInvoiceNumber: '',
                eInvoiceDate: '',
                eInvoiceStatus: '',
                eInvoiceQRCode: '',
                irn: '',
                acknowledgementNumber: '',
                acknowledgementDate: ''
            },
            
            // Cost Centre Allocations
            costCentreAllocations: []
        };
    }
    
    useEffect(() => {
        fetchRecentManualVouchers();
        fetchAllVouchers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    
    useEffect(() => {
        fetchAllVouchers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pagination.page, filters]);
    
    // Fetch recent 10 manual vouchers
    const fetchRecentManualVouchers = async () => {
        try {
            const response = await api.get(`tally/voucher/manual/list?page=1&limit=10`);
            
            if (response.status === 200) {
                setRecentManualVouchers(response.data.data.vouchers || []);
            }
        } catch (error) {
            console.error('Error fetching recent manual vouchers:', error);
        }
    };
    
    // Fetch all vouchers (manual + Tally synced) with pagination and filters
    const fetchAllVouchers = async () => {
        try {
            setLoading(true);
            
            const queryParams = new URLSearchParams({
                page: pagination.page,
                limit: pagination.limit
            });
            
            // Add filters if present
            if (filters.voucherType) {
                queryParams.append('voucherType', filters.voucherType);
            }
            if (filters.startDate) {
                queryParams.append('fromDate', filters.startDate);
            }
            if (filters.endDate) {
                queryParams.append('toDate', filters.endDate);
            }
            
            // Fetch all vouchers
            const response = await api.get(`tally/vouchers?${queryParams}`);
            
            if (response.status === 200) {
                let vouchersData = response.data.data.vouchers || [];
                
                // Apply client-side filtering for search and party (since backend doesn't support these)
                if (filters.search || filters.party) {
                    vouchersData = vouchersData.filter(voucher => {
                        const searchMatch = !filters.search || 
                            (voucher.voucherNumber && voucher.voucherNumber.toLowerCase().includes(filters.search.toLowerCase())) ||
                            (voucher.party && voucher.party.toLowerCase().includes(filters.search.toLowerCase())) ||
                            (voucher.narration && voucher.narration.toLowerCase().includes(filters.search.toLowerCase())) ||
                            (voucher.reference && voucher.reference.toLowerCase().includes(filters.search.toLowerCase()));
                        
                        const partyMatch = !filters.party || 
                            (voucher.party && voucher.party.toLowerCase().includes(filters.party.toLowerCase()));
                        
                        return searchMatch && partyMatch;
                    });
                }
                
                setAllVouchers(vouchersData);
                
                const paginationData = response.data.data.pagination;
                if (paginationData) {
                    setPagination(prev => ({
                        ...prev,
                        total: paginationData.total || 0,
                        totalPages: paginationData.totalPages || 1
                    }));
                }
            }
        } catch (error) {
            console.error('Error fetching all vouchers:', error);
            ToastHandle('error', 'Failed to fetch vouchers');
        } finally {
            setLoading(false);
        }
    };
    
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        setPagination(prev => ({ ...prev, page: 1 }));
    };
    
    const handleClearFilters = () => {
        setFilters({
            search: '',
            voucherType: '',
            party: '',
            startDate: '',
            endDate: ''
        });
        setPagination(prev => ({ ...prev, page: 1 }));
    };
    
    const handleCreate = () => {
        setModalMode('create');
        setFormData(getEmptyFormData());
        setFormErrors({});
        setSelectedVoucher(null);
        setShowModal(true);
    };
    
    const handleEdit = async (voucher) => {
        try {
            setLoading(true);
            const response = await api.get(`tally/voucher/manual/${voucher._id}`);
            
            if (response.status === 200) {
                const voucherData = response.data.data.voucher;
                
                // Convert dates to YYYY-MM-DD format for form inputs
                const formattedData = {
                    ...voucherData,
                    date: voucherData.date ? moment(voucherData.date).format('YYYY-MM-DD') : '',
                    voucherDate: voucherData.voucherDate ? moment(voucherData.voucherDate).format('YYYY-MM-DD') : '',
                    effectiveDate: voucherData.effectiveDate ? moment(voucherData.effectiveDate).format('YYYY-MM-DD') : '',
                    basicvoucherdate: voucherData.basicvoucherdate ? moment(voucherData.basicvoucherdate).format('YYYY-MM-DD') : '',
                    
                    // Ensure nested objects exist
                    bankDetails: voucherData.bankDetails || getEmptyFormData().bankDetails,
                    gstDetails: voucherData.gstDetails || getEmptyFormData().gstDetails,
                    eInvoiceDetails: voucherData.eInvoiceDetails || getEmptyFormData().eInvoiceDetails,
                    inventoryEntries: voucherData.inventoryEntries || [],
                    ledgerEntries: voucherData.ledgerEntries || [],
                    costCentreAllocations: voucherData.costCentreAllocations || []
                };
                
                setFormData(formattedData);
                setSelectedVoucher(voucherData);
                setModalMode('edit');
                setFormErrors({});
                setShowModal(true);
            }
        } catch (error) {
            console.error('Error fetching voucher:', error);
            ToastHandle('error', 'Failed to load voucher details');
        } finally {
            setLoading(false);
        }
    };
    
    const handleView = async (voucher) => {
        await handleEdit(voucher);
        setModalMode('view');
    };
    
    const handleDelete = (voucher) => {
        setVoucherToDelete(voucher);
        setShowDeleteModal(true);
    };
    
    const confirmDelete = async () => {
        if (!voucherToDelete) return;
        
        try {
            setSaving(true);
            const response = await api.delete(`tally/voucher/manual/${voucherToDelete._id}`);
            
            if (response.status === 200) {
                ToastHandle('success', 'Voucher deleted successfully');
                setShowDeleteModal(false);
                setVoucherToDelete(null);
                fetchRecentManualVouchers();
                fetchAllVouchers();
            }
        } catch (error) {
            console.error('Error deleting voucher:', error);
            ToastHandle('error', error.response?.data?.message || 'Failed to delete voucher');
        } finally {
            setSaving(false);
        }
    };
    
    const validateForm = () => {
        const errors = {};
        
        // Required fields
        if (!formData.date) errors.date = 'Date is required';
        if (!formData.voucherNumber?.trim()) errors.voucherNumber = 'Voucher number is required';
        if (!formData.voucherType?.trim()) errors.voucherType = 'Voucher type is required';
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            errors.amount = 'Amount must be greater than 0';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const handleSave = async () => {
        if (!validateForm()) {
            ToastHandle('error', 'Please fix the form errors');
            return;
        }
        
        try {
            setSaving(true);
            
            // Prepare data for API
            const dataToSave = {
                ...formData,
                amount: parseFloat(formData.amount) || 0,
                
                // Clean up bank details
                bankDetails: formData.bankDetails.transactionType || formData.bankDetails.instrumentNumber 
                    ? formData.bankDetails 
                    : undefined,
                
                // Clean up GST details
                gstDetails: formData.gstDetails.cgstAmount || formData.gstDetails.sgstAmount || formData.gstDetails.igstAmount
                    ? {
                        ...formData.gstDetails,
                        cgstAmount: parseFloat(formData.gstDetails.cgstAmount) || 0,
                        sgstAmount: parseFloat(formData.gstDetails.sgstAmount) || 0,
                        igstAmount: parseFloat(formData.gstDetails.igstAmount) || 0,
                        cessAmount: parseFloat(formData.gstDetails.cessAmount) || 0
                    }
                    : undefined,
                
                // Clean up e-invoice details
                eInvoiceDetails: formData.eInvoiceDetails.eInvoiceNumber || formData.eInvoiceDetails.irn
                    ? formData.eInvoiceDetails
                    : undefined,
                
                // Only include arrays if they have items
                inventoryEntries: formData.inventoryEntries.length > 0 ? formData.inventoryEntries : undefined,
                ledgerEntries: formData.ledgerEntries.length > 0 ? formData.ledgerEntries : undefined,
                costCentreAllocations: formData.costCentreAllocations.length > 0 ? formData.costCentreAllocations : undefined
            };
            
            let response;
            if (modalMode === 'create') {
                response = await api.create('tally/voucher/manual', dataToSave);
            } else {
                response = await api.update(`tally/voucher/manual/${selectedVoucher._id}`, dataToSave);
            }
            
            if (response.status === 201 || response.status === 200) {
                ToastHandle('success', `Voucher ${modalMode === 'create' ? 'created' : 'updated'} successfully`);
                setShowModal(false);
                fetchRecentManualVouchers();
                fetchAllVouchers();
            }
        } catch (error) {
            console.error('Error saving voucher:', error);
            const errorMsg = error.response?.data?.message || `Failed to ${modalMode === 'create' ? 'create' : 'update'} voucher`;
            ToastHandle('error', errorMsg);
        } finally {
            setSaving(false);
        }
    };
    
    const handleFormChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        
        // Clear error for this field
        if (formErrors[field]) {
            setFormErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };
    
    const handleNestedChange = (parent, field, value) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };
    
    // Inventory Entry Management
    const addInventoryEntry = () => {
        setFormData(prev => ({
            ...prev,
            inventoryEntries: [
                ...prev.inventoryEntries,
                {
                    stockItemName: '',
                    quantity: '',
                    rate: '',
                    amount: '',
                    actualQuantity: '',
                    billedQuantity: '',
                    unit: ''
                }
            ]
        }));
    };
    
    const removeInventoryEntry = (index) => {
        setFormData(prev => ({
            ...prev,
            inventoryEntries: prev.inventoryEntries.filter((_, i) => i !== index)
        }));
    };
    
    const updateInventoryEntry = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            inventoryEntries: prev.inventoryEntries.map((entry, i) => 
                i === index ? { ...entry, [field]: value } : entry
            )
        }));
    };
    
    // Ledger Entry Management
    const addLedgerEntry = () => {
        setFormData(prev => ({
            ...prev,
            ledgerEntries: [
                ...prev.ledgerEntries,
                {
                    ledgerName: '',
                    amount: '',
                    isDebit: true
                }
            ]
        }));
    };
    
    const removeLedgerEntry = (index) => {
        setFormData(prev => ({
            ...prev,
            ledgerEntries: prev.ledgerEntries.filter((_, i) => i !== index)
        }));
    };
    
    const updateLedgerEntry = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            ledgerEntries: prev.ledgerEntries.map((entry, i) => 
                i === index ? { ...entry, [field]: value } : entry
            )
        }));
    };
    
    const voucherTypes = [
        'Sales', 'Purchase', 'Receipt', 'Payment', 'Journal', 'Contra', 
        'Debit Note', 'Credit Note', 'Delivery Note', 'Stock Journal',
        'Physical Stock', 'Receipt Note', 'Rejection Out', 'Sales Order',
        'Purchase Order'
    ];
    
    return (
        <>
            <Row>
                <Col xs={12}>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <div>
                                <h4 className="header-title mb-1">
                                    <i className="mdi mdi-file-document-edit me-2"></i>
                                    Manual Voucher Management
                                </h4>
                                <p className="text-muted mb-0">Create, edit, and manage vouchers manually</p>
                            </div>
                            <Button variant="primary" onClick={handleCreate}>
                                <i className="mdi mdi-plus-circle me-1"></i>
                                Create New Voucher
                            </Button>
                        </Card.Header>
                    </Card>
                </Col>
            </Row>
            
            {/* Section 1: Recent Manual Vouchers (Last 10) */}
            <Row>
                <Col xs={12}>
                    <Card>
                        <Card.Header>
                            <h5 className="header-title mb-0">
                                <i className="mdi mdi-file-plus me-2"></i>
                                Recent Manual Vouchers
                                {recentManualVouchers.length > 0 && (
                                    <Badge bg="success" className="ms-2">{recentManualVouchers.length}</Badge>
                                )}
                                <small className="text-muted ms-2">(Last 10 created manually)</small>
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {recentManualVouchers.length === 0 ? (
                                <Alert variant="info">
                                    <i className="mdi mdi-information-outline me-2"></i>
                                    No manual vouchers found. Click "Create New Voucher" to add one.
                                </Alert>
                            ) : (
                                <div className="table-responsive">
                                    <Table hover className="mb-0">
                                        <thead className="table-dark">
                                            <tr>
                                                <th>Date</th>
                                                <th>Voucher No.</th>
                                                <th>Type</th>
                                                <th>Party</th>
                                                <th>Amount</th>
                                                <th>Narration</th>
                                                <th>Reference</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {recentManualVouchers.map((voucher) => (
                                                <tr key={voucher._id}>
                                                    <td>{moment(voucher.date).format('DD/MM/YYYY')}</td>
                                                    <td>
                                                        <strong>{voucher.voucherNumber}</strong>
                                                        <Badge bg="success" className="ms-2" title="Manually created">
                                                            MANUAL
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        <Badge bg="primary">{voucher.voucherType}</Badge>
                                                    </td>
                                                    <td className="text-truncate" style={{maxWidth: '150px'}}>
                                                        {voucher.party || '-'}
                                                    </td>
                                                    <td>₹{voucher.amount?.toLocaleString() || 0}</td>
                                                    <td className="text-truncate" style={{maxWidth: '150px'}}>
                                                        {voucher.narration || '-'}
                                                    </td>
                                                    <td>{voucher.reference || '-'}</td>
                                                    <td>
                                                        <div className="d-flex gap-1">
                                                            <Button 
                                                                size="sm" 
                                                                variant="info"
                                                                onClick={() => handleView(voucher)}
                                                                title="View"
                                                            >
                                                                <i className="mdi mdi-eye"></i>
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="warning"
                                                                onClick={() => handleEdit(voucher)}
                                                                title="Edit"
                                                            >
                                                                <i className="mdi mdi-pencil"></i>
                                                            </Button>
                                                            <Button 
                                                                size="sm" 
                                                                variant="danger"
                                                                onClick={() => handleDelete(voucher)}
                                                                title="Delete"
                                                            >
                                                                <i className="mdi mdi-delete"></i>
                                                            </Button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            {/* Section 2: All Vouchers Collection (Manual + Tally Synced) */}
            <Row>
                <Col xs={12}>
                    <Card>
                        <Card.Header>
                            <h5 className="header-title mb-0">
                                <i className="mdi mdi-file-document-multiple me-2"></i>
                                All Vouchers Collection
                                {allVouchers.length > 0 && (
                                    <Badge bg="secondary" className="ms-2">{pagination.total}</Badge>
                                )}
                                <small className="text-muted ms-2">(Manual + Tally Synced)</small>
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            {/* All Vouchers Filters */}
                            <Row className="mb-3">
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label>Search</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Voucher No., Party, Reference..."
                                            value={filters.search}
                                            onChange={(e) => handleFilterChange('search', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Voucher Type</Form.Label>
                                        <Form.Select
                                            value={filters.voucherType}
                                            onChange={(e) => handleFilterChange('voucherType', e.target.value)}
                                        >
                                            <option value="">All Types</option>
                                            {voucherTypes.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Party</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Party name..."
                                            value={filters.party}
                                            onChange={(e) => handleFilterChange('party', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>Start Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={filters.startDate}
                                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={2}>
                                    <Form.Group>
                                        <Form.Label>End Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={filters.endDate}
                                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={1} className="d-flex align-items-end">
                                    <Button variant="secondary" onClick={handleClearFilters} className="w-100">
                                        <i className="mdi mdi-refresh"></i>
                                    </Button>
                                </Col>
                            </Row>
                            
                            {/* All Vouchers Table */}
                            {loading ? (
                                <MainLoader />
                            ) : (
                                <>
                                    {allVouchers.length === 0 ? (
                                        <Alert variant="info">
                                            <i className="mdi mdi-information-outline me-2"></i>
                                            No vouchers found in the collection.
                                        </Alert>
                                    ) : (
                                        <>
                                            <div className="table-responsive">
                                                <Table hover className="mb-0">
                                                    <thead className="table-secondary">
                                                        <tr>
                                                            <th>Date</th>
                                                            <th>Voucher No.</th>
                                                            <th>Type</th>
                                                            <th>Party</th>
                                                            <th>Amount</th>
                                                            <th>Source</th>
                                                            <th>Narration</th>
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {allVouchers.map((voucher) => (
                                                            <tr key={voucher._id}>
                                                                <td>{voucher.date ? moment(voucher.date).format('DD/MM/YYYY') : '-'}</td>
                                                                <td>
                                                                    <strong>{voucher.voucherNumber}</strong>
                                                                    {voucher.manualEntry && (
                                                                        <Badge bg="success" className="ms-2" title="Manually created">
                                                                            Manual
                                                                        </Badge>
                                                                    )}
                                                                </td>
                                                                <td>
                                                                    <Badge bg="secondary">{voucher.voucherType}</Badge>
                                                                </td>
                                                                <td className="text-truncate" style={{maxWidth: '150px'}}>
                                                                    {voucher.party || '-'}
                                                                </td>
                                                                <td>₹{voucher.amount?.toLocaleString() || 0}</td>
                                                                <td>
                                                                    <Badge bg={voucher.uploadSource === 'MANUAL' ? 'success' : 'info'}>
                                                                        {voucher.uploadSource || 'TALLY'}
                                                                    </Badge>
                                                                </td>
                                                                <td className="text-truncate" style={{maxWidth: '150px'}}>
                                                                    {voucher.narration || '-'}
                                                                </td>
                                                                <td>
                                                                    <div className="d-flex gap-1">
                                                                        <Button 
                                                                            size="sm" 
                                                                            variant="info"
                                                                            onClick={() => handleView(voucher)}
                                                                            title="View"
                                                                        >
                                                                            <i className="mdi mdi-eye"></i>
                                                                        </Button>
                                                                        {voucher.manualEntry && (
                                                                            <>
                                                                                <Button 
                                                                                    size="sm" 
                                                                                    variant="warning"
                                                                                    onClick={() => handleEdit(voucher)}
                                                                                    title="Edit"
                                                                                >
                                                                                    <i className="mdi mdi-pencil"></i>
                                                                                </Button>
                                                                                <Button 
                                                                                    size="sm" 
                                                                                    variant="danger"
                                                                                    onClick={() => handleDelete(voucher)}
                                                                                    title="Delete"
                                                                                >
                                                                                    <i className="mdi mdi-delete"></i>
                                                                                </Button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                            
                                            {/* All Vouchers Pagination */}
                                            <Row className="mt-3">
                                                <Col md={6}>
                                                    <p className="text-muted">
                                                        Showing {allVouchers.length} of {pagination.total} total vouchers
                                                    </p>
                                                </Col>
                                                <Col md={6} className="text-end">
                                                    <Button 
                                                        variant="secondary" 
                                                        size="sm"
                                                        disabled={pagination.page === 1}
                                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                                                        className="me-2"
                                                    >
                                                        <i className="mdi mdi-chevron-left"></i> Previous
                                                    </Button>
                                                    <span className="me-2">
                                                        Page {pagination.page} of {pagination.totalPages}
                                                    </span>
                                                    <Button 
                                                        variant="secondary" 
                                                        size="sm"
                                                        disabled={pagination.page === pagination.totalPages}
                                                        onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                                                    >
                                                        Next <i className="mdi mdi-chevron-right"></i>
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </>
                                    )}
                                </>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            
            {/* Create/Edit/View Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" scrollable>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className={`mdi ${modalMode === 'create' ? 'mdi-plus-circle' : modalMode === 'edit' ? 'mdi-pencil' : 'mdi-eye'} me-2`}></i>
                        {modalMode === 'create' ? 'Create New Voucher' : modalMode === 'edit' ? 'Edit Voucher' : 'View Voucher'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Accordion defaultActiveKey="0">
                        {/* Basic Information */}
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>
                                <i className="mdi mdi-information-outline me-2"></i>
                                Basic Information
                                {(formErrors.date || formErrors.voucherNumber || formErrors.voucherType || formErrors.amount) && (
                                    <Badge bg="danger" className="ms-2">Required</Badge>
                                )}
                            </Accordion.Header>
                            <Accordion.Body>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Date <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => handleFormChange('date', e.target.value)}
                                                isInvalid={!!formErrors.date}
                                                disabled={modalMode === 'view'}
                                            />
                                            <Form.Control.Feedback type="invalid">{formErrors.date}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Voucher Number <span className="text-danger">*</span></Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter voucher number"
                                                value={formData.voucherNumber}
                                                onChange={(e) => handleFormChange('voucherNumber', e.target.value)}
                                                isInvalid={!!formErrors.voucherNumber}
                                                disabled={modalMode === 'view'}
                                            />
                                            <Form.Control.Feedback type="invalid">{formErrors.voucherNumber}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Voucher Type <span className="text-danger">*</span></Form.Label>
                                            <Form.Select
                                                value={formData.voucherType}
                                                onChange={(e) => handleFormChange('voucherType', e.target.value)}
                                                isInvalid={!!formErrors.voucherType}
                                                disabled={modalMode === 'view'}
                                            >
                                                {voucherTypes.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </Form.Select>
                                            <Form.Control.Feedback type="invalid">{formErrors.voucherType}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Voucher Type Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Custom type name (optional)"
                                                value={formData.voucherTypeName}
                                                onChange={(e) => handleFormChange('voucherTypeName', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Amount <span className="text-danger">*</span></Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text>₹</InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={formData.amount}
                                                    onChange={(e) => handleFormChange('amount', e.target.value)}
                                                    isInvalid={!!formErrors.amount}
                                                    disabled={modalMode === 'view'}
                                                />
                                                <Form.Control.Feedback type="invalid">{formErrors.amount}</Form.Control.Feedback>
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Is Deemed Positive</Form.Label>
                                            <Form.Check
                                                type="switch"
                                                checked={formData.isDeemedPositive}
                                                onChange={(e) => handleFormChange('isDeemedPositive', e.target.checked)}
                                                label={formData.isDeemedPositive ? 'Yes' : 'No'}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Narration</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                placeholder="Enter narration/description"
                                                value={formData.narration}
                                                onChange={(e) => handleFormChange('narration', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Reference</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Reference number"
                                                value={formData.reference}
                                                onChange={(e) => handleFormChange('reference', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>
                        
                        {/* Party Information */}
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>
                                <i className="mdi mdi-account-outline me-2"></i>
                                Party Information
                            </Accordion.Header>
                            <Accordion.Body>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Party Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter party name"
                                                value={formData.party}
                                                onChange={(e) => handleFormChange('party', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Party Ledger Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Ledger name for party"
                                                value={formData.partyledgername}
                                                onChange={(e) => handleFormChange('partyledgername', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>
                        
                        {/* Additional Dates */}
                        <Accordion.Item eventKey="2">
                            <Accordion.Header>
                                <i className="mdi mdi-calendar-range me-2"></i>
                                Additional Dates
                            </Accordion.Header>
                            <Accordion.Body>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Voucher Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={formData.voucherDate}
                                                onChange={(e) => handleFormChange('voucherDate', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Effective Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={formData.effectiveDate}
                                                onChange={(e) => handleFormChange('effectiveDate', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Basic Voucher Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={formData.basicvoucherdate}
                                                onChange={(e) => handleFormChange('basicvoucherdate', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>
                        
                        {/* GST Details */}
                        <Accordion.Item eventKey="3">
                            <Accordion.Header>
                                <i className="mdi mdi-receipt me-2"></i>
                                GST Details
                            </Accordion.Header>
                            <Accordion.Body>
                                <Row>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>CGST Amount</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text>₹</InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={formData.gstDetails.cgstAmount}
                                                    onChange={(e) => handleNestedChange('gstDetails', 'cgstAmount', e.target.value)}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>SGST Amount</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text>₹</InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={formData.gstDetails.sgstAmount}
                                                    onChange={(e) => handleNestedChange('gstDetails', 'sgstAmount', e.target.value)}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>IGST Amount</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text>₹</InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={formData.gstDetails.igstAmount}
                                                    onChange={(e) => handleNestedChange('gstDetails', 'igstAmount', e.target.value)}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>CESS Amount</Form.Label>
                                            <InputGroup>
                                                <InputGroup.Text>₹</InputGroup.Text>
                                                <Form.Control
                                                    type="number"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    value={formData.gstDetails.cessAmount}
                                                    onChange={(e) => handleNestedChange('gstDetails', 'cessAmount', e.target.value)}
                                                    disabled={modalMode === 'view'}
                                                />
                                            </InputGroup>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Place of Supply</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="State name"
                                                value={formData.gstDetails.placeOfSupply}
                                                onChange={(e) => handleNestedChange('gstDetails', 'placeOfSupply', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Party GSTIN</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="GSTIN number"
                                                value={formData.gstDetails.partyGSTIN}
                                                onChange={(e) => handleNestedChange('gstDetails', 'partyGSTIN', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>GST Tax Type</Form.Label>
                                            <Form.Select
                                                value={formData.gstDetails.gstTaxType}
                                                onChange={(e) => handleNestedChange('gstDetails', 'gstTaxType', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            >
                                                <option value="">Select Type</option>
                                                <option value="GST">GST</option>
                                                <option value="IGST">IGST</option>
                                                <option value="Exempted">Exempted</option>
                                                <option value="Nil Rated">Nil Rated</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Reverse Charge Applicable</Form.Label>
                                            <Form.Check
                                                type="switch"
                                                checked={formData.gstDetails.isReverseChargeApplicable}
                                                onChange={(e) => handleNestedChange('gstDetails', 'isReverseChargeApplicable', e.target.checked)}
                                                label={formData.gstDetails.isReverseChargeApplicable ? 'Yes' : 'No'}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>
                        
                        {/* Bank Details */}
                        <Accordion.Item eventKey="4">
                            <Accordion.Header>
                                <i className="mdi mdi-bank me-2"></i>
                                Bank Details
                            </Accordion.Header>
                            <Accordion.Body>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Transaction Type</Form.Label>
                                            <Form.Select
                                                value={formData.bankDetails.transactionType}
                                                onChange={(e) => handleNestedChange('bankDetails', 'transactionType', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            >
                                                <option value="">Select Type</option>
                                                <option value="Cheque">Cheque</option>
                                                <option value="DD">DD</option>
                                                <option value="NEFT">NEFT</option>
                                                <option value="RTGS">RTGS</option>
                                                <option value="IMPS">IMPS</option>
                                                <option value="UPI">UPI</option>
                                                <option value="Cash">Cash</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Instrument Date</Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={formData.bankDetails.instrumentDate}
                                                onChange={(e) => handleNestedChange('bankDetails', 'instrumentDate', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Instrument Number</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Cheque/DD/Transaction number"
                                                value={formData.bankDetails.instrumentNumber}
                                                onChange={(e) => handleNestedChange('bankDetails', 'instrumentNumber', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Bank Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Bank name"
                                                value={formData.bankDetails.bankName}
                                                onChange={(e) => handleNestedChange('bankDetails', 'bankName', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Bank Account Number</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Account number"
                                                value={formData.bankDetails.bankAccountNumber}
                                                onChange={(e) => handleNestedChange('bankDetails', 'bankAccountNumber', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>IFSC Code</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="IFSC code"
                                                value={formData.bankDetails.ifscCode}
                                                onChange={(e) => handleNestedChange('bankDetails', 'ifscCode', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Payee Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Payee name"
                                                value={formData.bankDetails.payeeName}
                                                onChange={(e) => handleNestedChange('bankDetails', 'payeeName', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>
                        
                        {/* Inventory Entries */}
                        <Accordion.Item eventKey="5">
                            <Accordion.Header>
                                <i className="mdi mdi-package-variant me-2"></i>
                                Inventory Entries
                                {formData.inventoryEntries.length > 0 && (
                                    <Badge bg="info" className="ms-2">{formData.inventoryEntries.length} Items</Badge>
                                )}
                            </Accordion.Header>
                            <Accordion.Body>
                                {formData.inventoryEntries.map((entry, index) => (
                                    <Card key={index} className="mb-2">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between mb-2">
                                                <h6>Item {index + 1}</h6>
                                                {modalMode !== 'view' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="danger"
                                                        onClick={() => removeInventoryEntry(index)}
                                                    >
                                                        <i className="mdi mdi-delete"></i>
                                                    </Button>
                                                )}
                                            </div>
                                            <Row>
                                                <Col md={4}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Stock Item Name</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Item name"
                                                            value={entry.stockItemName}
                                                            onChange={(e) => updateInventoryEntry(index, 'stockItemName', e.target.value)}
                                                            disabled={modalMode === 'view'}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Quantity</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            placeholder="0"
                                                            value={entry.quantity}
                                                            onChange={(e) => updateInventoryEntry(index, 'quantity', e.target.value)}
                                                            disabled={modalMode === 'view'}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Unit</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="PCS/KG"
                                                            value={entry.unit}
                                                            onChange={(e) => updateInventoryEntry(index, 'unit', e.target.value)}
                                                            disabled={modalMode === 'view'}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Rate</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="0.00"
                                                            value={entry.rate}
                                                            onChange={(e) => updateInventoryEntry(index, 'rate', e.target.value)}
                                                            disabled={modalMode === 'view'}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Amount</Form.Label>
                                                        <Form.Control
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="0.00"
                                                            value={entry.amount}
                                                            onChange={(e) => updateInventoryEntry(index, 'amount', e.target.value)}
                                                            disabled={modalMode === 'view'}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                ))}
                                {modalMode !== 'view' && (
                                    <Button variant="outline-primary" size="sm" onClick={addInventoryEntry}>
                                        <i className="mdi mdi-plus-circle me-1"></i>
                                        Add Inventory Item
                                    </Button>
                                )}
                            </Accordion.Body>
                        </Accordion.Item>
                        
                        {/* Ledger Entries */}
                        <Accordion.Item eventKey="6">
                            <Accordion.Header>
                                <i className="mdi mdi-book-open-page-variant me-2"></i>
                                Ledger Entries
                                {formData.ledgerEntries.length > 0 && (
                                    <Badge bg="info" className="ms-2">{formData.ledgerEntries.length} Entries</Badge>
                                )}
                            </Accordion.Header>
                            <Accordion.Body>
                                {formData.ledgerEntries.map((entry, index) => (
                                    <Card key={index} className="mb-2">
                                        <Card.Body>
                                            <div className="d-flex justify-content-between mb-2">
                                                <h6>Entry {index + 1}</h6>
                                                {modalMode !== 'view' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="danger"
                                                        onClick={() => removeLedgerEntry(index)}
                                                    >
                                                        <i className="mdi mdi-delete"></i>
                                                    </Button>
                                                )}
                                            </div>
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Ledger Name</Form.Label>
                                                        <Form.Control
                                                            type="text"
                                                            placeholder="Ledger name"
                                                            value={entry.ledgerName}
                                                            onChange={(e) => updateLedgerEntry(index, 'ledgerName', e.target.value)}
                                                            disabled={modalMode === 'view'}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={4}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Amount</Form.Label>
                                                        <InputGroup>
                                                            <InputGroup.Text>₹</InputGroup.Text>
                                                            <Form.Control
                                                                type="number"
                                                                step="0.01"
                                                                placeholder="0.00"
                                                                value={entry.amount}
                                                                onChange={(e) => updateLedgerEntry(index, 'amount', e.target.value)}
                                                                disabled={modalMode === 'view'}
                                                            />
                                                        </InputGroup>
                                                    </Form.Group>
                                                </Col>
                                                <Col md={2}>
                                                    <Form.Group className="mb-2">
                                                        <Form.Label>Type</Form.Label>
                                                        <Form.Select
                                                            value={entry.isDebit ? 'Debit' : 'Credit'}
                                                            onChange={(e) => updateLedgerEntry(index, 'isDebit', e.target.value === 'Debit')}
                                                            disabled={modalMode === 'view'}
                                                        >
                                                            <option value="Debit">Debit</option>
                                                            <option value="Credit">Credit</option>
                                                        </Form.Select>
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                        </Card.Body>
                                    </Card>
                                ))}
                                {modalMode !== 'view' && (
                                    <Button variant="outline-primary" size="sm" onClick={addLedgerEntry}>
                                        <i className="mdi mdi-plus-circle me-1"></i>
                                        Add Ledger Entry
                                    </Button>
                                )}
                            </Accordion.Body>
                        </Accordion.Item>
                        
                        {/* Master IDs & Technical Details */}
                        <Accordion.Item eventKey="7">
                            <Accordion.Header>
                                <i className="mdi mdi-cog-outline me-2"></i>
                                Technical Details (Optional)
                            </Accordion.Header>
                            <Accordion.Body>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>GUID</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="GUID"
                                                value={formData.guid}
                                                onChange={(e) => handleFormChange('guid', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Master ID</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Master ID"
                                                value={formData.masterId}
                                                onChange={(e) => handleFormChange('masterId', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Alter ID</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Alter ID"
                                                value={formData.alterid}
                                                onChange={(e) => handleFormChange('alterid', e.target.value)}
                                                disabled={modalMode === 'view'}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        {modalMode === 'view' ? 'Close' : 'Cancel'}
                    </Button>
                    {modalMode !== 'view' && (
                        <Button variant="primary" onClick={handleSave} disabled={saving}>
                            {saving ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <i className="mdi mdi-content-save me-1"></i>
                                    {modalMode === 'create' ? 'Create Voucher' : 'Update Voucher'}
                                </>
                            )}
                        </Button>
                    )}
                </Modal.Footer>
            </Modal>
            
            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="mdi mdi-alert me-2 text-danger"></i>
                        Confirm Delete
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {voucherToDelete && (
                        <>
                            <p>Are you sure you want to delete this voucher?</p>
                            <Alert variant="warning">
                                <strong>Voucher Number:</strong> {voucherToDelete.voucherNumber}<br />
                                <strong>Date:</strong> {moment(voucherToDelete.date).format('DD/MM/YYYY')}<br />
                                <strong>Type:</strong> {voucherToDelete.voucherType}<br />
                                <strong>Amount:</strong> ₹{voucherToDelete.amount?.toLocaleString()}
                            </Alert>
                            <p className="text-danger mb-0">
                                <i className="mdi mdi-alert-circle-outline me-1"></i>
                                This action cannot be undone.
                            </p>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete} disabled={saving}>
                        {saving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-1"></span>
                                Deleting...
                            </>
                        ) : (
                            <>
                                <i className="mdi mdi-delete me-1"></i>
                                Delete Voucher
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default ManualVoucherUpload;
