// @flow
import React from 'react';
import { Card } from 'react-bootstrap';
import classNames from 'classnames';

type StatisticsWidgetProps = {
    textClass?: string,
    bgclassName?: string,
    icon?: string,
    title: string,
    description: string,
    stats?: string,
    trend: {
        textClass?: string,
        icon?: string,
        value?: string,
        time?: string,
    },
};

/**
 * Statistics widget
 */
const StatisticsWidget = (props: StatisticsWidgetProps): React$Element<any> => {
    const textClass = props.textClass || 'text-muted';

    return (
        <Card className={classNames('widget-flat m-0 h-100', props.bgclassName)}>
            <Card.Body className='m-0 p-0 py-3 px-2'>
                {props.icon && (
                    <div className='row'>
                        <div className='col-12 align-items-center justify-content-start'>
                            <div className='row'>
                            <div className='col-9 d-flex align-items-center justify-content-start'>
                        <h5 className={classNames('fw-bold text-nowrap', 'mt-0', textClass)} title={props.description}>
                    {props.title}
                </h5>
                        </div>
                        <div className='col-3 d-flex align-items-center justify-content-end'>
                        <i className={classNames(props.icon, 'widget-icon')}></i>
                        </div>
                            </div>
                        </div>
                       
                    </div>
                   
                )}
                <div className='col-12' >
                <h3 className={classNames('mt-4', 'mb-4','text-nowrap', props.textClass ? props.textClass : null)} style={{    fontSize: "22px"}}>
               {props.stats}  </h3>
                </div>
               
               
                {props.trend && (
                    <div className='col-12'>
  <p className={classNames('mb-0', textClass)}>
                        <span className={classNames(props.trend.textClass, 'me-1 text-nowrap')}>
                            <i className={classNames(props.trend.icon)}></i> {props.trend.value}
                        </span>
                        <span className="text-nowrap">{props.trend.time}</span>
                    </p>
                    </div>
                  
                )}
            </Card.Body>
        </Card>
    );
};

export default StatisticsWidget;
