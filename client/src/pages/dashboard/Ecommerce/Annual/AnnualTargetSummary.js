import React, { useRef, useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AnnualTargetSummary = ({data}): React$Element<any> => {
    const chartRef = useRef(null);
    const [chartData, setChartData] = useState({
        datasets: [],
    });

    function createGradient(ctx: CanvasRenderingContext2D, area: ChartArea) {
        const gradientStroke = ctx.createLinearGradient(0, 500, 0, 150);
        gradientStroke.addColorStop(0, '#fa5c7c');
        gradientStroke.addColorStop(1, '#727cf5');
        return gradientStroke;
    }

    useEffect(() => {
        const chart = chartRef.current;

        if (!chart) {
            return;
        }

        const chartData = {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'Month Target',
                    backgroundColor: createGradient(chart.ctx, chart.chartArea),
                    borderColor: createGradient(chart.ctx, chart.chartArea),
                    hoverBackgroundColor: createGradient(chart.ctx, chart.chartArea),
                    hoverBorderColor: createGradient(chart.ctx, chart.chartArea),
                    categoryPercentage: 0.5,
                    barPercentage: 0.8,
                    data:data?.map((ele,ind)=>ele?.Target[0]),
                    // data: [65, 59, 80, 81, 56, 89, 40, 32, 65, 59, 80, 81],
                },
                {
                    label: 'Revenue',
                    backgroundColor: '#e3eaef',
                    borderColor: '#e3eaef',
                    hoverBackgroundColor: '#e3eaef',
                    hoverBorderColor: '#e3eaef',
                    categoryPercentage: 0.5,
                    barPercentage: 0.8,
                    data:data?.map((ele,ind)=>ele?.Revenue)
                    // data: [89, 40, 32, 65, 59, 80, 81, 56, 89, 40, 65, 59],
                },
                
            ],
        };

        setChartData(chartData);
    }, [data]);

    // options
    const barChartOpts = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                bodyFontSize: 14,
                displayColors: true,
                callbacks:{
                    label:function(item){
                        return "₹"+INR_Format(item?.raw)
                    }
                }
            },
        },
        scales: {
            y: {
                grid: {
                    display: false,
                    color: 'rgba(0,0,0,0.05)',
                },
                stacked: false,
                ticks: {
                    // stepSize: 100,
                    callback: function(label, index, labels) {
                        return "₹"+INR_Format(label)}
                },
               
            },
            x: {
                stacked: false,
                grid: {
                    color: 'rgba(0,0,0,0.05)',
                },
            },
        },
    };
    const INR_Format = (x)=>{
        return new Intl.NumberFormat('en-IN', { currency: 'INR' }).format(x)
    }

    return (
        // <Card>
            // <Card.Body>
            <>

                <div style={{ height: '400px' }} className="chartjs-chart">
                    <Bar ref={chartRef} data={chartData} options={barChartOpts} />
                </div>
            </>
            // {/* </Card.Body> */}
        // </Card>
    );
};

export default AnnualTargetSummary;
