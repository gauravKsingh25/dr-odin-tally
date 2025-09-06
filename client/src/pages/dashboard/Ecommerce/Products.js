//@flow
import React from 'react';
import { Card, Table ,Col,Button,Row} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import Tooltip from 'react-bootstrap/Tooltip';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import { useSelector } from 'react-redux';
import MainLoader from '../../../components/MainLoader';
const Products = (): React$Element<any> => {
    const store = useSelector((state)=>state)
    const loaderHandel = store?.SaleExecutiveReportReducer;
    const INR_Format = (x)=>{
        return new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(x)
    }
    return (
        <Card className='h-100'>
            <Card.Body>
                {/* <Link to="#" className="float-end">
                    Export <i className="mdi mdi-download ms-1"></i>
                </Link> */}
                   {/* <Col  className="text-end pe-3" lg={12}>
                   <Link to = "/annual-sale-graph"> <Button  className="btn btn-primary ">
                    <i className="dripicons-arrow-thin-right"></i> 
                    </Button></Link>
                    </Col> */}
                    <Row>
                <Col lg={12}  md={12} sm={12} xs={12} className='pb-2'>
                    <Row>
                     <Col lg={8}  md={9} sm={12} xs={12}>
                     <h4 className="header-title mt-1 ">Sales Executive Report</h4>
                     </Col>
                    <Col  className="text-end show-desktop"lg={4}  md={3}>
                    <Link to = "/sale-executive-report">    <Button  className="btn btn-primary ms-auto pt-0 pb-0 ps-1 pe-1  ">
                        <i className="dripicons-arrow-thin-right"></i></Button></Link>
                    </Col>
                </Row>
            </Col>
            </Row>
            {loaderHandel?.loading?
                <div className='d-flex justify-content-center align-items-center my-auto'>
                <MainLoader/>
                </div>:
                <Table width="800px" hover responsive className="mb-0 table_hoveWork" size="sm">
                <thead className='bg-primary'>
                    <th width="100px">
                        <h5 className='text-white text-start'>#</h5>
                    </th>
                    <th width="100px">
                        <h5 className='text-white text-start'>Name</h5>
                    </th>
                    <th width="100px">

                        <h5 className='text-white text-start'>TOT</h5>

                    </th>
                    <th width="100px">
                        <h5 className='text-white text-start'>TGT</h5>
                    </th>
                    <th width="100px">
                        <h5 className='text-white text-start'>Achievement</h5>
                    </th>
                    
                    <th width="100px">
                    <OverlayTrigger
          key={"top"}
          placement={"top"}
          overlay={
            <Tooltip id={`tooltip-${"on"}`}>
              Total Expenditure 
            </Tooltip>
          }
        >
          <h5 className='text-white text-start'> TE</h5>
        </OverlayTrigger>
        </th>
        <th width="100px">
                    <OverlayTrigger
          key={"top"}
          placement={"top"}
          overlay={
            <Tooltip id={`tooltip-${"on"}`}>
              Total Achivement 
            </Tooltip>
          }
        >
          <h5 className='text-white text-start'> TA(%)</h5>
        </OverlayTrigger>
        </th>
                </thead>
               
                             <tbody >
                       {store?.SaleExecutiveReportReducer?.salerexecutivereport?.response?.slice(0,40)?.map((ele,ind)=> <tr>
                            <td width="100px">

                                <h6 className="font-12 my-1 fw-normal text-start ">{ind+1}</h6>
                            </td>
                            <td width="100px">
                                <h6 className="font-12 my-1 fw-normal text-nowrap text-start">{ele?.empName}</h6>
                            </td>
                            <td width="100px">
                                <h6 className="font-12 my-1 fw-normal text-nowrap txt_showDots custom_width text-start">{ele?.state?.state}</h6>
                            </td>
                            <td width="100px">
                                <h6 className="font-12 my-1 fw-normal  text-nowrap txt_showDots custom_width text-start">₹{INR_Format(ele?.mnthtarget)}</h6>
                            </td>
                            <td width="100px">
                                <h6 className="font-12 my-1 fw-normal  text-nowrap txt_showDots custom_width text-start">₹{INR_Format(ele?.totalAmount)}</h6>
                            </td>
                            <td width="100px">
                                <h6 className="font-12 my-1 fw-normal  text-nowrap txt_showDots custom_width text-start">₹{INR_Format(ele?.expenses)}</h6>
                            </td>
                            <td width="100px">
                                <h6 className="font-12 my-1 fw-normal text-nowrap txt_showDots custom_width text-start">{ele?.achivement} % </h6>

                            </td>
                        </tr>)}

                     

                      
                        
                    </tbody>
                </Table>}
            </Card.Body>
        </Card>
    );
};

export default Products;
