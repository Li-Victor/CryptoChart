// @flow

import * as React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  Brush,
  AreaChart,
  Area
} from 'recharts';
import isEqual from 'lodash.isequal';
import moment from 'moment';

type Props = {
  userList: Array<Currency>,
  colors: Array<string>
};

class Graph extends React.Component<Props> {
  shouldComponentUpdate(nextProps: { userList: Array<Currency> }) {
    return !isEqual(this.props.userList, nextProps.userList);
  }

  render() {
    if (this.props.userList.length === 0) {
      return (
        <h1 style={{ marginLeft: '24px' }}>
          Add a CryptoCurrency from the list and see an awesome graph!
        </h1>
      );
    }

    const list = this.props.userList.map(currency => JSON.parse(currency.metaData));
    let data = {};
    list.forEach(currency => {
      const currencyName = currency['Meta Data']['2. Digital Currency Code'];
      Object.entries(currency['Time Series (Digital Currency Daily)']).forEach(entry => {
        const date = new Date(entry[0]).valueOf();
        const price = Number(entry[1]['1a. open (USD)']);
        if (Object.prototype.hasOwnProperty.call(data, date)) {
          data[date].push({ [currencyName]: price });
        } else {
          data[date] = [{ [currencyName]: price }];
        }
      });
    });

    data = Object.entries(data)
      .map(entry => {
        const obj = {
          date: Number(entry[0])
        };
        entry[1].forEach(currency => {
          Object.entries(currency).forEach(currencyInfo => {
            const [currencyName, price] = currencyInfo;
            obj[currencyName] = price;
          });
        });
        return obj;
      })
      .reverse();

    return (
      <div className="line-charts" style={{ marginLeft: '24px' }}>
        <div className="line-chart-wrapper">
          <LineChart
            width={800}
            height={500}
            data={data}
            margin={{
              top: 40,
              right: 40,
              bottom: 20,
              left: 40
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              type="number"
              dataKey="date"
              domain={['dataMin', 'dataMax']}
              tickFormatter={date => moment(date).format('MM[/]DD[/]YY')}
              interval={0}
              tickCount={8}
            />
            <YAxis
              domain={['auto', 'auto']}
              label={{
                value: 'USD',
                angle: 0,
                position: 'left'
              }}
            />
            <Tooltip labelFormatter={date => moment(date).format('MM[/]DD[/]YY')} />
            <Legend />
            {list.map((currency, index) => (
              <Line
                key={currency['Meta Data']['2. Digital Currency Code']}
                dataKey={currency['Meta Data']['2. Digital Currency Code']}
                type="monotone"
                dot={false}
                connectNulls
                stroke={this.props.colors[index]}
              />
            ))}
            <Brush
              dataKey="date"
              startIndex={data.length - 90}
              tickFormatter={date => moment(date).format('MM[/]DD[/]YY')}
            >
              <AreaChart>
                {list.map((currency, index) => (
                  <Area
                    key={currency['Meta Data']['2. Digital Currency Code']}
                    dataKey={currency['Meta Data']['2. Digital Currency Code']}
                    stroke={this.props.colors[index]}
                    fill={this.props.colors[index]}
                    dot={false}
                  />
                ))}
              </AreaChart>
            </Brush>
          </LineChart>
        </div>
      </div>
    );
  }
}

export default Graph;
