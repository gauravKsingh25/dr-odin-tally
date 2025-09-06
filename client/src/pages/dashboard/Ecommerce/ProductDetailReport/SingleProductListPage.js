import React ,{useEffect,useState} from 'react'
import { Row, Col, Card, Table } from 'react-bootstrap';
import { useParams} from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux';
import { getProductDetailAction } from '../../../../redux/dashboard/actions';

const SingleProductListPage = () => {
    const store = useSelector((state) => state);
    const[data,setData] = useState([])
    const successHandle = store?.productDetailReportReducer
    const params = useParams()
    const dispatch = useDispatch();
    const {id } = params
  useEffect(() => {
    dispatch(getProductDetailAction(id))
}, [])
useEffect(() => {
  if(successHandle?.prductdetail.status==200){
    setData(store?.productDetailReportReducer?.prductdetail ?.response)
  }
}, [store])

const INR_Format = (x) => {
    return new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(x);
};
  return (
    
    <>
        
        <Card>
            <Card.Body>
            <p className='text-center fw-bold font-20'>{data[0]?.product}</p>
                <Table className="table-centered mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th>#</th>
                            <th>Date</th>
                            <th>Sales Person</th>
                            <th>Vendor</th>
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
                                    <td>{record.vendor}</td>
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

export default SingleProductListPage