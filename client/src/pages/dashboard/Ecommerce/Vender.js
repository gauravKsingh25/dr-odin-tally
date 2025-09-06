import React, { useState, useEffect } from 'react'
import { Card, Table, Button, Row, Col, } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import MainLoader from '../../../components/MainLoader';

function Vender() {
    const store = useSelector((state) => state)
    const [vendorList, setvendorList] = useState([])
    const loaderHandel = store?.VendorListReducer;

    const handleVendorShow = (ind) => {
        setvendorList(vendorList?.map((ele, index) => ind === index ? { ...ele, show: !ele.show } : { ...ele, show: false }))
    }
    const truncate = (value, length) => {
        if (value?.length > length) {
            return value?.slice(0, length) + "..."
        }
        else {
            return value
        }
    }
    useEffect(() => {
        setvendorList(store?.VendorListReducer?.vendorreport?.response)
    }, [store])
    const INR_Format = (x) => {
        return new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(x)
    }
    function average(a, b) {
        // let c = b.split(" ")[0]
        let aver = a / b
        return Math.round(aver)
    }
    return (
        <>
            <Card className='h-100 '>
                <Card.Body className=''>
                    <Row>
                        <Col lg={12} md={12} sm={12} xs={12} className='pb-2'>
                            <Row>
                                <Col lg={8} md={9} sm={12} xs={12}>
                                    <h4 className="header-title mt-1 ">Vendor Report</h4>
                                </Col>
                                <Col className="text-end show-desktop" lg={4} md={3} >
                                    <Link to="/vendorList">  <Button className="btn btn-primary ms-auto pt-0 pb-0 ps-1 pe-1  ">
                                        <i className="dripicons-arrow-thin-right"></i></Button></Link>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    {loaderHandel?.loading ? <MainLoader /> :
                        <Table hover responsive className="mb-0 " size="sm">
                            <thead className='bg-primary' >
                                <th className='' >
                                    <h5 className='text-white'>#</h5>
                                </th>
                                <th className=' text-nowrap'>
                                    <h5 className='text-white '> Vendor Name</h5>
                                </th>

                                <th className=''>
                                    <h5 className='text-white '>Qty</h5>
                                </th>
                                <th className=''>
                                    <h5 className='text-white '>Amount</h5>
                                </th>
                                <th className=''>
                                    <h5 className='text-white '>Average</h5>
                                </th>
                            </thead>
                            <tbody>
                                {vendorList?.slice(0, 10)?.map((ele, ind) => <tr>
                                    <td>
                                        <h6 className="font-12 my-1 fw-normal">{ind + 1}</h6>
                                    </td>
                                    {!ele.show ? <td>
                                        <h6 style={{ cursor: "pointer" }} className="font-12 my-1 fw-normal " onClick={() => handleVendorShow(ind)}>{truncate(ele?.Vendor, 30)}</h6>
                                    </td> : <td>
                                        <h6 style={{ cursor: "pointer" }} className="font-12 my-1 fw-normal " onClick={() => handleVendorShow(ind)}>{ele?.Vendor}</h6>
                                    </td>}
                                    <td>
                                        <h6 className="font-12 my-1 fw-normal">{ele?.Quantity}</h6>
                                    </td>
                                    <td>
                                        <h6 className="font-12 my-1 fw-normal">₹{INR_Format(ele?.Amount)}</h6>
                                    </td>
                                    <td>
                                        <h6 className="font-12 my-1 fw-normal">{average(ele?.Amount, ele?.Quantity)}</h6>
                                    </td>

                                </tr>)}
                            </tbody>
                        </Table>}
                </Card.Body>
            </Card>
        </>
    )
}

export default Vender