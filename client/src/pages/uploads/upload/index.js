import React, { useState, useEffect } from 'react';
import { Card, Table, Form, Col, Button, Row, ModalHeader, CloseButton } from 'react-bootstrap';
import './style.css';
import { Link } from "react-router-dom"
import { useDispatch, useSelector } from 'react-redux';
import { MonthList } from '../../../redux/month/actions';
import Modal from 'react-bootstrap/Modal';
import { DateRangePicker } from 'react-date-range';
import { Calendar } from 'react-date-range';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { addDays, subDays } from 'date-fns';
import Papa, { parse } from 'papaparse';
import moment from 'moment';
import { UploadTellyReportPOST, UploadSecondReport, uploadSalaryExpanses, uploadRateDifference } from '../../../redux/actions';
import { Store } from 'react-notifications-component';
import MainLoader from '../../../components/MainLoader';
import ToastHandle from '../../../constants/Toaster/Toaster';

function UploadDashBoardPage() {
    const [show, setShow] = useState(false);
    const [render, setRender] = useState(false);
    const allowedExtensions = ['csv'];

    const [changeItem, setChangeItem] = useState('');

    const dispatch = useDispatch();
    const store = useSelector((state) => state);
    const Data = store?.MonthListReducer?.MonthList?.response;
    const monthListLoader = store?.MonthListReducer;
    const successHandle = store?.uploadSecondTellyFIle;
    const creditNoteSuccess = store?.uploadTellyReportS;
    const rateDifferenceSuccess = store?.uploadRateDifferenceFile
    const salaryExpansesSuccess = store?.uploadSalaryFile;
    const getMonths = store?.MonthListReducer;
    const [active, setActive] = useState(2);
    const [tableData, setTableData] = useState([]);
    const [dateRangeShow, setDateRange] = useState(false);
    const [tallyId, setTallyId] = useState();
    const [tallyFile, setTellyFile] = useState();
    const [state, setState] = useState([
        {
            startDate: subDays(new Date(), 0),
            endDate: addDays(new Date(), 0),
            key: 'selection',
        },
    ]);
    const [activemonth, setActivemonth] = useState(2);
    const [monthId, setMonthId] = useState('');
    const [tallyDate, setTallyDate] = useState();
    const [file, setFile] = useState('');
    const [talllyError, setTallyError] = useState('');
    const [loader, setLoader] = useState(false);
    const getepochTIme = (time) => {
        return new Date(time).getTime()
    }
    useEffect(() => {
        dispatch(MonthList());
    }, []);
    useEffect(() => {
        if (Data) {
            setTableData(Data);
        }
    }, [Data]);

    const handleButtonChange = (item) => {
        setChangeItem(item);
        // setTableData(tableData.map((ele,ind)=>item?._id===ele?._id?{...ele,status:!ele.status}:{...ele,status:false}))
        setShow(true);
    };
    const handleModalYes = () => {
        setTableData(
            tableData.map((ele, ind) =>
                changeItem?._id === ele?._id ? { ...ele, status: !ele.status } : { ...ele, status: false }
            )
        );
        setShow(false);
    };
    const selectionRange = {
        startDate: new Date(),
        endDate: new Date(),
        key: 'selection',
    };


    const handleOnChange = (ranges) => {
        const { selection } = ranges;
        // onChange(selection);
        setState([selection]);
    };
    const handleCloseDateRanges = () => {
        setDateRange(false);
    };

    const handleSalaryUpload = (e, record) => {
        let body = new FormData();
        body.append("file", e.target.files[0]);
        body.append("monthId", record?._id);
        body.append("startDate", state[0]?.startDate);
        body.append("endDate", state[0]?.endDate);
        dispatch(uploadSalaryExpanses(body))

    }
    const handleCreditNote = (e, record) => {
        if (e?.target?.files?.length) {
            const inputFile = e.target.files[0];

            // Check the file extensions, if it not
            // included in the allowed extensions
            // we show the error
            const fileExtension = inputFile?.type.split('/')[1];
            if (!allowedExtensions.includes(fileExtension)) {
                setTallyError('Please input a csv file');
                return;
            }

            // If input type is correct set the state

            handleCreditParse(e.target.files[0], record);
        }
    };
    const handleCreditParse = (files, record) => {
        // If user clicks the parse button without
        // a file we show a error

        // Initialize a reader which allows user
        // to read any file or blob.
        const reader = new FileReader();

        // Event listener on reader when the file
        // loads, we parse it and set the data.
        reader.onload = async ({ target }) => {
            let fill = false;
            let arrD = [];
            let finalArr = [];
            const csv = Papa.parse(target.result, {
                header: true,
                skipEmptyLines: true,
            });
            const parsedData = csv?.data;
            let result = [];
            if (Object.keys(parsedData[0])[0] === 'PASSIM TECHNOLOGIES') {
                for (let i = 0; i < parsedData.length; i++) {
                    let arr = parsedData[i]?.['PASSIM TECHNOLOGIES'];
                    if (arr.split('-').length === 3) {
                        if (fill === false) {
                            fill = true;
                            arrD.push(parsedData[i]);
                        } else {
                            finalArr.push(arrD);
                            arrD = [];
                            arrD.push(parsedData[i]);
                        }
                    } else {
                        if (fill) {
                            arrD.push(parsedData[i]);
                        }
                    }
                }
                finalArr.push(arrD);
                try {


                    let obj = finalArr.map((ele, ind) => {
                        return {
                            Date: new Date(ele[0]?.['PASSIM TECHNOLOGIES']).toString(),
                            Vendor: ele[0][''],
                            SalesPerson: ele[1][''],
                            STOCK_TRF_IGST: ele[2]?._5,
                            IGST_OUTPUT: ele?.[3]?._5,
                            Credit_Note: '',
                            Vch: ele[0]?._4,
                            monthId: record?._id,

                        };
                    });
                    let response = obj?.map((ele, ind) => {
                        if (getepochTIme(state[0].startDate) <= getepochTIme(ele?.Date) && getepochTIme(state[0].endDate) >= getepochTIme(ele?.Date)) {
                            return ele
                        }
                    })
                    let finalResponse = response.filter((ele) => ele)
                    if (finalResponse.length) {

                        dispatch(UploadTellyReportPOST(finalResponse));
                    }
                    else {
                        ToastHandle("error", "Please choose correct file with selected date")
                    }
                    setFile("")
                } catch (error) {
                    ToastHandle("error", "Please choose correct file")
                }
            }
            else {
                ToastHandle("error", "Please choose correct file")
            }
        };
        reader.readAsText(files);
    };

    const handleRateDifference = (e, record) => {
        handleRateFileParse(e.target.files[0], record);
    }
    const handleRateFileParse = (file, record) => {


        const reader = new FileReader();


        reader.onload = async ({ target }) => {
            let fill = false;
            let arrD = [];
            let finalArr = [];
            const csv = Papa.parse(target.result, {
                header: true,
                skipEmptyLines: true,
            });
            const parsedData = csv?.data;


            for (let i = 0; i < parsedData.length; i++) {
                let arr = parsedData[i]?.["PASSIM TECHNOLOGIES"];
                if (arr.split(" ")[1]?.length == 3 || arr.split('-').length === 3) {
                    if (fill === false) {
                        fill = true;
                        arrD.push(parsedData[i]);
                    } else {
                        finalArr.push(arrD);
                        arrD = [];
                        arrD.push(parsedData[i]);
                    }
                } else {
                    if (fill) {
                        arrD.push(parsedData[i]);
                    }
                }
            }
            finalArr.push(arrD);



            let main = [];
            for (let i = 0; i < finalArr.length; i++) {

                let obj = {
                    date: [],
                    vendor: [],
                    employee: [],
                    vchNo: [],
                    totalAmt: [],
                    igstPurchase: [],
                    igst: [],
                    monthId: []

                }
                obj.monthId.push(record?._id)

                if (finalArr[i][0]["PASSIM TECHNOLOGIES"] !== "") {
                    obj.date.push(finalArr[i][0]["PASSIM TECHNOLOGIES"])
                }
                if (finalArr[i][0][""] !== "") {
                    obj.vendor.push(finalArr[i][0][""])
                }
                if (finalArr[i][1][""] !== "") {
                    obj.employee.push(finalArr[i][1][""])
                }
                if (finalArr[i][0]._4 !== "") {
                    obj.vchNo.push(finalArr[i][0]._4)
                }

                if (finalArr[i][2]._5 !== "") {
                    obj.igstPurchase.push(finalArr[i][2]._5)
                }
                if (finalArr[i][3]._5 !== "") {
                    obj.igst.push(finalArr[i][3]._5)
                }
                if (finalArr[i][0]._6 !== "") {
                    obj.totalAmt.push(finalArr[i][0]._6)
                }


                main.push(obj)

                obj = {
                    date: [],
                    vendor: [],
                    employee: [],
                    vchNo: [],
                    totalAmt: [],
                    igstPurchase: [],
                    igst: [],
                    monthId: []

                }

            }


            let response = main?.map((ele, ind) => {
                if (getepochTIme(state[0].startDate) <= getepochTIme(ele?.date[0]) && getepochTIme(state[0].endDate) >= getepochTIme(ele?.date[0])) {
                    return ele
                }
            })
            let finalResponse = response.filter((ele) => ele)
            if (finalResponse.length) {
                dispatch(uploadRateDifference(finalResponse));
            }
            else {
                ToastHandle("error", "Please choose correct file with selected date")
            }

            setFile("")

        };

        reader.readAsText(file);
    }

    const handleTallyChange = (e, record) => {
        setTallyError('');
        if (e.target.files.length) {
            const inputFile = e.target.files[0];
            // Check the file extensions, if it not
            // included in the allowed extensions
            // we show the error
            const fileExtension = inputFile?.type.split('/')[1];
            if (!allowedExtensions.includes(fileExtension)) {
                setTallyError('Please input a csv file');
                return;
            }

            // If input type is correct set the state

            handletellyFileParse(e.target.files[0], record);
        }
    };

    const handletellyFileParse = (files, record) => {
        // If user clicks the parse button without
        // a file we show a error

        // Initialize a reader which allows user
        // to read any file or blob.
        const reader = new FileReader();

        // Event listener on reader when the file
        // loads, we parse it and set the data.
        reader.onload = async ({ target }) => {
            let fill = false;
            let arrD = [];
            let finalArr = [];
            const csv = Papa.parse(target.result, {
                header: true,
                skipEmptyLines: true,
            });
            const parsedData = csv?.data;
            let result = [];
            if (Object.keys(parsedData[0])[0] === 'PASSIM TECHNOLOGIES') {

                for (let i = 0; i < parsedData.length; i++) {
                    let arr = parsedData[i]?.['PASSIM TECHNOLOGIES'];
                    if (arr.split('-').length === 3 || arr.split('/').length === 3 || arr.split('.').length === 3) {
                        if (fill === false) {
                            fill = true;
                            arrD.push(parsedData[i]);
                        } else {
                            finalArr.push(arrD);
                            arrD = [];
                            arrD.push(parsedData[i]);
                        }
                    } else {
                        if (fill) {
                            arrD.push(parsedData[i]);
                        }
                    }
                }
                finalArr.push(arrD);
                try {
                    let main = [];

                    for (let i = 0; i < finalArr.length; i++) {
                        var obj = {
                            date: [],
                            company: [],
                            employee: [],
                            product: [],
                            invoice: [],
                            totalPcs: [],
                            tax: [],
                            netAmount: [],
                            monthId: [],
                            //   startDate: [],
                            //   endDate:[],
                            productPrize: [],
                            //   neww :[]
                        };
                        obj.monthId.push(record?._id)
                        // obj.startDate.push(state[0]?.startDate)
                        // obj.endDate.push(state[0]?.endDate)
                        if (finalArr[i].filter((ele) => ele?._1.split(" ")[1] === "PCS" || ele?._1.split(" ")[1] === "BOX" || ele?._1.split(" ")[1] === "KGS")) {
                            var filterArr = finalArr[i].filter((ele) => ele?._1.split(" ")[1] === "PCS" || ele?._1.split(" ")[1] === "BOX" || ele?._1.split(" ")[1] === "KGS")
                        }
                        for (let j = 0; j < finalArr[i].length; j++) {
                            if (finalArr[i][j]?.["PASSIM TECHNOLOGIES"] !== "") {
                                obj.date.push(new Date(finalArr[i][j]?.["PASSIM TECHNOLOGIES"]).toString());
                            }
                            if (finalArr[i][0]?.[""] !== "" && finalArr[i][0]?.[""] !== obj?.company[0]) {
                                obj.company.push(finalArr[i][0]?.[""])
                            }
                            if (finalArr[i][1]?._1 !== "" && finalArr[i][1]?._1 !== obj?.invoice[0]) {
                                obj.invoice.push(finalArr[i][1]?._1);
                            }
                            if (finalArr[i][0]?._7 !== "" && finalArr[i][0]?._7 !== obj?.netAmount[0]) {
                                obj.netAmount.push(finalArr[i][0]?._7);
                            }
                            if (
                                finalArr[i][2]?.[""] !== "" &&
                                finalArr[i][2]?.[""] !== obj.employee[0]
                            ) {
                                obj.employee.push(finalArr[i][2]?.[""]);
                            }
                            if (finalArr[i][j]?._8 !== "") {
                                obj.tax.push(finalArr[i][j]?._8);
                            }
                            if (filterArr[j]?.[""] !== "" && j < filterArr.length) {
                                obj.product.push(filterArr[j]?.[""])
                            }
                            if (filterArr[j]?._1 !== "" && j < filterArr.length) {
                                obj.totalPcs.push(filterArr[j]?._1)
                            }
                            if (filterArr[j]?._3 !== "" && j < filterArr.length) {
                                obj.productPrize.push(filterArr[j]?._3)
                            }

                            if (finalArr[i][j]?.[""] == "IGST OUTPUT" || finalArr[i][j]?.[""] == "SGST OUTPUT") {
                                break;
                            }
                        }
                        main.push(obj);
                        obj = {
                            date: [],
                            company: [],
                            employee: [],
                            product: [],
                            invoice: [],
                            totalPcs: [],
                            tax: [],
                            netAmount: [],
                            monthId: [],
                            productPrize: [],
                        };
                    }

                    let response = main.map((ele, ind) => {
                        if (getepochTIme(state[0].startDate) <= getepochTIme(ele?.date[0]) && getepochTIme(state[0].endDate) >= getepochTIme(ele?.date[0])) {
                            return ele
                        }
                    })
                    let filterres = response.filter((ele) => ele)
                    if (filterres.length) {
                        dispatch(UploadSecondReport(filterres));
                    }
                    else {
                        ToastHandle("error", "Please choose correct file with selected date")
                    }
                    setFile("")
                } catch (error) {
                    ToastHandle("error", "Please choose correct file")
                }
            }
            else {
                ToastHandle("error", "Please choose correct file")
            }
        };
        reader.readAsText(files);
    };

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handlesave = () => {
        setDateRange(false);
        document.getElementById(tallyId).click();
    };
    const handleUploadTallyClick = (ind, rec) => {
        let dat = rec.date;
        setState([
            {
                startDate: subDays(new Date(dat), 0),
                endDate: addDays(new Date(dat), 0),
                key: 'selection',
            },
        ]);

        setDateRange(true);
        setTallyId(ind);
    };


    useEffect(() => { }, [render]);
    useEffect(() => {
        if (successHandle?.loading) {
            setLoader(true)
        }
        else if (creditNoteSuccess?.loading) {
            setLoader(true)
        }
        else if (getMonths?.loading) {
            setLoader(true)
        }
        else if (salaryExpansesSuccess?.loading) {
            setLoader(true)
        }
        else if (rateDifferenceSuccess?.loading) {
            setLoader(true)
        }
        else {
            setLoader(false)
        }
    }, [successHandle, creditNoteSuccess])


    useEffect(() => {
        if (successHandle?.status == 201) {
            ToastHandle("success", "Uploaded Successfully 👍")
        }
        else if (successHandle?.status == 401) {
            ToastHandle("error", successHandle?.message)
        }
        else if (creditNoteSuccess?.status == 200) {
            ToastHandle("success", "Uploaded Successfully 👍")
        }
        else if (creditNoteSuccess?.status == 401) {
            ToastHandle("error", creditNoteSuccess?.message)
        }
        else if (salaryExpansesSuccess?.status == 201) {
            ToastHandle("success", "Uploaded Successfully 👍")
        }
        else if (rateDifferenceSuccess?.status == 200) {
            ToastHandle("success", "Uploaded Successfully 👍")
        }
        else if (rateDifferenceSuccess?.status == 401) {
            ToastHandle("error", rateDifferenceSuccess?.message)
        }
        else if (rateDifferenceSuccess?.status == 400) {
            ToastHandle("error", "something went wrong")
        }
        else if (salaryExpansesSuccess?.status == 401) {
            ToastHandle("error", salaryExpansesSuccess?.message)
        }
        else if (creditNoteSuccess?.status == 400) {
            ToastHandle("error", "something went wrong")
        }
        else if (successHandle?.status == 400) {
            ToastHandle("error", "something went wrong")
        }
        else if (salaryExpansesSuccess?.status == 400) {
            ToastHandle("error", "something went wrong")
        }

    }, [successHandle, creditNoteSuccess, salaryExpansesSuccess, rateDifferenceSuccess])


    return (
        <>
            <Row>
                <Col className="" lg={12} xs={12}>
                    <Card>
                        <Card.Body className='card-body my-0  pb-0'>
                            {loader ? (
                                <MainLoader />
                            ) : (
                                <Table className="table-centered mb-0 overflow-auto">
                                    <thead className="table-dark">
                                        <tr>
                                            <th>Month</th>
                                            <th>Tally Report</th>

                                            <th>
                                                <div>
                                                    <span> Salary + Exp</span>
                                                    <span className="ms-2">
                                                        <Link to="https://seekh.s3.us-east-2.amazonaws.com/Salary+%2B+Expenses.csv" download>  <i className="dripicons-download"></i></Link>
                                                    </span>
                                                </div>{' '}
                                            </th>
                                            <th>Credit Note</th>
                                            {/* <th>Product Return</th> */}
                                            <th>Rate Difference</th>
                                            {/* <th>Check Bounce</th> */}
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tableData?.map((record, index) => {
                                            return (
                                                <tr className={record?.status && 'activetable'} key={index}>
                                                    <th
                                                        className={record?.status ? 'activemonthtable' : 'month_color '}
                                                        scope="row">
                                                        {record.month}
                                                    </th>
                                                    {/* Tally REport */}
                                                    <td>
                                                        <input
                                                            type="file"
                                                            accept=".csv"
                                                            value={file}
                                                            style={{ display: 'none' }}
                                                            disabled={record.status ? false : true}
                                                            id={`tally${index}`}
                                                            onChange={(e) => {
                                                                handleTallyChange(e, record);
                                                            }}
                                                        />
                                                        <label>
                                                            <Button
                                                                disabled={record.status ? false : true}
                                                                variant="contained"
                                                                color="primary"
                                                                component="span"
                                                                onClick={() => handleUploadTallyClick(`tally${index}`, record)}
                                                            >
                                                                Upload
                                                            </Button>
                                                        </label>
                                                    </td>
                                                    {/* Salary + Exp */}
                                                    <td>
                                                        <input
                                                            type="file"
                                                            accept="csv"
                                                            style={{ display: 'none' }}
                                                            disabled={record.status ? false : true}
                                                            id={`salary${index}`}
                                                            onChange={(e) => (handleSalaryUpload(e, record))}
                                                        />
                                                        <label htmlFor={`salary${index}`}>
                                                            <Button
                                                                disabled={record.status ? false : true}
                                                                variant="contained"
                                                                color="primary"
                                                                component="span"
                                                                onClick={() => handleUploadTallyClick(`salary${index}`, record)}
                                                            >
                                                                Upload
                                                            </Button>
                                                        </label>
                                                    </td>
                                                    {/* Cerdit Note */}
                                                    <td>
                                                        <input
                                                            type="file"
                                                            accept=".csv"
                                                            value={file}
                                                            style={{ display: 'none' }}
                                                            disabled={record.status ? false : true}
                                                            id={`credit${index}`}
                                                            onChange={(e) => (handleCreditNote(e, record))}
                                                        />
                                                        <label htmlFor={`credit${index}`}>
                                                            <Button
                                                                disabled={record.status ? false : true}
                                                                variant="contained"
                                                                color="primary"
                                                                component="span"
                                                                onClick={() => handleUploadTallyClick(`credit${index}`, record)}
                                                            >
                                                                Upload
                                                            </Button>
                                                        </label>
                                                    </td>
                                                    {/* Product REturn */}
                                                    {/* <td>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            style={{ display: 'none' }}
                                                            disabled={record.status ? false : true}
                                                            id={`product${index}`}
                                                    
                                                        />
                                                        <label htmlFor={`product${index}`}>
                                                            <Button
                                                                disabled={record.status ? false : true}
                                                                variant="contained"
                                                                color="primary"
                                                                component="span"
                                                           
                                                                >
                                                                Upload
                                                            </Button>
                                                        </label>
                                                    </td> */}
                                                    {/* Rate Difference */}
                                                    <td>
                                                        <input
                                                            type="file"
                                                            accept=".csv"
                                                            value={file}
                                                            style={{ display: 'none' }}
                                                            disabled={record.status ? false : true}
                                                            id={`rate${index}`}
                                                            onChange={(e) => (handleRateDifference(e, record))}
                                                        />
                                                        <label htmlFor={`rate${index}`}>
                                                            <Button
                                                                disabled={record.status ? false : true}
                                                                variant="contained"
                                                                color="primary"
                                                                component="span"
                                                                onClick={() => handleUploadTallyClick(`rate${index}`, record)}
                                                            >
                                                                Upload
                                                            </Button>
                                                        </label>
                                                    </td>
                                                    {/* Check Bounce */}
                                                    {/* <td>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            style={{ display: 'none' }}
                                                            disabled={record.status ? false : true}
                                                            id={`check${index}`}
                                                    
                                                        />
                                                        <label htmlFor={`check${index}`}>
                                                            <Button
                                                                disabled={record.status ? false : true}
                                                                variant="contained"
                                                                color="primary"
                                                                component="span"
                                                           
                                                                >
                                                                Upload
                                                            </Button>
                                                        </label>
                                                    </td> */}
                                                    <td>
                                                        <Form.Check
                                                            type="switch"
                                                            id="custom-switch"
                                                            checked={record?.status}
                                                            onChange={() => {
                                                                handleButtonChange(record);
                                                            }}
                                                        />
                                                    </td>


                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Modal show={show} onHide={handleClose}>
                {/* <Modal.Header closeButton> */}

                {/* </Modal.Header> */}
                <Modal.Body>
                    <Row>
                        <Col className="text-end" lg={12}>
                            <CloseButton onClick={handleClose} />
                        </Col>
                        <Col className="ms-3 mt-2" lg={12}>
                            Are you sure you want {changeItem?.status === true ? "Devaticated" : "Activated"} to  this month?
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={12}>
                            <Row>
                                <Col className="text-end mt-3" lg={10}>
                                    <Button variant="secondary" onClick={handleModalYes}>
                                        Yes
                                    </Button>
                                </Col>
                                <Col className="text-end mt-3" lg={2}>
                                    <Button variant="primary" onClick={handleClose}>
                                        NO
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Modal.Body>
            </Modal>

            <Modal
                dialogClassName="date-range-modal"
                size={'sm '}
                centered={true}
                show={dateRangeShow}
                onHide={handleCloseDateRanges}>
                <ModalHeader closeButton></ModalHeader>
                <Modal.Body>
                    <DateRangePicker
                        onChange={handleOnChange}
                        showSelectionPreview={true}
                        moveRangeOnFirstSelection={false}
                        showMonthArrow={false}
                        ranges={state}
                        showMonthAndYearPickers={false}
                        direction="horizontal"
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="primary" onClick={handlesave}>
                        Next
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default UploadDashBoardPage;
