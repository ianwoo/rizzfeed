import "./App.css";
import { useCallback, useEffect, useState } from "react";
import ReconnectingWebSocket from "reconnecting-websocket";

type Future = {
  ask: number;
  ask_size: number;
  bid: number;
  bid_size: number;
  change: number;
  dtm: number;
  feed: string;
  funding_rate: number;
  funding_rate_prediction: number;
  high: number;
  index: number;
  last: number;
  leverage: string;
  low: number;
  markPrice: number;
  maturityTime: number;
  next_funding_rate_time: number;
  open: number;
  openInterest: number;
  pair: string;
  post_only: boolean;
  premium: number;
  product_id: string;
  relative_funding_rate: number;
  relative_funding_rate_prediction: number;
  suspended: boolean;
  tag: string;
  time: number;
  volume: number;
  volumeQuote: number;
};

const coins: { symbol: string; label: string }[] = [
  { symbol: "XBT", label: "Bitcoin" },
  { symbol: "ETH", label: "Ethereum" },
  { symbol: "SOL", label: "Solana" },
  { symbol: "XRP", label: "Ripple" },
  { symbol: "ADA", label: "Cardano" },
  { symbol: "LTC", label: "Litecoin" },
  { symbol: "BCH", label: "Bitcoin Cash" },
  { symbol: "UNI", label: "Uniswap" },
];

