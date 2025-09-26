import React, { useState, useEffect, useCallback } from 'react';
import { Card, Table, Form, Col, Button, Row, Alert, ProgressBar, Modal, Badge } from 'react-bootstrap';
import './style.css';
import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import moment from 'moment';
import { uploadVoucherExcel, resetVoucherUpload } from '../../../redux/upload/actions';
import ToastHandle from '../../../constants/Toaster/Toaster';
import MainLoader from '../../../components/MainLoader';

function VoucherUploadPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [parsedData, setParsedData] = useState([]);
    const [previewData, setPreviewData] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [validationResults, setValidationResults] = useState({
        valid: [],
        duplicates: [],
        invalid: []
    });
    const allowedExtensions = ['xlsx', 'xls'];

    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const uploadState = store?.voucherUpload;

    const resetForm = useCallback(() => {
        setSelectedFile(null);
        setParsedData([]);
        setPreviewData([]);
        setUploadProgress(0);
        setIsProcessing(false);
        setShowPreviewModal(false);
        setValidationResults({ valid: [], duplicates: [], invalid: [] });
        dispatch(resetVoucherUpload());
    }, [dispatch]);

    useEffect(() => {
        if (uploadState?.status === 201) {
            const stats = uploadState?.data?.uploadStats;
            if (stats) {
                const successMsg = `Upload completed! ${stats.uploaded} vouchers uploaded successfully`;
                const detailsMsg = stats.duplicates > 0 || stats.errors > 0 
                    ? ` (${stats.duplicates} duplicates rejected, ${stats.errors} errors)`
                    : '';
                
                ToastHandle("success", successMsg + detailsMsg);
                
                // Show detailed results if there were issues
                if (stats.duplicates > 0 || stats.errors > 0) {
                    console.log('Upload Details:', {
                        total: stats.total,
                        uploaded: stats.uploaded,
                        fileDuplicates: stats.fileDuplicates || 0,
                        dbDuplicates: stats.dbDuplicates || 0,
                        errors: stats.errors,
                        errorDetails: stats.errorDetails,
                        duplicateDetails: stats.duplicateDetails
                    });
                }
            } else {
                ToastHandle("success", "Vouchers uploaded successfully! 👍");
            }
            
            setUploadProgress(100);
            setTimeout(() => {
                resetForm();
            }, 3000); // Longer delay to show success message
        } else if (uploadState?.status === 400) {
            const errorMsg = uploadState?.message || "Upload failed";
            ToastHandle("error", errorMsg);
            
            // Show detailed error information if available
            if (uploadState?.data?.uploadStats?.errorDetails) {
                console.error('Upload Errors:', uploadState.data.uploadStats.errorDetails);
            }
            
            setIsProcessing(false);
        }
    }, [uploadState, resetForm]);

    const handleFileSelection = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileExtension = file.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(fileExtension)) {
            ToastHandle('error', 'Please select an Excel file (.xlsx or .xls)');
            return;
        }

        setSelectedFile(file);
        setUploadProgress(10);
        parseExcelFile(file);
    };

    const parseExcelFile = (file) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                setUploadProgress(30);
                
                // Convert Excel to JSON format
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet);
                
                setUploadProgress(50);
                processVoucherData(jsonData);
                
            } catch (error) {
                ToastHandle('error', 'Error parsing Excel file: ' + error.message);
                setIsProcessing(false);
            }
        };

        reader.onerror = () => {
            ToastHandle('error', 'Error reading file');
            setIsProcessing(false);
        };

        reader.readAsArrayBuffer(file);
    };

    const processVoucherData = async (data) => {
        try {
            setUploadProgress(70);
            
            const processedVouchers = [];
            const validVouchers = [];
            const duplicateVouchers = [];
            const invalidVouchers = [];
            
            // Required fields for voucher (making voucherNumber primary key)
            const requiredFields = ['date', 'voucherNumber', 'voucherType', 'amount'];
            
            // Track voucher numbers to detect duplicates within the file
            const voucherNumberTracker = new Map();
            
            data.forEach((row, index) => {
                // Convert row keys to lowercase for case-insensitive matching
                const lowerRow = {};
                Object.keys(row).forEach(key => {
                    lowerRow[key.toLowerCase().trim()] = row[key];
                });
                
                // Map common field variations
                const voucher = {
                    date: lowerRow.date || lowerRow.voucherdate || lowerRow['voucher date'] || '',
                    voucherNumber: String(lowerRow.vouchernumber || lowerRow['voucher number'] || lowerRow.vchno || lowerRow.number || '').trim(),
                    voucherType: String(lowerRow.vouchertype || lowerRow['voucher type'] || lowerRow.type || '').trim(),
                    voucherTypeName: String(lowerRow.vouchertypename || lowerRow['voucher type name'] || '').trim(),
                    party: String(lowerRow.party || lowerRow.partyname || lowerRow['party name'] || lowerRow.customer || '').trim(),
                    partyledgername: String(lowerRow.partyledgername || lowerRow['party ledger name'] || '').trim(),
                    amount: parseFloat(lowerRow.amount || lowerRow.total || lowerRow.value || '0') || 0,
                    narration: String(lowerRow.narration || lowerRow.description || lowerRow.remarks || '').trim(),
                    reference: String(lowerRow.reference || lowerRow.ref || lowerRow.refno || '').trim(),
                    isDeemedPositive: lowerRow.isdeemedpositive === 'true' || lowerRow.isdeemedpositive === '1',
                    rowIndex: index + 1
                };

                // Enhanced voucher number validation (primary key)
                if (!voucher.voucherNumber || voucher.voucherNumber === '') {
                    invalidVouchers.push({
                        ...voucher,
                        error: 'Voucher number is required (primary key)'
                    });
                    return;
                }

                // Check for duplicate voucher numbers within the Excel file (primary key check)
                const voucherKey = voucher.voucherNumber.toLowerCase();
                if (voucherNumberTracker.has(voucherKey)) {
                    const firstOccurrence = voucherNumberTracker.get(voucherKey);
                    duplicateVouchers.push({
                        ...voucher,
                        error: `Duplicate voucher number in file: ${voucher.voucherNumber} (first seen at row ${firstOccurrence})`,
                        duplicateType: 'file'
                    });
                    return;
                }
                voucherNumberTracker.set(voucherKey, index + 1);

                // Parse date with enhanced validation
                if (voucher.date) {
                    try {
                        // Handle Excel serial date numbers
                        if (typeof voucher.date === 'number') {
                            const excelEpoch = new Date(1899, 11, 30); // Excel epoch
                            const parsedDate = new Date(excelEpoch.getTime() + (voucher.date * 24 * 60 * 60 * 1000));
                            voucher.date = parsedDate;
                        } else {
                            const parsedDate = moment(voucher.date, ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY', 'YYYY/MM/DD']);
                            if (parsedDate.isValid()) {
                                voucher.date = parsedDate.toDate();
                            } else {
                                throw new Error('Invalid date format');
                            }
                        }
                    } catch (dateError) {
                        invalidVouchers.push({
                            ...voucher,
                            error: `Invalid date format: ${voucher.date}. Use DD/MM/YYYY, MM/DD/YYYY, or YYYY-MM-DD`
                        });
                        return;
                    }
                }

                // Validate required fields
                const missingFields = requiredFields.filter(field => {
                    const value = voucher[field];
                    return value === undefined || value === null || 
                           (typeof value === 'string' && value.trim() === '') ||
                           (field === 'amount' && (isNaN(value) || value === 0));
                });
                
                if (missingFields.length > 0) {
                    invalidVouchers.push({
                        ...voucher,
                        error: `Missing or invalid required fields: ${missingFields.join(', ')}`
                    });
                    return;
                }

                // Additional validation
                if (voucher.amount <= 0) {
                    invalidVouchers.push({
                        ...voucher,
                        error: 'Amount must be greater than zero'
                    });
                    return;
                }

                // Enhanced voucher type validation
                const validVoucherTypes = ['sales', 'purchase', 'receipt', 'payment', 'journal', 'contra', 'debit note', 'credit note'];
                if (!validVoucherTypes.some(type => voucher.voucherType.toLowerCase().includes(type.toLowerCase()))) {
                    // Still allow it but add a warning
                    voucher.warning = `Unusual voucher type: ${voucher.voucherType}. Common types are: Sales, Purchase, Receipt, Payment, Journal, Contra`;
                }

                processedVouchers.push(voucher);
                validVouchers.push(voucher);
            });

            setUploadProgress(85);

            // Step 2: Check for database duplicates using the verification API
            if (validVouchers.length > 0) {
                try {
                    console.log(`🔍 Checking ${validVouchers.length} vouchers against database...`);
                    
                    const voucherNumbers = validVouchers.map(v => v.voucherNumber);
                    const response = await fetch('/api/tally/verify/vouchers', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken')}`
                        },
                        body: JSON.stringify({ voucherNumbers })
                    });

                    if (response.ok) {
                        const verificationData = await response.json();
                        const duplicateResults = verificationData.data.results.filter(r => r.exists);
                        
                        console.log(`📊 Database check: Found ${duplicateResults.length} existing vouchers`);

                        // Move database duplicates from valid to duplicate list
                        const finalValidVouchers = [];
                        const dbDuplicateMap = new Map();
                        
                        duplicateResults.forEach(result => {
                            dbDuplicateMap.set(result.voucherNumber.toLowerCase(), result.existing);
                        });

                        validVouchers.forEach(voucher => {
                            const voucherKey = voucher.voucherNumber.toLowerCase();
                            if (dbDuplicateMap.has(voucherKey)) {
                                const existing = dbDuplicateMap.get(voucherKey);
                                duplicateVouchers.push({
                                    ...voucher,
                                    error: `Voucher already exists in database (Date: ${new Date(existing.date).toLocaleDateString()}, Type: ${existing.voucherType}, Amount: ₹${existing.amount})`,
                                    duplicateType: 'database',
                                    existingVoucher: existing
                                });
                            } else {
                                finalValidVouchers.push(voucher);
                            }
                        });

                        // Update the valid vouchers list
                        validVouchers.length = 0;
                        validVouchers.push(...finalValidVouchers);

                        console.log(`✅ Final validation: ${finalValidVouchers.length} valid, ${duplicateVouchers.length} duplicates, ${invalidVouchers.length} invalid`);
                        
                    } else {
                        console.warn('⚠️ Failed to check database duplicates, proceeding without database validation');
                        ToastHandle('warning', 'Could not verify against existing vouchers. Upload will check for duplicates during processing.');
                    }
                } catch (verificationError) {
                    console.error('❌ Database verification error:', verificationError);
                    ToastHandle('warning', 'Could not verify against existing vouchers. Upload will check for duplicates during processing.');
                }
            }
            
            setUploadProgress(90);
            
            setParsedData(processedVouchers);
            setPreviewData(validVouchers.slice(0, 10)); // Show first 10 valid vouchers for preview
            setValidationResults({
                valid: validVouchers,
                duplicates: duplicateVouchers,
                invalid: invalidVouchers
            });
            
            setUploadProgress(100);
            
            if (validVouchers.length > 0) {
                setShowPreviewModal(true);
            } else {
                const totalIssues = duplicateVouchers.length + invalidVouchers.length;
                ToastHandle('error', `No valid vouchers found. Found ${totalIssues} issues: ${duplicateVouchers.length} duplicates, ${invalidVouchers.length} invalid records.`);
            }
            
        } catch (error) {
            console.error('Data processing error:', error);
            ToastHandle('error', 'Error processing voucher data: ' + error.message);
            setIsProcessing(false);
        }
    };

    const handleUploadConfirm = () => {
        if (validationResults.valid.length === 0) {
            ToastHandle('error', 'No valid vouchers to upload');
            return;
        }

        setIsProcessing(true);
        setShowPreviewModal(false);
        
        const formData = new FormData();
        formData.append('voucherData', JSON.stringify(validationResults.valid));
        formData.append('fileName', selectedFile.name);
        
        dispatch(uploadVoucherExcel(formData));
    };

    const getStatusBadge = (type) => {
        switch (type) {
            case 'valid':
                return (
                    <Badge bg="success">
                        <i className="mdi mdi-check-circle me-1"></i>
                        {validationResults.valid.length} Valid
                    </Badge>
                );
            case 'duplicates':
                const dbDuplicates = validationResults.duplicates.filter(d => d.duplicateType === 'database').length;
                const fileDuplicates = validationResults.duplicates.filter(d => d.duplicateType === 'file').length;
                return (
                    <div className="d-flex flex-wrap gap-1">
                        <Badge bg="warning">
                            <i className="mdi mdi-content-duplicate me-1"></i>
                            {validationResults.duplicates.length} Total Duplicates
                        </Badge>
                        {dbDuplicates > 0 && (
                            <Badge bg="danger" className="text-white">
                                <i className="mdi mdi-database me-1"></i>
                                {dbDuplicates} DB
                            </Badge>
                        )}
                        {fileDuplicates > 0 && (
                            <Badge bg="warning" className="text-dark">
                                <i className="mdi mdi-file me-1"></i>
                                {fileDuplicates} File
                            </Badge>
                        )}
                    </div>
                );
            case 'invalid':
                return (
                    <Badge bg="danger">
                        <i className="mdi mdi-alert-circle me-1"></i>
                        {validationResults.invalid.length} Invalid
                    </Badge>
                );
            default:
                return null;
        }
    };

    return (
        <>
            <Row>
                <Col xs={12}>
                    <Card>
                        <Card.Header>
                            <h4 className="header-title">
                                <i className="mdi mdi-file-excel me-2"></i>
                                Voucher Excel Upload
                            </h4>
                            <p className="text-muted mb-0">
                                Upload vouchers from Excel files. Only unique vouchers will be processed.
                            </p>
                        </Card.Header>
                        <Card.Body>
                            {isProcessing ? (
                                <MainLoader />
                            ) : (
                                <Row>
                                    <Col lg={6}>
                                        <div className="upload-section">
                                            <h5>Select Excel File</h5>
                                            <input
                                                type="file"
                                                accept=".xlsx,.xls"
                                                onChange={handleFileSelection}
                                                className="form-control mb-3"
                                            />
                                            
                                            {selectedFile && (
                                                <Alert variant="info">
                                                    <strong>Selected File:</strong> {selectedFile.name}
                                                    <br />
                                                    <strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                </Alert>
                                            )}

                                            {uploadProgress > 0 && (
                                                <div className="mb-3">
                                                    <label className="form-label">Processing Progress</label>
                                                    <ProgressBar 
                                                        now={uploadProgress} 
                                                        label={`${uploadProgress}%`}
                                                        variant={uploadProgress === 100 ? 'success' : 'primary'}
                                                    />
                                                </div>
                                            )}

                                            {Object.keys(validationResults).some(key => validationResults[key].length > 0) && (
                                                <div className="validation-results">
                                                    <h6>Validation Results:</h6>
                                                    <div className="mb-2">
                                                        {getStatusBadge('valid')}
                                                        {' '}
                                                        {getStatusBadge('duplicates')}
                                                        {' '}
                                                        {getStatusBadge('invalid')}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="action-buttons mt-3">
                                                <Button 
                                                    variant="secondary" 
                                                    onClick={resetForm}
                                                    className="me-2"
                                                >
                                                    <i className="mdi mdi-refresh"></i> Reset
                                                </Button>
                                                
                                                {validationResults.valid.length > 0 && (
                                                    <Button 
                                                        variant="success"
                                                        onClick={() => setShowPreviewModal(true)}
                                                    >
                                                        <i className="mdi mdi-eye"></i> Preview & Upload
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </Col>

                                    <Col lg={6}>
                                        <div className="info-section">
                                            <h5>Required Excel Columns</h5>
                                            <Table size="sm" className="mb-3">
                                                <thead>
                                                    <tr>
                                                        <th>Column Name</th>
                                                        <th>Required</th>
                                                        <th>Format</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td>date</td>
                                                        <td><Badge bg="danger">Yes</Badge></td>
                                                        <td>DD/MM/YYYY</td>
                                                    </tr>
                                                    <tr>
                                                        <td>voucherNumber</td>
                                                        <td><Badge bg="danger">Yes</Badge></td>
                                                        <td>Text</td>
                                                    </tr>
                                                    <tr>
                                                        <td>voucherType</td>
                                                        <td><Badge bg="danger">Yes</Badge></td>
                                                        <td>Sales/Purchase/Receipt/Payment</td>
                                                    </tr>
                                                    <tr>
                                                        <td>amount</td>
                                                        <td><Badge bg="danger">Yes</Badge></td>
                                                        <td>Number</td>
                                                    </tr>
                                                    <tr>
                                                        <td>party</td>
                                                        <td><Badge bg="secondary">Optional</Badge></td>
                                                        <td>Text</td>
                                                    </tr>
                                                    <tr>
                                                        <td>narration</td>
                                                        <td><Badge bg="secondary">Optional</Badge></td>
                                                        <td>Text</td>
                                                    </tr>
                                                </tbody>
                                            </Table>

                                            <Alert variant="warning">
                                                <strong>Duplicate Detection & Primary Key:</strong>
                                                <ul className="mb-0 mt-2">
                                                    <li><strong>Voucher Number</strong> is the primary key - must be unique per company</li>
                                                    <li>Duplicate voucher numbers within the Excel file will be rejected</li>
                                                    <li>Vouchers that already exist in database (same voucher number) will be rejected</li>
                                                    <li>Only new, unique vouchers will be uploaded to prevent database clogging</li>
                                                    <li>Detailed duplicate detection report will be provided</li>
                                                    <li>Column names are case-insensitive for flexibility</li>
                                                </ul>
                                            </Alert>
                                        </div>
                                    </Col>
                                </Row>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Preview Modal */}
            <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <i className="mdi mdi-eye me-2"></i>
                        Voucher Upload Preview
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="mb-3">
                        <h6>Upload Summary:</h6>
                        <Row>
                            <Col md={3}>{getStatusBadge('valid')}</Col>
                            <Col md={3}>{getStatusBadge('duplicates')}</Col>
                            <Col md={3}>{getStatusBadge('invalid')}</Col>
                            <Col md={3}>
                                <Badge bg="info">
                                    {validationResults.valid.length + validationResults.duplicates.length + validationResults.invalid.length} Total
                                </Badge>
                            </Col>
                        </Row>
                    </div>

                    <h6>Preview of Valid Vouchers (First 10):</h6>
                    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Table striped bordered size="sm">
                            <thead className="table-dark">
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
                                {previewData.map((voucher, index) => (
                                    <tr key={index}>
                                        <td>{moment(voucher.date).format('DD/MM/YYYY')}</td>
                                        <td>{voucher.voucherNumber}</td>
                                        <td>
                                            <Badge bg="primary" className="text-truncate">
                                                {voucher.voucherType}
                                            </Badge>
                                        </td>
                                        <td className="text-truncate" style={{maxWidth: '120px'}}>
                                            {voucher.party || 'N/A'}
                                        </td>
                                        <td>₹{voucher.amount.toLocaleString()}</td>
                                        <td className="text-truncate" style={{maxWidth: '150px'}}>
                                            {voucher.narration || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>

                    {validationResults.duplicates.length > 0 && (
                        <>
                            <h6 className="mt-3 text-warning">
                                <i className="mdi mdi-content-duplicate me-2"></i>
                                Duplicate Records (Will be Rejected)
                            </h6>
                            <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                <Table striped bordered size="sm">
                                    <thead className="table-warning">
                                        <tr>
                                            <th>Row</th>
                                            <th>Voucher No.</th>
                                            <th>Type</th>
                                            <th>Issue Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {validationResults.duplicates.slice(0, 15).map((item, index) => (
                                            <tr key={index} className={item.duplicateType === 'database' ? 'table-danger' : 'table-warning'}>
                                                <td>{item.rowIndex}</td>
                                                <td className="text-truncate" style={{maxWidth: '100px'}}>
                                                    <strong>{item.voucherNumber || 'N/A'}</strong>
                                                </td>
                                                <td>
                                                    {item.duplicateType === 'database' ? (
                                                        <Badge bg="danger" className="text-white">
                                                            <i className="mdi mdi-database me-1"></i>
                                                            DB Duplicate
                                                        </Badge>
                                                    ) : (
                                                        <Badge bg="warning" className="text-dark">
                                                            <i className="mdi mdi-file me-1"></i>
                                                            File Duplicate
                                                        </Badge>
                                                    )}
                                                </td>
                                                <td className="text-truncate" style={{maxWidth: '250px'}}>
                                                    <small>{item.error}</small>
                                                    {item.existingVoucher && (
                                                        <div className="mt-1">
                                                            <small className="text-muted">
                                                                <i className="mdi mdi-information-outline me-1"></i>
                                                                Existing: {new Date(item.existingVoucher.date).toLocaleDateString()}, 
                                                                ₹{item.existingVoucher.amount}
                                                            </small>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                {validationResults.duplicates.length > 15 && (
                                    <div className="text-center py-2">
                                        <small className="text-muted">
                                            <i className="mdi mdi-dots-horizontal me-1"></i>
                                            ...and {validationResults.duplicates.length - 15} more duplicates
                                        </small>
                                    </div>
                                )}
                            </div>
                            
                            <div className="mt-2">
                                <Row>
                                    <Col md={6}>
                                        <small className="text-danger">
                                            <i className="mdi mdi-database me-1"></i>
                                            <strong>Database Duplicates:</strong> {validationResults.duplicates.filter(d => d.duplicateType === 'database').length}
                                            <br />
                                            <span className="text-muted">Vouchers already exist in the system</span>
                                        </small>
                                    </Col>
                                    <Col md={6}>
                                        <small className="text-warning">
                                            <i className="mdi mdi-file me-1"></i>
                                            <strong>File Duplicates:</strong> {validationResults.duplicates.filter(d => d.duplicateType === 'file').length}
                                            <br />
                                            <span className="text-muted">Duplicate voucher numbers within Excel</span>
                                        </small>
                                    </Col>
                                </Row>
                            </div>
                        </>
                    )}

                    {validationResults.invalid.length > 0 && (
                        <>
                            <h6 className="mt-3 text-danger">Invalid Records (Will be Rejected):</h6>
                            <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                <Table striped bordered size="sm">
                                    <thead className="table-danger">
                                        <tr>
                                            <th>Row</th>
                                            <th>Voucher No.</th>
                                            <th>Error</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {validationResults.invalid.slice(0, 10).map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.rowIndex}</td>
                                                <td className="text-truncate" style={{maxWidth: '120px'}}>
                                                    {item.voucherNumber || 'N/A'}
                                                </td>
                                                <td className="text-truncate" style={{maxWidth: '200px'}}>
                                                    {item.error}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                                {validationResults.invalid.length > 10 && (
                                    <small className="text-muted">
                                        ...and {validationResults.invalid.length - 10} more invalid records
                                    </small>
                                )}
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <div className="w-100 d-flex justify-content-between align-items-center">
                        <div className="text-muted">
                            {validationResults.duplicates.length > 0 || validationResults.invalid.length > 0 ? (
                                <small>
                                    <i className="mdi mdi-information-outline me-1"></i>
                                    {validationResults.duplicates.length} duplicates and {validationResults.invalid.length} invalid records will be rejected
                                </small>
                            ) : (
                                <small>
                                    <i className="mdi mdi-check-circle-outline me-1"></i>
                                    All vouchers are valid and ready for upload
                                </small>
                            )}
                        </div>
                        <div>
                            <Button variant="secondary" onClick={() => setShowPreviewModal(false)} className="me-2">
                                Cancel
                            </Button>
                            <Button 
                                variant="success" 
                                onClick={handleUploadConfirm}
                                disabled={validationResults.valid.length === 0}
                            >
                                <i className="mdi mdi-upload"></i> 
                                Upload {validationResults.valid.length} Valid Voucher{validationResults.valid.length !== 1 ? 's' : ''}
                            </Button>
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default VoucherUploadPage;