import React, { useEffect ,useState} from 'react'
import { useParams } from 'react-router-dom'
import { Row, Col, Card, Table } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getVendorDetailAction } from '../../../../redux/dashboard/actions';
function SingleVendorDetailPage() {
    const store = useSelector((state) => state);
    const params = useParams()
    const successHandle = store?.VendorDetailReportReducer
    const[data,setData] = useState([])
    const dispatch = useDispatch();
    const {id } = params
    useEffect(() => {
        dispatch(getVendorDetailAction(id)) 
    }, [])
    useEffect(() => {
      if(successHandle?.vendordetail?.status==200){
        setData(store?.VendorDetailReportReducer?.vendordetail?.response)
      }
    }, [successHandle])
    const INR_Format = (x) => {
        return new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(x);
    };
  return (
    
    <>
<Card>
            <Card.Body>
            <p className='text-center fw-bold font-20'>{data?.length>0 && data[0]?.vendor}</p>
                <Table className="table-centered mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th>#</th>
                            <th>Date</th>
                            <th>Sales Person</th>
                            <th>Product</th>
                            <th>Qty</th>
                            <th>Amount</th>
                            <th>Average</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data?.map((record, index) => {
                            return (
                                <tr key={index}>
                                    <th scope="row">{index+1}</th>
                                    <td>{record.date}</td>
                                    <td>{record.salesPerson}</td>
                                    <td>{record.product}</td>
                                    <td>{record.qty}</td>
                                    <td>₹{INR_Format(record.amount)}</td>
                                    <td>{record.average}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    </>
  )
}

export default SingleVendorDetailPage