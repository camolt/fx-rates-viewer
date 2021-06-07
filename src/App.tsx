import React, { FC, useEffect, useState } from 'react';
import './App.scss';
import { ApiMethodType, request } from './utils';
import { Table, Select, Menu, Spin, InputNumber } from 'antd';

interface LatestResponse {
    rates: {
        [key: string]: number;
    }
};


const App: FC<{ props?: any }> = ({ props }) => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [current, setcurrent] = useState<string>('');
    const [latest, setLatest] = useState<LatestResponse>();
    console.log(`props`, props);

    useEffect(() => {
        async function fetchMyAPI() {
            let res: LatestResponse = await request('latest', { method: ApiMethodType.GET })
            console.log(`response`, res);
            setLatest(res);
        }

        fetchMyAPI();
    }, []);


    const columns = [
        {
            title: 'Currency',
            dataIndex: 'currency',
            key: 'currency',
            render: (text: String) => <a>{text}</a>,
        },
        {
            title: 'Rate',
            dataIndex: 'rate',
            key: 'rate',
        },
        {
            title: 'Amount',
            dataIndex: 'amount',
            key: 'amount',
        },
    ];

    const data = latest && Object.keys(latest.rates).map((key, idx) => {
        return {
            key: idx,
            title: key,
            rate: latest.rates[key],
        }
    });

    const handleClick = () => {

    }

    const { Option } = Select;

    function onChange(value: any) {
        console.log(`selected ${value}`);
    }

    function onAmountChange(value: any) {
        console.log(`onAmountChange ${value}`);
    }

    function onBlur() {
        console.log('blur');
    }

    function onFocus() {
        console.log('focus');
    }

    function onSearch(val: any) {
        console.log('search:', val);
    }


    return (
        <div className="App">
            <Menu onClick={handleClick} selectedKeys={[current]} mode="horizontal">
                <Menu.Item key="mail" >
                    Current rates
                </Menu.Item>
                <Menu.Item key="app" >
                    Historical rates
                    </Menu.Item>
            </Menu>
            <div className="container">
                <InputNumber min={1} max={10} defaultValue={3} onChange={onAmountChange} />
                <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="Select a currency"
                    optionFilterProp="children"
                    onChange={onChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    onSearch={onSearch}
                    filterOption={(input, option) =>
                        option?.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                >
                    <Option value="jack">Jack</Option>
                    <Option value="lucy">Lucy</Option>
                    <Option value="tom">Tom</Option>
                </Select>
                {data ? <Table columns={columns} dataSource={data} /> : <Spin size="large" />}
            </div>
        </div>
    );
}

export default App;
