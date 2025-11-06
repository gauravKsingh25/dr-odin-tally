import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card, Table, Badge, Button, Breadcrumb, Form, Modal } from 'react-bootstrap';
import './employeeInfo.css';
import Edit from './Model/edit';
import MainLoader from '../../../components/MainLoader';
import ThemeToggle from '../../../components/ThemeToggle';
import { APICore } from '../../../helpers/api/apiCore';

const api = new APICore();

const LabelValue = ({ label, value }) => (
    <div className="label-value-item">
        <span className="text-muted">{label}</span>
        <span className="fw-semibold">{value || '—'}</span>
    </div>
);

const EmployeeInfo = () => {
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [showEdit, setShowEdit] = useState(false);
    const [error, setError] = useState('');
    const [related, setRelated] = useState({ vouchers: [], ledgers: [], loading: false, error: '' });
    const [expandedVouchers, setExpandedVouchers] = useState({});
    const [expandedLedgers, setExpandedLedgers] = useState({});
    const [voucherDateFilter, setVoucherDateFilter] = useState({ fromDate: '', toDate: '', quickRange: '' });
    const [voucherFilters, setVoucherFilters] = useState({
        voucherType: 'all', // all, Sales, Purchase, Payment, Receipt, Journal, Contra
        ownerType: 'all', // all, self, subordinate
        searchTerm: ''
    });
    const [voucherStats, setVoucherStats] = useState({ total: 0, self: 0, subordinate: 0 });
    const [showPartiesModal, setShowPartiesModal] = useState(false);
    const [partiesSearchTerm, setPartiesSearchTerm] = useState('');
    const [editingParties, setEditingParties] = useState(false);
    const [newPartyName, setNewPartyName] = useState('');
    const [partiesToDelete, setPartiesToDelete] = useState([]);
    const [savingParties, setSavingParties] = useState(false);
    const [localParties, setLocalParties] = useState([]);

    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                const res = await api.get('empinfo/' + id);
                if (mounted) {
                    console.log('Employee Detail API Response:', res.data.response);
                    console.log('Employee parties:', res.data.response?.employee?.party);
                    console.log('Invoices count:', res.data.response?.invoices?.length || 0);
                    setData(res.data.response);
                }
            } catch (e) {
                if (mounted) setError(typeof e === 'string' ? e : 'Failed to load employee');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchData();
        return () => {
            mounted = false;
        };
    }, [id]);

    useEffect(() => {
        const fetchRelated = async () => {
            // Use the invoices data from the employee detail API response instead of making separate calls
            if (data?.invoices) {
                console.log(`Using invoices from employee detail API: ${data.invoices.length} invoices`);
                setRelated({ 
                    vouchers: data.invoices, 
                    ledgers: [], // We can fetch ledgers separately if needed
                    loading: false, 
                    error: '' 
                });
                
                // Set voucher stats if available
                if (data?.voucherStats) {
                    setVoucherStats(data.voucherStats);
                }
                return;
            }
            
            // Fallback to the old method if no invoices in response
            if (!data?.employee?.empName) return;
            setRelated((s) => ({ ...s, loading: true, error: '' }));
            try {
                const [vResp, lResp] = await Promise.all([
                    api.get('tally/vouchers/by-employee', { name: data.employee.empName, empId: data.employee.empId, limit: 1000 }),
                    api.get('tally/ledgers/by-employee', { name: data.employee.empName, empId: data.employee.empId, limit: 10 }),
                ]);
                let vouchers = vResp?.data?.data?.vouchers || [];
                const ledgers = lResp?.data?.data?.ledgers || [];
                // Filter vouchers by employee's party list if present
                const parties = Array.isArray(data.employee.party) ? data.employee.party : [];
                if (parties.length > 0) {
                    console.log(`Filtering ${vouchers.length} vouchers by ${parties.length} parties`);
                    vouchers = vouchers.filter(v => {
                        const matchesParty = v.party && parties.includes(v.party);
                        const matchesPartyledger = v.partyledgername && parties.includes(v.partyledgername);
                        return matchesParty || matchesPartyledger;
                    });
                    console.log(`After filtering: ${vouchers.length} vouchers`);
                }
                setRelated({ vouchers, ledgers, loading: false, error: '' });
            } catch (e) {
                console.error('Error fetching related data:', e);
                setRelated({ vouchers: [], ledgers: [], loading: false, error: 'Failed to load related invoices/ledgers' });
            }
        };
        fetchRelated();
    }, [data?.employee?.empName, data?.employee?.party, data?.employee?.empId, data?.invoices, data?.voucherStats]);

    // Handle voucher date filtering
    const handleVoucherQuickDateRange = (range) => {
        console.log('Quick date range selected:', range);
        const today = new Date();
        let startDate = new Date();
        let endDate = new Date();

        switch (range) {
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
                console.log('Unknown range:', range);
                return;
        }

        const formatDate = (date) => date.toISOString().split('T')[0];
        const newFilter = {
            fromDate: formatDate(startDate),
            toDate: formatDate(endDate),
            quickRange: range
        };
        
        console.log('Setting date filter:', newFilter);
        setVoucherDateFilter(newFilter);
    };

    const handleVoucherDateReset = () => {
        setVoucherDateFilter({ fromDate: '', toDate: '', quickRange: '' });
    };

    const employee = data?.employee || {};
    const reportingManager = data?.reportingManager;
    const directReportsCount = data?.directReportsCount || 0;
    const directReports = data?.directReports || [];
    const allSubordinates = data?.allSubordinates || [];
    const allPartiesFromAPI = data?.parties || [];

    // Initialize local parties when employee data changes
    useEffect(() => {
        if (Array.isArray(employee?.party)) {
            setLocalParties([...employee.party]);
        } else {
            setLocalParties([]);
        }
    }, [employee?.party]);

    // CRUD handlers for parties
    const handleAddParty = () => {
        if (!newPartyName.trim()) {
            alert('Please enter a party name');
            return;
        }
        
        // Check for duplicates
        if (localParties.some(p => p.toLowerCase() === newPartyName.trim().toLowerCase())) {
            alert('This party already exists');
            return;
        }
        
        setLocalParties([...localParties, newPartyName.trim()]);
        setNewPartyName('');
    };

    const handleDeleteParty = (partyToDelete) => {
        if (window.confirm(`Are you sure you want to remove "${partyToDelete}"?`)) {
            setLocalParties(localParties.filter(p => p !== partyToDelete));
            setPartiesToDelete([...partiesToDelete, partyToDelete]);
        }
    };

    const handleSaveParties = async () => {
        try {
            setSavingParties(true);
            
            // Call API to update employee parties
            const response = await api.update(`empinfo/update/${employee._id}`, {
                employId: employee._id,
                empId: employee.empId,
                empName: employee.empName,
                designation: employee.designation?._id || employee.designation,
                doj: employee.doj,
                status: employee.status,
                mnthtarget: employee.mnthtarget || 0,
                yrlytarget: employee.yrlytarget || 0,
                empLeftDate: employee.empLeftDate,
                companyId: employee.companyid,
                state: employee.state?._id || employee.state,
                city: employee.city?._id || employee.city,
                zoneId: employee.zoneId?._id || employee.zoneId,
                rmId: employee.rmId?._id || employee.rmId,
                party: localParties // Updated parties array
            });
            
            if (response.data.status === 200) {
                // Update local employee data
                setData(prevData => ({
                    ...prevData,
                    employee: {
                        ...prevData.employee,
                        party: localParties
                    }
                }));
                
                // Refresh vouchers data to reflect new parties
                await refreshVouchersData();
                
                alert('Parties updated successfully! Vouchers have been refreshed.');
                setEditingParties(false);
                setPartiesToDelete([]);
            } else {
                throw new Error(response.data.message || 'Failed to update parties');
            }
        } catch (error) {
            console.error('Error saving parties:', error);
            alert('Failed to save parties: ' + (error.response?.data?.message || error.message));
        } finally {
            setSavingParties(false);
        }
    };

    const handleCancelEdit = () => {
        setLocalParties(Array.isArray(employee?.party) ? [...employee.party] : []);
        setNewPartyName('');
        setPartiesToDelete([]);
        setEditingParties(false);
    };

    const refreshVouchersData = async () => {
        try {
            // Re-fetch employee details to get updated vouchers
            const res = await api.get('empinfo/' + id);
            if (res.data.response) {
                setData(res.data.response);
                
                // Update related vouchers
                if (res.data.response.invoices) {
                    setRelated(prev => ({
                        ...prev,
                        vouchers: res.data.response.invoices
                    }));
                    
                    if (res.data.response.voucherStats) {
                        setVoucherStats(res.data.response.voucherStats);
                    }
                }
            }
        } catch (error) {
            console.error('Error refreshing vouchers:', error);
        }
    };

    const breadCrumbItems = [
        { label: 'Staff Management', path: '/staffmanagment' },
        { label: employee?.empName || 'Employee', path: '#', active: true },
    ];

    // Filter vouchers based on date range, voucher type, owner type, and search term
    const filteredVouchers = related.vouchers.filter(v => {
        // Date filter
        if (voucherDateFilter.fromDate || voucherDateFilter.toDate) {
            if (!v.date) return false; // Skip vouchers without dates
            
            // Normalize dates to midnight for accurate comparison
            const voucherDate = new Date(v.date);
            voucherDate.setHours(0, 0, 0, 0);
            
            const fromDate = voucherDateFilter.fromDate ? new Date(voucherDateFilter.fromDate) : null;
            const toDate = voucherDateFilter.toDate ? new Date(voucherDateFilter.toDate) : null;
            
            if (fromDate) fromDate.setHours(0, 0, 0, 0);
            if (toDate) toDate.setHours(23, 59, 59, 999); // End of day
            
            if (fromDate && toDate) {
                if (voucherDate < fromDate || voucherDate > toDate) return false;
            } else if (fromDate) {
                if (voucherDate < fromDate) return false;
            } else if (toDate) {
                if (voucherDate > toDate) return false;
            }
        }
        
        // Voucher type filter
        if (voucherFilters.voucherType !== 'all') {
            if (v.voucherType !== voucherFilters.voucherType) return false;
        }
        
        // Owner type filter (self vs subordinate)
        if (voucherFilters.ownerType !== 'all') {
            if (v.voucherOwnerType !== voucherFilters.ownerType) return false;
        }
        
        // Search term filter (search in voucher number, party name, reference, narration)
        if (voucherFilters.searchTerm && voucherFilters.searchTerm.trim() !== '') {
            const searchLower = voucherFilters.searchTerm.toLowerCase();
            const matchesVoucherNumber = v.voucherNumber?.toLowerCase().includes(searchLower);
            const matchesParty = (v.party || v.partyledgername || '')?.toLowerCase().includes(searchLower);
            const matchesReference = v.reference?.toLowerCase().includes(searchLower);
            const matchesNarration = v.narration?.toLowerCase().includes(searchLower);
            
            if (!matchesVoucherNumber && !matchesParty && !matchesReference && !matchesNarration) {
                return false;
            }
        }
        
        return true;
    });

    // Calculate total sales from filtered vouchers with proper debit/credit handling
    const salesCalculation = filteredVouchers.reduce((acc, v) => {
        const amount = typeof v.amount === 'number' ? v.amount : 0;
        const displayAmount = Math.abs(amount);
        
        // Count different types of transactions
        if (v.voucherType === 'Sales') {
            if (amount >= 0) {
                acc.totalSales += displayAmount;
                acc.salesCount += 1;
            } else {
                acc.salesReturns += displayAmount;
                acc.returnsCount += 1;
            }
        } else if (v.voucherType === 'Purchase') {
            if (amount >= 0) {
                acc.totalExpenses += displayAmount;
                acc.expensesCount += 1;
            }
        } else if (v.voucherType === 'Payment') {
            acc.totalPayments += displayAmount;
            acc.paymentsCount += 1;
        } else if (v.voucherType === 'Receipt') {
            acc.totalReceipts += displayAmount;
            acc.receiptsCount += 1;
        }
        
        return acc;
    }, {
        totalSales: 0,
        totalExpenses: 0,
        totalPayments: 0,
        totalReceipts: 0,
        salesReturns: 0,
        salesCount: 0,
        expensesCount: 0,
        paymentsCount: 0,
        receiptsCount: 0,
        returnsCount: 0
    });
    
    const kpis = [
        { label: 'Monthly Target', value: employee?.mnthtarget },
        { label: 'Yearly Target', value: employee?.yrlytarget },
        { label: 'Total Sales', value: salesCalculation.totalSales ? `₹${salesCalculation.totalSales.toLocaleString('en-IN')}` : '—' },
        { label: 'Expenses', value: salesCalculation.totalExpenses ? `₹${salesCalculation.totalExpenses.toLocaleString('en-IN')}` : '—' },
        { label: 'Total Transactions', value: related.vouchers.length || '—' },
    ];

    return (
        <Row>
            <Col>
                <div className="employee-info-page">
                    <div className="page-title-box">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h4 className="page-title">Employee Details</h4>
                                <div className="page-title-right">
                                    <Breadcrumb listProps={{ className: 'm-0' }}>
                                        <Breadcrumb.Item href="/">Dr. Odin</Breadcrumb.Item>
                                        {breadCrumbItems.map((item, index) => (
                                            item.active ? (
                                                <Breadcrumb.Item active key={index}>
                                                    {item.label}
                                                </Breadcrumb.Item>
                                            ) : (
                                                <Breadcrumb.Item key={index} href={item.path}>
                                                    {item.label}
                                                </Breadcrumb.Item>
                                            )
                                        ))}
                                    </Breadcrumb>
                                </div>
                            </div>
                            <ThemeToggle showText={true} />
                        </div>
                    </div>
                    <div className="employee-info-container">
                    {loading && <MainLoader />}
                    {error && !loading && (
                        <div className="alert alert-danger" role="alert">{error}</div>
                    )}
                    <div className="d-flex justify-content-end mb-3 gap-2 employee-actions">
                        <Button variant="primary" onClick={() => setShowEdit(true)}>
                            <i className="mdi mdi-square-edit-outline me-2"></i>
                            Edit Employee
                        </Button>
                        <Button variant="outline-secondary" onClick={() => {}}>
                            <i className="mdi mdi-target me-2"></i>
                            View Targets
                        </Button>
                        <Button variant="outline-secondary" onClick={() => {}}>
                            <i className="mdi mdi-chart-line me-2"></i>
                            Performance
                        </Button>
                    </div>
                    <Card className="unified-panel">
                        <Card.Body>
                            <Row className="g-3 mb-2 kpi-grid">
                                {kpis.map((k) => (
                                    <Col key={k.label} md={6} lg={2}>
                                        <Card className="kpi-card h-100 panel-box">
                                            <Card.Body className="py-2">
                                                <div className="text-muted small">{k.label}</div>
                                                <div className="fw-bold">{k.value ?? '—'}</div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                            <Row className="g-3 align-items-stretch">
                                <Col lg={4} className="d-flex">
                                    <Card className="w-100 h-100 panel-box">
                                        <Card.Body>
                                            <h4 className="mb-3">Employee Info</h4>
                                            <LabelValue label="Employee ID" value={employee?.empId} />
                                            <LabelValue label="Name" value={employee?.empName} />
                                            <LabelValue label="Designation" value={employee?.designation?.designation} />
                                            <LabelValue label="Zone" value={employee?.zoneId?.zone} />
                                            <LabelValue label="State" value={employee?.state?.state} />
                                            <LabelValue label="City" value={employee?.city?.city} />
                                            <LabelValue label="Date of Joining" value={employee?.doj} />
                                            <LabelValue label="Status" value={employee?.status ? 'Active' : 'Left'} />
                                            <LabelValue label="Monthly Target" value={employee?.mnthtarget} />
                                            <LabelValue label="Yearly Target" value={employee?.yrlytarget} />
                                            <div className="label-value-item">
                                                <span className="text-muted">Responsible Parties</span>
                                                <span className="fw-semibold">
                                                    {Array.isArray(employee?.party) && employee.party.length > 0 
                                                        ? `${employee.party.length} parties` 
                                                        : '—'
                                                    }
                                                </span>
                                            </div>
                                            {Array.isArray(employee?.party) && employee.party.length > 0 && (
                                                <div className="mt-2">
                                                    <div className="text-muted small mb-1">Sample Parties:</div>
                                                    <div className="small">
                                                        {employee.party.slice(0, 3).map((party, index) => (
                                                            <div key={index} className="text-truncate" style={{ maxWidth: '250px' }}>
                                                                {index + 1}. {party}
                                                            </div>
                                                        ))}
                                                        {employee.party.length > 3 && (
                                                            <div className="mt-2">
                                                                <Button 
                                                                    variant="outline-primary" 
                                                                    size="sm"
                                                                    onClick={() => setShowPartiesModal(true)}
                                                                >
                                                                    <i className="mdi mdi-eye me-1"></i>
                                                                    Show All ({employee.party.length} parties)
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col lg={4} className="d-flex">
                                    <Card className="w-100 h-100 panel-box">
                                        <Card.Body>
                                            <h4 className="mb-3">Reporting</h4>
                                            <div className="mb-2">
                                                <div className="text-muted">Reporting Manager</div>
                                                <div className="fw-semibold">
                                                    {reportingManager ? `${reportingManager.empName} (${reportingManager?.designation?.designation || ''})` : '—'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-muted">Direct Reports</div>
                                                <div className="fw-semibold d-flex align-items-center gap-2">
                                                    <Badge bg="primary" className="me-2">{directReportsCount}</Badge>
                                                    people
                                                </div>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                                <Col lg={4} className="d-flex">
                                    <Card className="w-100 h-100 panel-box">
                                        <Card.Body className="d-flex flex-column">
                                            <h4 className="mb-3">Team</h4>
                                            <div className="table-responsive flex-grow-1">
                                                <Table className="mb-0 table-centered">
                                                    <thead>
                                                        <tr className="table-head text-white">
                                                            <th>Name</th>
                                                            <th>Designation</th>
                                                            <th>Status</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {directReports?.map((e) => (
                                                            <tr key={e._id}>
                                                                <td className="text-truncate">{e.empName}</td>
                                                                <td className="text-truncate">{e?.designation?.designation || '—'}</td>
                                                                <td className="text-truncate">{e.status ? 'Active' : 'Left'}</td>
                                                            </tr>
                                                        ))}
                                                        {!directReports?.length && (
                                                            <tr>
                                                                <td colSpan={3} className="text-center text-muted py-3">No direct reports</td>
                                                            </tr>
                                                        )}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                    <Card className="unified-panel mt-3">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h4 className="mb-0">Related Invoices</h4>
                                <div className="d-flex gap-2">
                                    <Badge bg="primary" pill>Total: {voucherStats.total}</Badge>
                                    <Badge bg="success" pill>Self: {voucherStats.self}</Badge>
                                    <Badge bg="info" pill>Team: {voucherStats.subordinate}</Badge>
                                </div>
                            </div>
                            {related.loading && <MainLoader />}
                            {related.error && !related.loading && (
                                <div className="alert alert-warning" role="alert">{related.error}</div>
                            )}
                            
                            {/* Enhanced Filters for Vouchers */}
                            <Card className="mb-3 bg-light">
                                <Card.Body className="py-2">
                                    <Row className="g-2 align-items-end">
                                        <Col md={3}>
                                            <Form.Group>
                                                <Form.Label className="small fw-semibold mb-1">Search</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    size="sm"
                                                    placeholder="Voucher no., party, reference..."
                                                    value={voucherFilters.searchTerm}
                                                    onChange={(e) => setVoucherFilters(prev => ({...prev, searchTerm: e.target.value}))}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Form.Group>
                                                <Form.Label className="small fw-semibold mb-1">Voucher Type</Form.Label>
                                                <Form.Select
                                                    size="sm"
                                                    value={voucherFilters.voucherType}
                                                    onChange={(e) => setVoucherFilters(prev => ({...prev, voucherType: e.target.value}))}
                                                >
                                                    <option value="all">All Types</option>
                                                    <option value="Sales">Sales</option>
                                                    <option value="Purchase">Purchase</option>
                                                    <option value="Payment">Payment</option>
                                                    <option value="Receipt">Receipt</option>
                                                    <option value="Journal">Journal</option>
                                                    <option value="Contra">Contra</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Form.Group>
                                                <Form.Label className="small fw-semibold mb-1">Owner Type</Form.Label>
                                                <Form.Select
                                                    size="sm"
                                                    value={voucherFilters.ownerType}
                                                    onChange={(e) => setVoucherFilters(prev => ({...prev, ownerType: e.target.value}))}
                                                >
                                                    <option value="all">All (Self + Team)</option>
                                                    <option value="self">Self Only</option>
                                                    <option value="subordinate">Team Only</option>
                                                </Form.Select>
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Form.Group>
                                                <Form.Label className="small fw-semibold mb-1">From Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    size="sm"
                                                    value={voucherDateFilter.fromDate}
                                                    onChange={(e) => setVoucherDateFilter(prev => ({...prev, fromDate: e.target.value, quickRange: ''}))}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={2}>
                                            <Form.Group>
                                                <Form.Label className="small fw-semibold mb-1">To Date</Form.Label>
                                                <Form.Control
                                                    type="date"
                                                    size="sm"
                                                    value={voucherDateFilter.toDate}
                                                    onChange={(e) => setVoucherDateFilter(prev => ({...prev, toDate: e.target.value, quickRange: ''}))}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col md={1} className="text-end">
                                            <Button 
                                                variant="outline-secondary" 
                                                size="sm"
                                                title="Reset all filters"
                                                onClick={() => {
                                                    setVoucherFilters({ voucherType: 'all', ownerType: 'all', searchTerm: '' });
                                                    handleVoucherDateReset();
                                                }}
                                            >
                                                <i className="mdi mdi-refresh"></i>
                                            </Button>
                                        </Col>
                                    </Row>
                                    <Row className="g-2 mt-1">
                                        <Col md={12}>
                                            <Form.Label className="small fw-semibold mb-1">Quick Date Ranges</Form.Label>
                                            <div className="d-flex gap-1 flex-wrap">
                                                {[
                                                    { value: 'thisMonth', label: 'This Month' },
                                                    { value: 'lastMonth', label: 'Last Month' },
                                                    { value: 'thisQuarter', label: 'This Quarter' },
                                                    { value: 'thisYear', label: 'This Year' },
                                                    { value: 'last30days', label: 'Last 30 Days' },
                                                    { value: 'last90days', label: 'Last 90 Days' }
                                                ].map(range => (
                                                    <Button
                                                        key={range.value}
                                                        variant={voucherDateFilter.quickRange === range.value ? 'primary' : 'outline-primary'}
                                                        size="sm"
                                                        onClick={() => handleVoucherQuickDateRange(range.value)}
                                                    >
                                                        {range.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </Col>
                                    </Row>
                                </Card.Body>
                            </Card>
                            
                            {/* Active Filters Info */}
                            {(voucherDateFilter.fromDate || voucherDateFilter.toDate || voucherFilters.voucherType !== 'all' || voucherFilters.ownerType !== 'all' || voucherFilters.searchTerm) && (
                                <div className="alert alert-info py-2 mb-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div>
                                            <i className="mdi mdi-filter me-1"></i>
                                            <strong>Active Filters:</strong>
                                            {voucherDateFilter.fromDate && (
                                                <Badge bg="primary" className="ms-2">
                                                    From: {new Date(voucherDateFilter.fromDate).toLocaleDateString('en-IN')}
                                                </Badge>
                                            )}
                                            {voucherDateFilter.toDate && (
                                                <Badge bg="primary" className="ms-2">
                                                    To: {new Date(voucherDateFilter.toDate).toLocaleDateString('en-IN')}
                                                </Badge>
                                            )}
                                            {voucherFilters.voucherType !== 'all' && (
                                                <Badge bg="success" className="ms-2">
                                                    Type: {voucherFilters.voucherType}
                                                </Badge>
                                            )}
                                            {voucherFilters.ownerType !== 'all' && (
                                                <Badge bg="info" className="ms-2">
                                                    Owner: {voucherFilters.ownerType === 'self' ? 'Self' : 'Team'}
                                                </Badge>
                                            )}
                                            {voucherFilters.searchTerm && (
                                                <Badge bg="warning" className="ms-2">
                                                    Search: "{voucherFilters.searchTerm}"
                                                </Badge>
                                            )}
                                        </div>
                                        <Button 
                                            variant="outline-danger" 
                                            size="sm"
                                            onClick={() => {
                                                setVoucherFilters({ voucherType: 'all', ownerType: 'all', searchTerm: '' });
                                                handleVoucherDateReset();
                                            }}
                                        >
                                            Clear All Filters
                                        </Button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Transaction Summary */}
                            {filteredVouchers.length > 0 && (
                                <>
                                    <div className="mb-2 d-flex justify-content-between align-items-center">
                                        <h6 className="text-muted mb-0">
                                            <i className="mdi mdi-chart-box-outline me-1"></i>
                                            Filtered Results Summary
                                        </h6>
                                        <small className="text-muted">
                                            Showing {filteredVouchers.length} of {related.vouchers.length} vouchers
                                        </small>
                                    </div>
                                    <Row className="mb-3">
                                        <Col md={3}>
                                            <Card className="bg-light border-success">
                                                <Card.Body className="py-2 text-center">
                                                    <div className="text-success h5 mb-1">₹{salesCalculation.totalSales.toLocaleString('en-IN')}</div>
                                                    <div className="small text-muted">Sales ({salesCalculation.salesCount})</div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={3}>
                                            <Card className="bg-light border-danger">
                                                <Card.Body className="py-2 text-center">
                                                    <div className="text-danger h5 mb-1">₹{salesCalculation.salesReturns.toLocaleString('en-IN')}</div>
                                                    <div className="small text-muted">Returns ({salesCalculation.returnsCount})</div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={3}>
                                            <Card className="bg-light border-warning">
                                                <Card.Body className="py-2 text-center">
                                                    <div className="text-warning h5 mb-1">₹{salesCalculation.totalExpenses.toLocaleString('en-IN')}</div>
                                                    <div className="small text-muted">Expenses ({salesCalculation.expensesCount})</div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                        <Col md={3}>
                                            <Card className="bg-light border-info">
                                                <Card.Body className="py-2 text-center">
                                                    <div className="text-info h5 mb-1">{filteredVouchers.length}</div>
                                                    <div className="small text-muted">Total Transactions</div>
                                                </Card.Body>
                                            </Card>
                                        </Col>
                                    </Row>
                                </>
                            )}
                            
                            <div className="table-responsive">
                                <Table className="mb-0 table-centered">
                                    <thead>
                                        <tr className="table-head text-white">
                                            <th style={{width: 36}}></th>
                                            <th>Date</th>
                                            <th>Voucher No.</th>
                                            <th>Type</th>
                                            <th>Owner</th>
                                            <th>Party</th>
                                            <th>Dr/Cr</th>
                                            <th>Amount</th>
                                            <th>Narration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredVouchers.map((v) => (
                                            <>
                                                <tr 
                                                    key={v._id} 
                                                    onClick={() => setExpandedVouchers((s) => ({ ...s, [v._id]: !s[v._id] }))} 
                                                    style={{ cursor: 'pointer' }}
                                                    className={v.voucherOwnerType === 'subordinate' ? 'table-light' : ''}
                                                >
                                                    <td className="text-center align-middle">
                                                        <i className={`mdi ${expandedVouchers[v._id] ? 'mdi-chevron-down' : 'mdi-chevron-right'}`}></i>
                                                    </td>
                                                    <td>{v.date ? new Date(v.date).toLocaleDateString() : '—'}</td>
                                                    <td>{v.voucherNumber}</td>
                                                    <td>
                                                        <span className={`badge ${v.voucherType === 'Sales' ? 'bg-success' : v.voucherType === 'Purchase' ? 'bg-warning' : 'bg-info'}`}>
                                                            {v.voucherType}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {v.voucherOwnerType === 'self' ? (
                                                            <Badge bg="success" pill title="Own voucher">
                                                                <i className="mdi mdi-account"></i> Self
                                                            </Badge>
                                                        ) : (
                                                            <Badge 
                                                                bg="info" 
                                                                pill 
                                                                title={`Subordinate: ${v.subordinateInfo?.empName || 'Unknown'}`}
                                                            >
                                                                <i className="mdi mdi-account-group"></i> Team
                                                            </Badge>
                                                        )}
                                                    </td>
                                                    <td className="text-truncate" style={{ maxWidth: 200 }}>{v.party || v.partyledgername || '—'}</td>
                                                    <td>
                                                        <span className={`badge ${v.debitCreditType === 'Dr' ? 'bg-primary' : 'bg-secondary'}`}>
                                                            {v.debitCreditType || 'Dr'}
                                                        </span>
                                                    </td>
                                                    <td className={v.amount < 0 ? 'text-danger' : ''}>
                                                        ₹{typeof v.displayAmount === 'number' ? v.displayAmount.toLocaleString('en-IN') : Math.abs(v.amount || 0).toLocaleString('en-IN')}
                                                    </td>
                                                    <td className="text-truncate" style={{ maxWidth: 200 }}>{v.narration || '—'}</td>
                                                </tr>
                                                {expandedVouchers[v._id] && (
                                                    <tr>
                                                        <td colSpan={9}>
                                                            <div className="expandable-row-content">
                                                                <div className="d-flex flex-wrap gap-4 mb-3">
                                                                    {v.voucherOwnerType === 'subordinate' && v.subordinateInfo && (
                                                                        <div>
                                                                            <div className="text-muted small mb-1">Team Member</div>
                                                                            <div className="fw-semibold">
                                                                                <Badge bg="info" className="me-2">
                                                                                    <i className="mdi mdi-account-group"></i>
                                                                                </Badge>
                                                                                {v.subordinateInfo.empName}
                                                                                {v.subordinateInfo.designation && (
                                                                                    <small className="text-muted ms-2">
                                                                                        ({v.subordinateInfo.designation})
                                                                                    </small>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div>
                                                                        <div className="text-muted small mb-1">Reference</div>
                                                                        <div className="fw-semibold">{v.reference || '—'}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-muted small mb-1">Party</div>
                                                                        <div className="fw-semibold">{v.party || '—'}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-muted small mb-1">Transaction Type</div>
                                                                        <div className="fw-semibold">
                                                                            <Badge 
                                                                                bg={v.transactionType === 'Income' ? 'success' : 
                                                                                    v.transactionType === 'Expense' ? 'warning' : 
                                                                                    v.transactionType === 'Return' ? 'danger' : 'secondary'}
                                                                            >
                                                                                {v.transactionType || 'Unknown'}
                                                                            </Badge>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <hr />
                                                                <div className="row">
                                                                    <div className="col-md-6">
                                                                        <div className="mb-2 fw-semibold">Ledger Entries</div>
                                                                        <div className="table-responsive">
                                                                            <Table size="sm" className="mb-0">
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th>Ledger</th>
                                                                                        <th className="text-end">Amount</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {(v.ledgerEntries || []).map((le, i) => (
                                                                                        <tr key={i}>
                                                                                            <td className="text-truncate">{le.ledgerName}</td>
                                                                                            <td className="text-end">{typeof le.amount === 'number' ? le.amount.toLocaleString('en-IN') : '—'}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                    {!(v.ledgerEntries || []).length && (
                                                                                        <tr><td colSpan={2} className="text-muted text-center">No ledger entries</td></tr>
                                                                                    )}
                                                                                </tbody>
                                                                            </Table>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <div className="mb-2 fw-semibold">Cost Centres</div>
                                                                        <div className="table-responsive">
                                                                            <Table size="sm" className="mb-0">
                                                                                <thead>
                                                                                    <tr>
                                                                                        <th>Cost Centre</th>
                                                                                        <th className="text-end">Amount</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody>
                                                                                    {(v.costCentreAllocations || []).map((cc, i) => (
                                                                                        <tr key={i}>
                                                                                            <td className="text-truncate">{cc.costCentre}</td>
                                                                                            <td className="text-end">{typeof cc.amount === 'number' ? cc.amount.toLocaleString('en-IN') : '—'}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                    {!(v.costCentreAllocations || []).length && (
                                                                                        <tr><td colSpan={2} className="text-muted text-center">No cost centres</td></tr>
                                                                                    )}
                                                                                </tbody>
                                                                            </Table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <hr />
                                                                <div className="row">
                                                                    <div className="col-md-6">
                                                                        <div className="mb-2 fw-semibold">GST Details</div>
                                                                        <div className="table-responsive">
                                                                            <Table size="sm" className="mb-0">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td>CGST</td>
                                                                                        <td className="text-end">{v.gstDetails?.cgstAmount ?? '—'}</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>SGST</td>
                                                                                        <td className="text-end">{v.gstDetails?.sgstAmount ?? '—'}</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>IGST</td>
                                                                                        <td className="text-end">{v.gstDetails?.igstAmount ?? '—'}</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>Total Tax</td>
                                                                                        <td className="text-end">{v.gstDetails?.totalTaxAmount ?? '—'}</td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </Table>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <div className="mb-2 fw-semibold">Bank Details</div>
                                                                        <div className="table-responsive">
                                                                            <Table size="sm" className="mb-0">
                                                                                <tbody>
                                                                                    <tr>
                                                                                        <td>Type</td>
                                                                                        <td className="text-end">{v.bankDetails?.transactionType || '—'}</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>Instrument No.</td>
                                                                                        <td className="text-end">{v.bankDetails?.instrumentNumber || '—'}</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>Bank</td>
                                                                                        <td className="text-end">{v.bankDetails?.bankName || '—'}</td>
                                                                                    </tr>
                                                                                    <tr>
                                                                                        <td>Txn ID</td>
                                                                                        <td className="text-end">{v.bankDetails?.transactionId || '—'}</td>
                                                                                    </tr>
                                                                                </tbody>
                                                                            </Table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))}
                                        {!filteredVouchers.length && !related.loading && (
                                            <tr>
                                                <td colSpan={9} className="text-center text-muted py-3">
                                                    {related.vouchers.length > 0 ? (
                                                        <>
                                                            <i className="mdi mdi-filter-remove-outline mdi-24px d-block mb-2"></i>
                                                            No vouchers match the current filters. Try adjusting your filters.
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className="mdi mdi-file-document-outline mdi-24px d-block mb-2"></i>
                                                            No related invoices found
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                    <Card className="unified-panel mt-3">
                        <Card.Body>
                            <h4 className="mb-3">Related Ledgers</h4>
                            {related.loading && <MainLoader />}
                            {related.error && !related.loading && (
                                <div className="alert alert-warning" role="alert">{related.error}</div>
                            )}
                            <div className="table-responsive">
                                <Table className="mb-0 table-centered">
                                    <thead>
                                        <tr className="table-head text-white">
                                            <th style={{width: 36}}></th>
                                            <th>Name</th>
                                            <th>Group</th>
                                            <th>Contact</th>
                                            <th>Closing Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {related.ledgers.map((l) => (
                                            <>
                                                <tr key={l._id} onClick={() => setExpandedLedgers((s) => ({ ...s, [l._id]: !s[l._id] }))} style={{ cursor: 'pointer' }}>
                                                    <td className="text-center align-middle">
                                                        <i className={`mdi ${expandedLedgers[l._id] ? 'mdi-chevron-down' : 'mdi-chevron-right'}`}></i>
                                                    </td>
                                                    <td className="text-truncate">{l.name}</td>
                                                    <td className="text-truncate">{l.parent || '—'}</td>
                                                    <td className="text-truncate">{l.contactPerson || '—'}</td>
                                                    <td>{typeof l.closingBalance === 'number' ? l.closingBalance.toLocaleString('en-IN') : '—'}</td>
                                                </tr>
                                                {expandedLedgers[l._id] && (
                                                    <tr>
                                                        <td colSpan={4}>
                                                            <div className="expandable-row-content">
                                                                <div className="d-flex flex-wrap gap-4 mb-3">
                                                                    <div>
                                                                        <div className="text-muted small mb-1">Alias</div>
                                                                        <div className="fw-semibold">{l.aliasName || '—'}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-muted small mb-1">Reserved</div>
                                                                        <div className="fw-semibold">{l.reservedName || '—'}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-muted small mb-1">Opening Balance</div>
                                                                        <div className="fw-semibold">{typeof l.openingBalance === 'number' ? l.openingBalance.toLocaleString('en-IN') : '—'}</div>
                                                                    </div>
                                                                </div>
                                                                <hr />
                                                                <div className="row">
                                                                    <div className="col-md-6">
                                                                        <div className="mb-2 fw-semibold">Contact & Bank</div>
                                                                        <div className="table-responsive">
                                                                            <Table size="sm" className="mb-0">
                                                                                <tbody>
                                                                                    <tr><td>Phone</td><td className="text-end">{l.ledgerPhone || '—'}</td></tr>
                                                                                    <tr><td>Email</td><td className="text-end">{l.email || '—'}</td></tr>
                                                                                    <tr><td>Website</td><td className="text-end">{l.website || '—'}</td></tr>
                                                                                    <tr><td>Bank</td><td className="text-end">{l.bankDetails?.bankName || '—'}</td></tr>
                                                                                    <tr><td>Account</td><td className="text-end">{l.bankDetails?.accountNumber || '—'}</td></tr>
                                                                                </tbody>
                                                                            </Table>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <div className="mb-2 fw-semibold">Tax & Credit</div>
                                                                        <div className="table-responsive">
                                                                            <Table size="sm" className="mb-0">
                                                                                <tbody>
                                                                                    <tr><td>GSTIN</td><td className="text-end">{l.gstin || '—'}</td></tr>
                                                                                    <tr><td>Duty Head</td><td className="text-end">{l.gstdutyhead || '—'}</td></tr>
                                                                                    <tr><td>Credit Period</td><td className="text-end">{l.creditPeriod ?? '—'}</td></tr>
                                                                                    <tr><td>Credit Limit</td><td className="text-end">{typeof l.creditLimit === 'number' ? l.creditLimit.toLocaleString('en-IN') : '—'}</td></tr>
                                                                                </tbody>
                                                                            </Table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <hr />
                                                                <div className="row">
                                                                    <div className="col-md-6">
                                                                        <div className="mb-2 fw-semibold">Bills</div>
                                                                        <div className="table-responsive">
                                                                            <Table size="sm" className="mb-0">
                                                                                <thead><tr><th>Bill</th><th className="text-end">Amount</th></tr></thead>
                                                                                <tbody>
                                                                                    {(l.billWiseDetails || []).map((b, i) => (
                                                                                        <tr key={i}><td>{b.billName}</td><td className="text-end">{typeof b.billAmount === 'number' ? b.billAmount.toLocaleString('en-IN') : '—'}</td></tr>
                                                                                    ))}
                                                                                    {!(l.billWiseDetails || []).length && (
                                                                                        <tr><td colSpan={2} className="text-muted text-center">No bills</td></tr>
                                                                                    )}
                                                                                </tbody>
                                                                            </Table>
                                                                        </div>
                                                                    </div>
                                                                    <div className="col-md-6">
                                                                        <div className="mb-2 fw-semibold">Cost Centres</div>
                                                                        <div className="table-responsive">
                                                                            <Table size="sm" className="mb-0">
                                                                                <thead><tr><th>Cost Centre</th><th className="text-end">Amount</th></tr></thead>
                                                                                <tbody>
                                                                                    {(l.costCentreAllocations || []).map((c, i) => (
                                                                                        <tr key={i}><td>{c.costCentre}</td><td className="text-end">{typeof c.amount === 'number' ? c.amount.toLocaleString('en-IN') : '—'}</td></tr>
                                                                                    ))}
                                                                                    {!(l.costCentreAllocations || []).length && (
                                                                                        <tr><td colSpan={2} className="text-muted text-center">No cost centres</td></tr>
                                                                                    )}
                                                                                </tbody>
                                                                            </Table>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        ))}
                                        {!related.ledgers.length && !related.loading && (
                                            <tr>
                                                <td colSpan={4} className="text-center text-muted py-3">No related ledgers</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                    </div>
                </div>
            </Col>
            
            {/* Parties Modal with CRUD */}
            <Modal show={showPartiesModal} onHide={() => {
                setShowPartiesModal(false);
                handleCancelEdit();
            }} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="mdi mdi-account-group me-2"></i>
                        Manage Responsible Parties - {employee?.empName}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Edit Mode Toggle and Actions */}
                    <div className="mb-3 d-flex justify-content-between align-items-center">
                        <div>
                            {!editingParties ? (
                                <Button 
                                    variant="primary" 
                                    size="sm"
                                    onClick={() => setEditingParties(true)}
                                >
                                    <i className="mdi mdi-pencil me-1"></i>
                                    Edit Parties
                                </Button>
                            ) : (
                                <div className="d-flex gap-2">
                                    <Button 
                                        variant="success" 
                                        size="sm"
                                        onClick={handleSaveParties}
                                        disabled={savingParties}
                                    >
                                        {savingParties ? (
                                            <><i className="mdi mdi-loading mdi-spin me-1"></i> Saving...</>
                                        ) : (
                                            <><i className="mdi mdi-content-save me-1"></i> Save Changes</>
                                        )}
                                    </Button>
                                    <Button 
                                        variant="secondary" 
                                        size="sm"
                                        onClick={handleCancelEdit}
                                        disabled={savingParties}
                                    >
                                        <i className="mdi mdi-close me-1"></i>
                                        Cancel
                                    </Button>
                                </div>
                            )}
                        </div>
                        <Badge bg="info" pill>
                            {editingParties ? `${localParties.length} parties` : `${employee?.party?.length || 0} parties`}
                        </Badge>
                    </div>

                    {/* Add New Party Section (Only in Edit Mode) */}
                    {editingParties && (
                        <Card className="mb-3 bg-light">
                            <Card.Body className="py-2">
                                <Row className="align-items-end g-2">
                                    <Col md={8}>
                                        <Form.Group>
                                            <Form.Label className="small fw-semibold mb-1">
                                                <i className="mdi mdi-plus-circle me-1"></i>
                                                Add New Party
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="Enter party name..."
                                                value={newPartyName}
                                                onChange={(e) => setNewPartyName(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleAddParty();
                                                    }
                                                }}
                                                disabled={savingParties}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Button 
                                            variant="primary" 
                                            className="w-100"
                                            onClick={handleAddParty}
                                            disabled={!newPartyName.trim() || savingParties}
                                        >
                                            <i className="mdi mdi-plus me-1"></i>
                                            Add Party
                                        </Button>
                                    </Col>
                                </Row>
                            </Card.Body>
                        </Card>
                    )}

                    {/* Search Bar */}
                    <div className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Search parties..."
                            value={partiesSearchTerm}
                            onChange={(e) => setPartiesSearchTerm(e.target.value)}
                            className="mb-2"
                        />
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <small className="text-muted me-3">
                                    {editingParties ? (
                                        <>Editing: {localParties.length} parties</>
                                    ) : (
                                        <>Self Parties: {employee?.party?.length || 0}</>
                                    )}
                                </small>
                                {!editingParties && allPartiesFromAPI.length > (employee?.party?.length || 0) && (
                                    <Badge bg="info" pill>
                                        Total (including team): {allPartiesFromAPI.length}
                                    </Badge>
                                )}
                            </div>
                            <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={() => setPartiesSearchTerm('')}
                                disabled={!partiesSearchTerm}
                            >
                                <i className="mdi mdi-refresh"></i> Clear
                            </Button>
                        </div>
                    </div>
                    
                    <Row>
                        {/* Employee's Own Parties */}
                        <Col md={!editingParties && allSubordinates.length > 0 && allSubordinates.some(s => s.party?.length > 0) ? 6 : 12}>
                            <Card className="mb-3">
                                <Card.Header className={editingParties ? "bg-primary text-white" : "bg-success text-white"}>
                                    <h6 className="mb-0">
                                        <i className={`mdi ${editingParties ? 'mdi-pencil' : 'mdi-account'} me-2`}></i>
                                        {editingParties ? 'Edit Own Parties' : 'Own Parties'} ({editingParties ? localParties.length : (employee?.party?.length || 0)})
                                    </h6>
                                </Card.Header>
                                <Card.Body className="p-0" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                    {(editingParties ? localParties : (employee?.party || [])).length > 0 ? (
                                        <Table striped hover size="sm" className="mb-0">
                                            <thead className="sticky-top bg-white">
                                                <tr>
                                                    <th style={{ width: '50px' }}>#</th>
                                                    <th>Party Name</th>
                                                    {editingParties && <th style={{ width: '80px' }}>Actions</th>}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(editingParties ? localParties : employee.party)
                                                    .filter(party => 
                                                        !partiesSearchTerm || 
                                                        party.toLowerCase().includes(partiesSearchTerm.toLowerCase())
                                                    )
                                                    .map((party, index) => (
                                                        <tr key={index}>
                                                            <td>{index + 1}</td>
                                                            <td>{party}</td>
                                                            {editingParties && (
                                                                <td>
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteParty(party)}
                                                                        disabled={savingParties}
                                                                        title="Delete party"
                                                                    >
                                                                        <i className="mdi mdi-delete"></i>
                                                                    </Button>
                                                                </td>
                                                            )}
                                                        </tr>
                                                    ))
                                                }
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <div className="text-center text-muted py-5">
                                            <i className="mdi mdi-account-off-outline mdi-36px d-block mb-2"></i>
                                            {editingParties ? 'No parties added yet. Add your first party above!' : 'No parties assigned'}
                                        </div>
                                    )}
                                    
                                    {partiesSearchTerm && 
                                     (editingParties ? localParties : (employee?.party || [])).filter(party => 
                                        party.toLowerCase().includes(partiesSearchTerm.toLowerCase())
                                     ).length === 0 && (
                                        <div className="text-center text-muted py-5">
                                            <i className="mdi mdi-magnify-close mdi-36px d-block mb-2"></i>
                                            No parties match your search
                                        </div>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                        
                        {/* Team Members' Parties */}
                        {allSubordinates.length > 0 && allSubordinates.some(s => Array.isArray(s.party) && s.party.length > 0) && (
                            <Col md={6}>
                                <Card className="mb-3">
                                    <Card.Header className="bg-info text-white">
                                        <h6 className="mb-0">
                                            <i className="mdi mdi-account-group me-2"></i>
                                            Team Members' Parties
                                        </h6>
                                    </Card.Header>
                                    <Card.Body className="p-0" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                        {allSubordinates
                                            .filter(sub => Array.isArray(sub.party) && sub.party.length > 0)
                                            .map((sub, subIdx) => (
                                                <div key={subIdx} className="mb-3">
                                                    <div className="bg-light px-3 py-2 border-bottom">
                                                        <strong>{sub.empName}</strong>
                                                        <Badge bg="secondary" className="ms-2" pill>
                                                            {sub.party.length} parties
                                                        </Badge>
                                                    </div>
                                                    <Table size="sm" className="mb-0">
                                                        <tbody>
                                                            {sub.party
                                                                .filter(party => 
                                                                    !partiesSearchTerm || 
                                                                    party.toLowerCase().includes(partiesSearchTerm.toLowerCase())
                                                                )
                                                                .slice(0, 5)
                                                                .map((party, pIdx) => (
                                                                    <tr key={pIdx}>
                                                                        <td style={{ width: '40px' }}>{pIdx + 1}</td>
                                                                        <td>{party}</td>
                                                                    </tr>
                                                                ))
                                                            }
                                                            {sub.party.length > 5 && (
                                                                <tr>
                                                                    <td colSpan={2} className="text-center text-muted small py-2">
                                                                        ... and {sub.party.length - 5} more parties
                                                                    </td>
                                                                </tr>
                                                            )}
                                                            {partiesSearchTerm && 
                                                             sub.party.filter(party => 
                                                                party.toLowerCase().includes(partiesSearchTerm.toLowerCase())
                                                             ).length === 0 && (
                                                                <tr>
                                                                    <td colSpan={2} className="text-center text-muted small py-2">
                                                                        No matching parties
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </Table>
                                                </div>
                                            ))
                                        }
                                    </Card.Body>
                                </Card>
                            </Col>
                        )}
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <div className="d-flex justify-content-between w-100">
                        <div>
                            {editingParties && (
                                <small className="text-muted">
                                    <i className="mdi mdi-information-outline me-1"></i>
                                    Changes will update vouchers automatically after saving
                                </small>
                            )}
                        </div>
                        <div className="d-flex gap-2">
                            {!editingParties && (
                                <>
                                    <Button variant="secondary" onClick={() => {
                                        setShowPartiesModal(false);
                                        handleCancelEdit();
                                    }}>
                                        Close
                                    </Button>
                                    <Button 
                                        variant="outline-primary" 
                                        onClick={() => {
                                            // Copy all parties to clipboard
                                            const parties = employee?.party || [];
                                            const filteredParties = partiesSearchTerm 
                                                ? parties.filter(party => 
                                                    party.toLowerCase().includes(partiesSearchTerm.toLowerCase())
                                                  )
                                                : parties;
                                            
                                            const text = filteredParties.join('\n');
                                            navigator.clipboard.writeText(text).then(() => {
                                                alert(`Copied ${filteredParties.length} parties to clipboard!`);
                                            }).catch(() => {
                                                alert('Failed to copy to clipboard');
                                            });
                                        }}
                                        disabled={!Array.isArray(employee?.party) || employee.party.length === 0}
                                    >
                                        <i className="mdi mdi-content-copy me-1"></i>
                                        Copy All to Clipboard
                                    </Button>
                                </>
                            )}
                            {editingParties && (
                                <>
                                    <Button 
                                        variant="secondary" 
                                        onClick={handleCancelEdit}
                                        disabled={savingParties}
                                    >
                                        <i className="mdi mdi-close me-1"></i>
                                        Cancel
                                    </Button>
                                    <Button 
                                        variant="success" 
                                        onClick={handleSaveParties}
                                        disabled={savingParties}
                                    >
                                        {savingParties ? (
                                            <><i className="mdi mdi-loading mdi-spin me-1"></i> Saving & Refreshing...</>
                                        ) : (
                                            <><i className="mdi mdi-content-save me-1"></i> Save & Update Vouchers</>
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
            
            <Edit modelShow={showEdit} editData={employee} close={setShowEdit} />
        </Row>
    );
};

export default EmployeeInfo;


