import React, { FC, useEffect, useState, useRef } from 'react';
import './App.scss';
import { ApiMethodType, request, requestPayload } from './utils';
import { Table, Select, Menu, Spin, InputNumber, Form } from 'antd';

interface LatestResponse {
    rates: {
        [key: string]: number;
    }
    date?: string;
};

const daysBack = 7;

const App: FC<{ props?: any }> = ({ props }) => {
    const [current, setCurrent] = useState<string>('0');
    const [ratesInCurrent, setRatesInCurrent] = useState<any>('');
    const [historicalRates, setHistoricalRates] = useState<any>({});
    const [amount, setAmount] = useState<number>(0);
    const [masterCurrency, setMasterCurrency] = useState<string>('EUR');
    const [secondCurrency, setSecondCurrency] = useState<string>('');
    const [latest, setLatest] = useState<LatestResponse>({ rates: {} });
    const prevProps = usePrevious({ secondCurrency });

    function usePrevious(value: any) {
        const ref = useRef();
        useEffect(() => {
            ref.current = value;
        });
        return ref.current;
    }

    const { Option } = Select;

    async function fetchMyAPI(path: string, payload?: requestPayload) {
        let res: LatestResponse = await request(path, { method: ApiMethodType.GET }, payload)
        return res;
    }

    // componentDidMount
    useEffect(() => {
        fetchMyAPI('latest').then((res) => {
            setLatest(res);
            setRatesInCurrent(res.rates);
        });
    }, []);

    // Historical api endpoint trigger
    useEffect(() => {
        const today = new Date();
        if (current === '1' && secondCurrency && (prevProps as any).secondCurrency !== secondCurrency) {
            const promises: any = [];
            [...Array(daysBack).keys()].slice(1).forEach(day => {
                const dayInThePast = (new Date()).setDate(today.getDate() - day);
                const dateParsed = new Date(dayInThePast).toISOString().split('T')[0];
                promises.push(
                    fetchMyAPI(dateParsed, {
                        symbols: `${secondCurrency}`,
                    })
                );

                Promise.all(promises).then((resArr) => {
                    const historicalRatesObj: { [key: string]: any } = {};
                    resArr.forEach((res: any, idx) => {
                        historicalRatesObj[res.date] = res.rates;
                    });
                    setHistoricalRates({ ...historicalRatesObj });
                });

            })
        }
    }, [current, secondCurrency]); // eslint-disable-line react-hooks/exhaustive-deps

    function handleNavClick(e: any) {
        setCurrent(e.key);
    }

    function onAmountChange(value: any) {
        setAmount(value);
    }

    const getCurrentRatesScreen = () => {
        const currentData = latest && Object.keys(ratesInCurrent).map((key, idx) => {
            return {
                key: idx,
                currency: key,
                rate: ratesInCurrent[key],
                'amount': amount * ratesInCurrent[key]
            }
        });

        const getColumns = () => {
            const cols = [
                {
                    title: 'Currency',
                    dataIndex: 'currency',
                    key: 'currency',
                    render: (text: String) => text,
                },
                {
                    title: `Rate`,
                    dataIndex: 'rate',
                    key: 'rate',
                    render: (number: String) => Number(number).toPrecision(4)
                }
            ];

            amount > 0 && cols.push({
                title: 'Amount in foreign currency',
                dataIndex: 'amount',
                key: 'amount',
                render: (number: String) => Number(number).toLocaleString()
            });

            return cols;
        }

        return <Form
            initialValues={{
                masterCurrency: masterCurrency,
                amount: amount
            }}
        >
            <Form.Item
                label="Master currency"
                name="masterCurrency"
            >
                <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="Select a currency"
                    optionFilterProp="children"
                    onChange={(val) => {
                        setMasterCurrency(val as string);
                        const recalculatedRates: { [key: string]: number } = {};
                        const newCurrencyToEuro = latest?.rates[val] / 1;

                        latest?.rates && Object.keys(latest?.rates).forEach((rate, idx) => {
                            recalculatedRates[rate] = latest?.rates[rate] / newCurrencyToEuro;
                        });
                        console.log(`recalculatedRates`, recalculatedRates);
                        setRatesInCurrent(recalculatedRates);
                    }}
                    value={masterCurrency}
                >
                    {latest?.rates && Object.keys(latest.rates).map((currency, idx) => {
                        return <Option value={currency} key={`${currency}Option`}>{currency}</Option>
                    })}
                </Select>
            </Form.Item>
            {masterCurrency && <Form.Item
                label={`Amount in ${masterCurrency}`}
                name="amount"
            >
                <InputNumber min={0} onChange={onAmountChange} value={amount} />
            </Form.Item>}
            {currentData && masterCurrency && <Table columns={getColumns()} dataSource={currentData} />}
            {!currentData && <Spin size="large" />}
        </Form>;
    }

    const getHistoricalRateScreen = () => {
        console.log(`secondCurrency`, secondCurrency)
        const historicalData = historicalRates && Object.keys(historicalRates).map((key, idx) => {
            return {
                key: idx,
                date: key,
                rate: historicalRates[key][secondCurrency] || '',
            }
        });

        const getColumns = () => {
            const cols = [
                {
                    title: 'Date',
                    dataIndex: 'date',
                    key: 'date',
                    render: (text: String) => text,
                }
            ];

            if (secondCurrency) {
                cols.push(
                    {
                        title: `${secondCurrency}`,
                        dataIndex: 'rate',
                        key: 'rate',
                        render: (number: String) => Number(number).toPrecision(4)
                    }
                )
            }

            return cols;
        }
        return <Form
            initialValues={{ masterCurrency: masterCurrency, secondCurrency: secondCurrency }}
        >
            <Form.Item
                label="Master currency"
                name="masterCurrency"
            >
                <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="Select a currency"
                    optionFilterProp="children"
                    onChange={(val) => {
                        setMasterCurrency(val as string);
                        const recalculatedRates: { [key: string]: number } = {};
                        const newCurrencyToEuro = latest?.rates[val] / 1;

                        latest?.rates && Object.keys(latest?.rates).forEach((rate, idx) => {
                            recalculatedRates[rate] = latest?.rates[rate] / newCurrencyToEuro;
                        });
                        console.log(`recalculatedRates`, recalculatedRates);
                        setRatesInCurrent(recalculatedRates);
                    }}
                    value={masterCurrency}
                >
                    {latest?.rates && Object.keys(latest.rates).map((currency, idx) => {
                        return <Option value={currency} key={`${currency}Option`}>{currency}</Option>
                    })}
                </Select>
            </Form.Item>
            <Form.Item
                label="Second currency"
                name="secondCurrency"
            >
                <Select
                    showSearch
                    style={{ width: 200 }}
                    placeholder="Select a 2nd currency"
                    optionFilterProp="children"
                    onChange={(val) => {
                        setSecondCurrency(val as string);
                    }}
                    value={secondCurrency}
                >
                    {latest?.rates && Object.keys(latest.rates).map((currency, idx) => {
                        return <Option value={currency} key={`${currency}Option`}>{currency}</Option>
                    })}
                </Select>
            </Form.Item>
            {historicalRates && secondCurrency && <Table columns={getColumns()} dataSource={historicalData} />}
        </Form>;
    }

    return (
        <div className="App">
            <Menu onClick={handleNavClick} selectedKeys={[current]} mode="horizontal">
                <Menu.Item key="0" >
                    Current rates
                </Menu.Item>
                <Menu.Item key="1" >
                    Historical rates
                    </Menu.Item>
            </Menu>
            <div className="container">
                {current === '0' && getCurrentRatesScreen()}
                {current === '1' && getHistoricalRateScreen()}

            </div>
        </div>
    );
}

export default App;