function App() {
  //due to the nature of websockets vs. react hooks, we have to manually insert these with a function:
  const [BTCprice, setBTCprice] = useState<number | undefined>(undefined);
  const [ETHprice, setETHprice] = useState<number | undefined>(undefined);
  const [SOLprice, setSOLprice] = useState<number | undefined>(undefined);
  const [XRPprice, setXRPprice] = useState<number | undefined>(undefined);
  const [ADAprice, setADAprice] = useState<number | undefined>(undefined);
  const [LTCprice, setLTCprice] = useState<number | undefined>(undefined);
  const [BCHprice, setBCHprice] = useState<number | undefined>(undefined);
  const [UNIprice, setUNIprice] = useState<number | undefined>(undefined);

  const [futures, setFutures] = useState<{ [productId: string]: Future }>({});

  useEffect(() => {
    //SPOT
    const ws = new ReconnectingWebSocket("wss://ws.kraken.com/");

    ws.onopen = () => {
      const subscribeMessage = {
        event: "subscribe",
        pair: coins.map((coin) => `${coin.symbol}/USD`),
        subscription: { name: "ticker" },
      };
      ws.send(JSON.stringify(subscribeMessage));
      console.log("Subscribed to spot tickers");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data[3] === "XBT/USD") {
        setBTCprice(data[1].c[0]);
      } else if (data[3] === "ETH/USD") {
        setETHprice(data[1].c[0]);
      } else if (data[3] === "SOL/USD") {
        setSOLprice(data[1].c[0]);
      } else if (data[3] === "XRP/USD") {
        setXRPprice(data[1].c[0]);
      } else if (data[3] === "ADA/USD") {
        setADAprice(data[1].c[0]);
      } else if (data[3] === "LTC/USD") {
        setLTCprice(data[1].c[0]);
      } else if (data[3] === "BCH/USD") {
        setBCHprice(data[1].c[0]);
      } else if (data[3] === "UNI/USD") {
        setUNIprice(data[1].c[0]);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    //FUTURES
    // Define the WebSocket URL for Kraken's public futures prices
    const fws = new ReconnectingWebSocket("wss://futures.kraken.com/ws/v1");

    // Open WebSocket connection and subscribe to the ticker channel for ETH and BTC futures
    fws.onopen = () => {
      fws.send(
        JSON.stringify({
          event: "subscribe",
          feed: "ticker",
          product_ids: coins.map((coin: { symbol: string; label: string }) => `PF_${coin.symbol}USD`),
        })
      );
    };

    // Handle incoming WebSocket messages
    fws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      // Check if the message is a ticker update
      if (message.feed === "ticker") {
        setFutures((prevPrices) => ({
          ...prevPrices,
          [message.product_id]: message,
        }));
      }
    };

    // Handle WebSocket errors
    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      // setError("WebSocket error");
    };

    // Cleanup on unmount
    return () => {
      ws.close();
      fws.close();
    };
  }, []);

  const findHookBySymbol: (symbol: string) => number = useCallback(
    (symbol: string) => {
      switch (symbol) {
        case "XBT":
          return BTCprice ? BTCprice : 0;
        case "ETH":
          return ETHprice ? ETHprice : 0;
        case "SOL":
          return SOLprice ? SOLprice : 0;
        case "XRP":
          return XRPprice ? XRPprice : 0;
        case "ADA":
          return ADAprice ? ADAprice : 0;
        case "LTC":
          return LTCprice ? LTCprice : 0;
        case "BCH":
          return BCHprice ? BCHprice : 0;
        case "UNI":
          return UNIprice ? UNIprice : 0;
        default:
          return 0;
      }
    },
    [BTCprice, ETHprice, SOLprice, XRPprice, ADAprice, LTCprice, BCHprice, UNIprice]
  );

  return (
    <div className="rizz">
      <h3>Rizzfeed, the feed with rizz, made for Rizzi</h3>
      <table>
        <tr className="bold">
          <td className="big">Coin</td>
          <td className="big twocol">Contract</td>
          <td className="big threecol">Current Px</td>
          <td className="big twocol">Basis</td>
          <td className="big fivecol">Futures Info</td>
        </tr>

        <tr className="bold">
          <td>Ticker</td>
          <td>Name</td>
          <td>
            Open
            <br />
            Interest
          </td>
          <td>Bid</td>
          <td>Ask</td>
          <td>Mid</td>
          <td>Basis $</td>
          <td>Basis %</td>
          <td>Expiry</td>
          <td>
            Days
            <br />
            To <br />
            Expiry
          </td>
          <td>
            Hourly
            <br />
            Funding
          </td>
          <td>
            Funding
            <br />
            Predict
          </td>
          <td>
            Funding
            <br />
            Prediction
            <br />
            annualised
          </td>
        </tr>

        {coins.map((coin: { symbol: string; label: string }) => [
          <tr>
            <td className={`bold ${coin.symbol}`}>{coin.label}</td>
            <td className="bold">Spot</td>
            <td>n/a</td>
            <td className="big bold threecol">${findHookBySymbol(coin.symbol)}</td>
            <td className="sevencol">n/a</td>
          </tr>,
          <tr>
            <td className={`bold ${coin.symbol}`}>{coin.label}</td>
            <td className="bold">Perp</td>
            <td>{futures[`PF_${coin.symbol}USD`]?.openInterest}</td>
            <td>${futures[`PF_${coin.symbol}USD`]?.bid}</td>
            <td>${futures[`PF_${coin.symbol}USD`]?.ask}</td>
            <td>${(futures[`PF_${coin.symbol}USD`]?.bid + futures[`PF_${coin.symbol}USD`]?.ask) / 2}</td>
            <td>
              $
              {findHookBySymbol(coin.symbol)
                ? (futures[`PF_${coin.symbol}USD`]?.bid + futures[`PF_${coin.symbol}USD`]?.ask) / 2 -
                  findHookBySymbol(coin.symbol)
                : "spot loading..."}
            </td>
            <td>%{futures[`PF_${coin.symbol}USD`]?.funding_rate * 24 * 365}</td>
            <td>n/a</td>
            <td>n/a</td>
            <td>%{futures[`PF_${coin.symbol}USD`]?.funding_rate}</td>
            <td>%{futures[`PF_${coin.symbol}USD`]?.funding_rate_prediction}</td>
            <td>%{futures[`PF_${coin.symbol}USD`]?.funding_rate_prediction * 24 * 365}</td>
          </tr>,
        ])}
      </table>
    </div>
  );
}

export default App;
