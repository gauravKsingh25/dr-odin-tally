import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Row, Col, Card, Table, Badge, Button, Breadcrumb, Form } from 'react-bootstrap';
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
    }, [data?.employee?.empName, data?.employee?.party, data?.employee?.empId, data?.invoices]);

    // Handle voucher date filtering
    const handleVoucherQuickDateRange = (range) => {
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
                return;
        }

        const formatDate = (date) => date.toISOString().split('T')[0];
        setVoucherDateFilter({
            fromDate: formatDate(startDate),
            toDate: formatDate(endDate),
            quickRange: range
        });
    };

    const handleVoucherDateReset = () => {
        setVoucherDateFilter({ fromDate: '', toDate: '', quickRange: '' });
    };

    const employee = data?.employee || {};
    const reportingManager = data?.reportingManager;
    const directReportsCount = data?.directReportsCount || 0;
    const directReports = data?.directReports || [];

    const breadCrumbItems = [
        { label: 'Staff Management', path: '/staffmanagment' },
        { label: employee?.empName || 'Employee', path: '#', active: true },
    ];

    // Filter vouchers based on date range
    const filteredVouchers = related.vouchers.filter(v => {
        if (!voucherDateFilter.fromDate && !voucherDateFilter.toDate) {
            return true; // No date filter applied
        }
        
        const voucherDate = new Date(v.date);
        const fromDate = voucherDateFilter.fromDate ? new Date(voucherDateFilter.fromDate) : null;
        const toDate = voucherDateFilter.toDate ? new Date(voucherDateFilter.toDate) : null;
        
        if (fromDate && toDate) {
            return voucherDate >= fromDate && voucherDate <= toDate;
        } else if (fromDate) {
            return voucherDate >= fromDate;
        } else if (toDate) {
            return voucherDate <= toDate;
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

    const netSales = salesCalculation.totalSales - salesCalculation.salesReturns;
    
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
                                                            <div className="text-muted">... and {employee.party.length - 3} more</div>
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
                            <h4 className="mb-3">Related Invoices</h4>
                            {related.loading && <MainLoader />}
                            {related.error && !related.loading && (
                                <div className="alert alert-warning" role="alert">{related.error}</div>
                            )}
                            
                            {/* Date Filter for Vouchers */}
                            <Row className="mb-3">
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="small">From Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            size="sm"
                                            value={voucherDateFilter.fromDate}
                                            onChange={(e) => setVoucherDateFilter(prev => ({...prev, fromDate: e.target.value}))}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="small">To Date</Form.Label>
                                        <Form.Control
                                            type="date"
                                            size="sm"
                                            value={voucherDateFilter.toDate}
                                            onChange={(e) => setVoucherDateFilter(prev => ({...prev, toDate: e.target.value}))}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={3}>
                                    <Form.Group>
                                        <Form.Label className="small">Quick Ranges</Form.Label>
                                        <Form.Select
                                            size="sm"
                                            value={voucherDateFilter.quickRange}
                                            onChange={(e) => handleVoucherQuickDateRange(e.target.value)}
                                        >
                                            <option value="">Select Range</option>
                                            <option value="thisMonth">This Month</option>
                                            <option value="lastMonth">Last Month</option>
                                            <option value="thisQuarter">This Quarter</option>
                                            <option value="thisYear">This Year</option>
                                            <option value="last30days">Last 30 Days</option>
                                            <option value="last90days">Last 90 Days</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={3} className="d-flex align-items-end">
                                    <Button 
                                        variant="outline-secondary" 
                                        size="sm"
                                        onClick={handleVoucherDateReset}
                                        className="me-2"
                                    >
                                        Clear
                                    </Button>
                                </Col>
                            </Row>
                            
                            {/* Transaction Summary */}
                            {filteredVouchers.length > 0 && (
                                <Row className="mb-3">
                                    <Col md={3}>
                                        <Card className="bg-light">
                                            <Card.Body className="py-2 text-center">
                                                <div className="text-success h5 mb-1">₹{salesCalculation.totalSales.toLocaleString('en-IN')}</div>
                                                <div className="small text-muted">Sales ({salesCalculation.salesCount})</div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={3}>
                                        <Card className="bg-light">
                                            <Card.Body className="py-2 text-center">
                                                <div className="text-danger h5 mb-1">₹{salesCalculation.salesReturns.toLocaleString('en-IN')}</div>
                                                <div className="small text-muted">Returns ({salesCalculation.returnsCount})</div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={3}>
                                        <Card className="bg-light">
                                            <Card.Body className="py-2 text-center">
                                                <div className="text-warning h5 mb-1">₹{salesCalculation.totalExpenses.toLocaleString('en-IN')}</div>
                                                <div className="small text-muted">Expenses ({salesCalculation.expensesCount})</div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                    <Col md={3}>
                                        <Card className="bg-light">
                                            <Card.Body className="py-2 text-center">
                                                <div className="text-info h5 mb-1">{filteredVouchers.length}</div>
                                                <div className="small text-muted">Total Transactions</div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                </Row>
                            )}
                            
                            <div className="table-responsive">
                                <Table className="mb-0 table-centered">
                                    <thead>
                                        <tr className="table-head text-white">
                                            <th style={{width: 36}}></th>
                                            <th>Date</th>
                                            <th>Voucher No.</th>
                                            <th>Type</th>
                                            <th>Party</th>
                                            <th>Dr/Cr</th>
                                            <th>Amount</th>
                                            <th>Narration</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredVouchers.map((v) => (
                                            <>
                                                <tr key={v._id} onClick={() => setExpandedVouchers((s) => ({ ...s, [v._id]: !s[v._id] }))} style={{ cursor: 'pointer' }}>
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
                                                        <td colSpan={7}>
                                                            <div className="expandable-row-content">
                                                                <div className="d-flex flex-wrap gap-4 mb-3">
                                                                    <div>
                                                                        <div className="text-muted small mb-1">Reference</div>
                                                                        <div className="fw-semibold">{v.reference || '—'}</div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-muted small mb-1">Party</div>
                                                                        <div className="fw-semibold">{v.party || '—'}</div>
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
                                                <td colSpan={6} className="text-center text-muted py-3">No related invoices</td>
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
            <Edit modelShow={showEdit} editData={employee} close={setShowEdit} />
        </Row>
    );
};

export default EmployeeInfo;


