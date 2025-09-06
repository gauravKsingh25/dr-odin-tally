import React,{useEffect,useState} from 'react'
import { Row, Col, Card, Table,Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useSelector,useDispatch } from 'react-redux';
import MainLoader from '../../../../../components/MainLoader';
import { getBdeWestAction } from '../../../../../redux/actions';
function West() {
    const dispatch = useDispatch()
        const store = useSelector((state)=>state)
        const [fullwestmode,setFullWestmode] = useState(false)
      const[westdata,setWestData] = useState([])
      const loaderHandel = store?.WestZoneReportReducer;
      const bdeData = store?.BdeWestListReducer  
      const INR_Format = (x)=>{
        return new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(x)
    }
    const handleEpandRow = (event, userId) => {
        let res = {
            ...westdata,
            response: westdata?.response?.map((ele) =>
                ele?.mid === userId ? { ...ele, show: !ele?.show } : { ...ele,show:false }
            ),
        };
        setWestData(res);
        dispatch(getBdeWestAction(userId));
    };
      useEffect (()=>{
        if (loaderHandel?.westzonereport.status===200) {
            
            setWestData(store?.WestZoneReportReducer?.westzonereport)
        }
        },[loaderHandel?.westzonereport.status])
  return (
  <>
    
  <Card>

            <Card.Body>
                <h1 className="header-title text-center font-20"> WEST ZONE - {loaderHandel?.westzonereport?.HeadOfZone?.name} </h1>
                {/* <div className='d-flex align-items-center justify-content-end '>
                <Button className="py-2 px-2" style={{borderRadius:"50%" ,backgroundColor:"rgb(166, 179, 195)" , borderColor:" rgb(166, 179, 195)"}}></Button>
                <h5 className='ps-1'> Manager</h5>
                </div> */}
                <Table responsive className="table-centered mb-0  mt-2 " size="sm">
                            <thead className="table-dark">
                                <tr>
                                    <th>Name</th>
                                    <th>Designation</th>
                                    <th>Salary Exp.</th>
                                    <th> Expense</th>
                                    <th> Total Expenditure</th>
                                    <th> Ytd </th>
                                    <th> Ytd Ach </th>
                                    <th> Ytd % </th>
                                    <th> BDE </th>
                                </tr>
                            </thead>
                            <tbody>
                                {westdata?.response?.map((ele) => (
                                    <>
                                        <tr    
                                            key={ele?.mid}
                                            style={{ backgroundColor: ele?.color, color: 'black', fontWeight: '600' }}>
                                            <td scope="row">{ele?.name}</td>
                                            <td>{ele?.dsgn}</td>
                                            <td>₹{INR_Format(ele?.slry)}</td>
                                            <td>₹{INR_Format(ele?.expns)}</td>
                                            <td>₹{INR_Format(ele?.totExp)}</td>
                                            <td>₹{INR_Format(ele?.ytrgt)}</td>
                                            <td>₹{INR_Format(ele?.ytdAch)}</td>
                                            <td>{INR_Format(ele?.totAchPer)} %</td>

                                            <td
                                               
                                                    variant="link"
                                                    onClick={(event) => handleEpandRow(event, ele?.mid)}>
                                                 <i style = {{cursor:"pointer"}} className={ele?.show?'  dripicons-chevron-up font-20  ':'  dripicons-chevron-down font-20  '}></i>
                                               
                                            </td>
                                        </tr>
                                        <>
                                            {ele.show ? (
                                                <>
                                               
                                                    {  bdeData.loading ? (
                                                        <>
                                                        <tr>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                            <td></td>
                                                        <MainLoader />
                                                        <td></td>
                                                        </tr>
                                                        </>
                                                    ) : (
                                                        <>
                                                            {bdeData.bdelist?.response?.length>0 && bdeData.bdelist?.response?. map(
                                                                (ele, ind) => {
                                                                    return (
                                                                        <tr
                                                                            key={ind}
                                                                            style={{
                                                                                backgroundColor: ele?.color,
                                                                                color: 'black',
                                                                                fontWeight: '600',
                                                                            }}>
                                                                            <td scope="row">{ele?.name}</td>
                                                                            <td>{ele?.dsgn}</td>
                                                                            <td>₹{INR_Format(ele?.salary)}</td>
                                                                            <td>₹{INR_Format(ele?.expns)}</td>
                                                                            <td>₹{INR_Format(ele?.totExp)}</td>
                                                                            <td>₹{INR_Format(ele?.ytrgt)}</td>
                                                                            <td>₹{INR_Format(ele?.ytdAch)}</td>
                                                                            <td>{INR_Format(ele?.totYtdPer)} %</td>
                                                                        </tr>
                                                                    );
                                                                }
                                                            )}
                              {bdeData.bdelist?.response?.length>0 &&   <tr style={{   backgroundColor:'rgb(183 188 188)',
                                                                                color: 'black',
                                                                                fontWeight: '600',
                                                                            }}>
                                                            <td className='fw-bold' scope="row" >TOTAL</td>
                                <td className='fw-bold'></td>
                                <td className='fw-bold '>₹{INR_Format(bdeData?.bdelist?.coltot[0]?.totSalary?bdeData?.bdelist?.coltot[0]?.totSalary:0)}</td>
                                <td className='fw-bold'>₹{INR_Format(bdeData?.bdelist?.coltot[0]?.totExpns?bdeData?.bdelist?.coltot[0]?.totExpns:0) }</td>
                                <td className='fw-bold'>₹{INR_Format(bdeData?.bdelist?.coltot[0]?.totExpenditure?bdeData?.bdelist?.coltot[0]?.totExpenditure:0)}</td>
                                <td className='fw-bold'>₹{INR_Format(bdeData?.bdelist?.coltot[0]?.totYtd?bdeData?.bdelist?.coltot[0]?.totYtd:0)}</td>
                                <td className='fw-bold'>₹{INR_Format(bdeData?.bdelist?.coltot[0]?.totYtdAch?bdeData?.bdelist?.coltot[0]?.totYtdAch:0) }</td>
                                <td className='fw-bold'>{INR_Format(bdeData?.bdelist?.coltot[0]?.totYtdPer?bdeData?.bdelist?.coltot[0]?.totYtdPer :0)} %</td>
                                <td></td>
                                </tr>}
                                                        </>
                                                    )}{' '}
                                                </>
                                            ) : null}
                                        </>
                                    </>
                                ))}
                                <tr className="table-dark">
                                    <th>TOTAL</th>
                                    <th>{westdata?.HeadOfZone?.dsgn}</th>
                                    <th>₹ {INR_Format(westdata?.HeadOfZone?.slry?westdata?.HeadOfZone?.slry:0)}</th>
                                    <th>₹ {INR_Format(westdata?.HeadOfZone?.expns?westdata?.HeadOfZone?.expns:0)}</th>
                                    <th>₹ {INR_Format(westdata?.HeadOfZone?.totExpenditure?westdata?.HeadOfZone?.totExpenditure:0)}</th>
                                    <th>₹ {INR_Format(westdata?.HeadOfZone?.ytrgt?westdata?.HeadOfZone?.ytrgt:0)} </th>
                                    <th>₹ {INR_Format(westdata?.HeadOfZone?.totAch?westdata?.HeadOfZone?.totAch:0)}</th>
                                    <th> {INR_Format(westdata?.HeadOfZone?.totAchPer?westdata?.HeadOfZone?.totAchPer:0)} %</th>
                                    <th> </th>
                                </tr>
                            </tbody>
                        </Table>
            </Card.Body>
          

        </Card>
  </>
  )
}

export default West