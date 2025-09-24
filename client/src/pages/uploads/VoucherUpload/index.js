import React, { useState, useEffect } from 'react';
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

    useEffect(() => {
        if (uploadState?.status === 201) {
            ToastHandle("success", "Vouchers uploaded successfully! 👍");
            setUploadProgress(100);
            setTimeout(() => {
                resetForm();
            }, 2000);
        } else if (uploadState?.status === 400) {
            ToastHandle("error", uploadState?.message || "Upload failed");
            setIsProcessing(false);
        }
    }, [uploadState]);

    const resetForm = () => {
        setSelectedFile(null);
        setParsedData([]);
        setPreviewData([]);
        setUploadProgress(0);
        setIsProcessing(false);
        setShowPreviewModal(false);
        setValidationResults({ valid: [], duplicates: [], invalid: [] });
        dispatch(resetVoucherUpload());
    };

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

    const processVoucherData = (data) => {
        try {
            setUploadProgress(70);
            
            const processedVouchers = [];
            const validVouchers = [];
            const duplicateVouchers = [];
            const invalidVouchers = [];
            
            // Required fields for voucher
            const requiredFields = ['date', 'voucherNumber', 'voucherType', 'amount'];
            
            data.forEach((row, index) => {
                // Convert row keys to lowercase for case-insensitive matching
                const lowerRow = {};
                Object.keys(row).forEach(key => {
                    lowerRow[key.toLowerCase().trim()] = row[key];
                });
                
                // Map common field variations
                const voucher = {
                    date: lowerRow.date || lowerRow.voucherdate || lowerRow['voucher date'] || '',
                    voucherNumber: lowerRow.vouchernumber || lowerRow['voucher number'] || lowerRow.vchno || lowerRow.number || '',
                    voucherType: lowerRow.vouchertype || lowerRow['voucher type'] || lowerRow.type || '',
                    voucherTypeName: lowerRow.vouchertypename || lowerRow['voucher type name'] || '',
                    party: lowerRow.party || lowerRow.partyname || lowerRow['party name'] || lowerRow.customer || '',
                    partyledgername: lowerRow.partyledgername || lowerRow['party ledger name'] || '',
                    amount: parseFloat(lowerRow.amount || lowerRow.total || lowerRow.value || '0') || 0,
                    narration: lowerRow.narration || lowerRow.description || lowerRow.remarks || '',
                    reference: lowerRow.reference || lowerRow.ref || lowerRow.refno || '',
                    isDeemedPositive: lowerRow.isdeemedpositive === 'true' || lowerRow.isdeemedpositive === '1',
                    rowIndex: index + 1
                };

                // Parse date
                if (voucher.date) {
                    try {
                        // Handle Excel serial date numbers
                        if (typeof voucher.date === 'number') {
                            const excelEpoch = new Date(1899, 11, 30); // Excel epoch
                            const parsedDate = new Date(excelEpoch.getTime() + (voucher.date * 24 * 60 * 60 * 1000));
                            voucher.date = parsedDate;
                        } else {
                            const parsedDate = moment(voucher.date, ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD', 'DD-MM-YYYY']);
                            if (parsedDate.isValid()) {
                                voucher.date = parsedDate.toDate();
                            } else {
                                throw new Error('Invalid date format');
                            }
                        }
                    } catch (dateError) {
                        invalidVouchers.push({
                            ...voucher,
                            error: `Invalid date format: ${voucher.date}`
                        });
                        return;
                    }
                }

                // Validate required fields
                const missingFields = requiredFields.filter(field => !voucher[field] || 
                    (typeof voucher[field] === 'string' && voucher[field].trim() === ''));
                
                if (missingFields.length > 0) {
                    invalidVouchers.push({
                        ...voucher,
                        error: `Missing required fields: ${missingFields.join(', ')}`
                    });
                    return;
                }

                // Check for duplicates within the Excel data
                const isDuplicate = processedVouchers.some(existing => 
                    existing.voucherNumber === voucher.voucherNumber &&
                    existing.voucherType === voucher.voucherType &&
                    moment(existing.date).format('YYYY-MM-DD') === moment(voucher.date).format('YYYY-MM-DD')
                );

                if (isDuplicate) {
                    duplicateVouchers.push({
                        ...voucher,
                        error: 'Duplicate voucher within uploaded data'
                    });
                    return;
                }

                processedVouchers.push(voucher);
                validVouchers.push(voucher);
            });

            setUploadProgress(90);
            
            setParsedData(processedVouchers);
            setPreviewData(validVouchers.slice(0, 10)); // Show first 10 for preview
            setValidationResults({
                valid: validVouchers,
                duplicates: duplicateVouchers,
                invalid: invalidVouchers
            });
            
            setUploadProgress(100);
            
            if (validVouchers.length > 0) {
                setShowPreviewModal(true);
            } else {
                ToastHandle('error', 'No valid vouchers found in the Excel file');
            }
            
        } catch (error) {
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
                return <Badge bg="success">{validationResults.valid.length} Valid</Badge>;
            case 'duplicates':
                return <Badge bg="warning">{validationResults.duplicates.length} Duplicates</Badge>;
            case 'invalid':
                return <Badge bg="danger">{validationResults.invalid.length} Invalid</Badge>;
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
                                                <strong>Note:</strong>
                                                <ul className="mb-0 mt-2">
                                                    <li>Duplicate vouchers (same number, type, and date) will be rejected</li>
                                                    <li>Only valid vouchers will be uploaded to database</li>
                                                    <li>Excel file will be deleted after successful upload</li>
                                                    <li>Column names are case-insensitive</li>
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

                    {validationResults.invalid.length > 0 && (
                        <>
                            <h6 className="mt-3 text-danger">Invalid Records:</h6>
                            <div className="table-responsive" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                <Table striped bordered size="sm">
                                    <thead className="table-danger">
                                        <tr>
                                            <th>Row</th>
                                            <th>Error</th>
                                            <th>Data</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {validationResults.invalid.slice(0, 10).map((item, index) => (
                                            <tr key={index}>
                                                <td>{item.rowIndex}</td>
                                                <td>{item.error}</td>
                                                <td className="text-truncate">
                                                    {JSON.stringify(item, null, 0).substring(0, 100)}...
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
                        Cancel
                    </Button>
                    <Button 
                        variant="success" 
                        onClick={handleUploadConfirm}
                        disabled={validationResults.valid.length === 0}
                    >
                        <i className="mdi mdi-upload"></i> 
                        Upload {validationResults.valid.length} Valid Vouchers
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default VoucherUploadPage;