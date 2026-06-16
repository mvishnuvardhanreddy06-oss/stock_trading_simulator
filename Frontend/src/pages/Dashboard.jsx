import React from "react";
import {
  Activity,
  ArrowDownUp,
  BarChart3,
  BriefcaseBusiness,
  History,
  Search,
  TrendingUp
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../services/axios.js";
import MarketTable from "../components/MarketTable.jsx";
import TradePanel from "../components/TradePanel.jsx";
import PortfolioPanel from "../components/PortfolioPanel.jsx";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import TransactionsPanel from "../components/TransactionsPanel.jsx";
import ChartPanel from "../components/ChartPanel.jsx";
import MarketTicker from "../components/MarketTicker.jsx";
import ProfilePanel from "../components/ProfilePanel.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

function Dashboard() {
  const { user, logout } = useAuth();
  const [market, setMarket] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const selectedSymbolRef = useRef("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState("dashboard");
  const [watchlist, setWatchlist] = useState([]);
  const [sectorFilter, setSectorFilter] = useState("All sectors");

  const highestStock = useMemo(
    () =>
      market.reduce(
        (highest, stock) => (!highest || Number(stock.price) > Number(highest.price) ? stock : highest),
        null
      ),
    [market]
  );

  const selectedStock = useMemo(
    () => market.find((stock) => stock.symbol === selectedSymbol) || highestStock || market[0],
    [highestStock, market, selectedSymbol]
  );

  const sectors = useMemo(
    () => ["All sectors", ...Array.from(new Set(market.map((stock) => stock.sector))).sort()],
    [market]
  );

  const filteredMarket = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return market.filter((stock) => {
      const matchesQuery =
        !query ||
        stock.symbol.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query) ||
        stock.sector.toLowerCase().includes(query);
      const matchesSector = sectorFilter === "All sectors" || stock.sector === sectorFilter;
      return matchesQuery && matchesSector;
    });
  }, [market, searchTerm, sectorFilter]);

  async function loadDashboard(showSpinner = false) {
    if (showSpinner) setIsLoading(true);
    const [marketData, portfolioData, transactionData, watchlistData] = await Promise.all([
      api.getMarket(),
      api.getPortfolio(),
      api.getTransactions(),
      api.getWatchlist()
    ]);
    setMarket(marketData);
    setPortfolio(portfolioData);
    setTransactions(transactionData);
    setWatchlist(Array.isArray(watchlistData.symbols) ? watchlistData.symbols : []);
    const currentSelectedSymbol = selectedSymbolRef.current;
    const currentSymbolExists = marketData.some((stock) => stock.symbol === currentSelectedSymbol);
    if ((!currentSelectedSymbol || !currentSymbolExists) && marketData.length) {
      const defaultStock = marketData.reduce(
        (highest, stock) => (!highest || Number(stock.price) > Number(highest.price) ? stock : highest),
        null
      );
      setSelectedSymbol(defaultStock?.symbol || marketData[0].symbol);
    }
    setIsLoading(false);
  }

  useEffect(() => {
    loadDashboard(true).catch((error) => {
      setNotice(error.message);
      setIsLoading(false);
    });

    const timer = setInterval(() => {
      loadDashboard().catch((error) => setNotice(error.message));
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    selectedSymbolRef.current = selectedSymbol;
  }, [selectedSymbol]);

  function selectStock(symbol) {
    selectedSymbolRef.current = symbol;
    setSelectedSymbol(symbol);
    if (activeView === "market") setActiveView("dashboard");
  }

  async function handleOrder(order) {
    setNotice("");
    await api.placeOrder(order);
    await loadDashboard();
    setNotice(`${order.side} order filled for ${order.quantity} ${order.symbol}`);
  }

  async function toggleWatchlist(symbol) {
    const previousWatchlist = watchlist;
    const nextWatchlist = watchlist.includes(symbol)
      ? watchlist.filter((item) => item !== symbol)
      : [...watchlist, symbol];

    setWatchlist(nextWatchlist);

    try {
      await api.updateWatchlist(nextWatchlist);
    } catch (error) {
      setNotice(error.message || "Unable to update watchlist. Please try again.");
      setWatchlist(previousWatchlist);
    }
  }

  const stats = [
    {
      label: "Total Equity",
      value: formatter.format(portfolio?.totalEquity || 0),
      icon: BriefcaseBusiness
    },
    { label: "Available Cash", value: formatter.format(portfolio?.cash || 0), icon: Activity },
    {
      label: "Unrealized P/L",
      value: formatter.format(portfolio?.unrealizedPnl || 0),
      icon: BarChart3,
      tone: (portfolio?.unrealizedPnl || 0) >= 0 ? "positive" : "negative"
    },
    {
      label: "Realized P/L",
      value: formatter.format(portfolio?.realizedPnl || 0),
      icon: ArrowDownUp,
      tone: (portfolio?.realizedPnl || 0) >= 0 ? "positive" : "negative"
    },
    {
      label: highestStock ? `Highest Stock - ${highestStock.symbol}` : "Highest Stock",
      value: highestStock ? formatter.format(highestStock.price) : "Loading...",
      icon: TrendingUp,
      tone: "positive",
      symbol: highestStock?.symbol
    }
  ];

  const isProfileView = ["profile", "account"].includes(activeView);
  const showChart = activeView === "dashboard";
  const showMarket = ["dashboard", "market"].includes(activeView);
  const showPortfolio = ["dashboard", "portfolio"].includes(activeView);
  const showHistory = ["dashboard", "history", "orders"].includes(activeView);

  return (
    <main className="app-layout">
      <Sidebar activeView={activeView} onChangeView={setActiveView} />
      <section className="app-shell">
        <Navbar user={user} onLogout={logout} />

        {isProfileView ? (
          <ProfilePanel
            user={user}
            portfolio={portfolio}
            onStartTrading={() => setActiveView("dashboard")}
            onLogout={logout}
          />
        ) : (
          <>
            <section className="stats-grid" aria-label="Portfolio stats">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <article
                    className={stat.symbol ? "stat-card clickable-stat" : "stat-card"}
                    key={stat.label}
                    onClick={stat.symbol ? () => selectStock(stat.symbol) : undefined}
                  >
                    <Icon size={19} />
                    <span>{stat.label}</span>
                    <strong className={stat.tone || ""}>{stat.value}</strong>
                  </article>
                );
              })}
            </section>

            <section className="command-bar">
              <div className="search-box">
                <Search size={18} />
                <input
                  aria-label="Search stocks"
                  placeholder="Search symbol, company, or sector"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
              <div className="view-tabs" aria-label="Dashboard views">
                {["dashboard", "market", "portfolio", "history"].map((view) => (
                  <button
                    className={activeView === view ? "active" : ""}
                    key={view}
                    type="button"
                    onClick={() => setActiveView(view)}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </section>

            {notice ? <div className="notice">{notice}</div> : null}

            {showChart ? <MarketTicker /> : null}

            <section className="terminal-layout">
              {showChart ? <ChartPanel stock={selectedStock} /> : null}

              {showChart ? <TradePanel stock={selectedStock} onSubmit={handleOrder} /> : null}

              {showMarket ? (
                <div className="panel market-panel">
                  <div className="panel-heading">
                    <div>
                      <p className="eyebrow">Market data</p>
                      <h2>{searchTerm ? "Search Results" : "All Stocks"}</h2>
                    </div>
                    <div className="market-toolbar">
                      <select
                        aria-label="Sector filter"
                        value={sectorFilter}
                        onChange={(event) => setSectorFilter(event.target.value)}
                      >
                        {sectors.map((sector) => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                      <History size={20} />
                    </div>
                  </div>
                  <MarketTable
                    stocks={filteredMarket}
                    selectedSymbol={selectedStock?.symbol}
                    onSelect={selectStock}
                    isLoading={isLoading}
                    watchlist={watchlist}
                    onToggleWatchlist={toggleWatchlist}
                  />
                </div>
              ) : null}

              {showPortfolio ? (
                <PortfolioPanel
                  portfolio={portfolio}
                  isHighlighted={activeView === "portfolio"}
                  className="portfolio-panel"
                />
              ) : null}

              {showHistory ? (
                <TransactionsPanel
                  transactions={transactions}
                  isHighlighted={["history", "orders"].includes(activeView)}
                  className="history-panel"
                />
              ) : null}
            </section>
          </>
        )}
      </section>
    </main>
  );
}

export default Dashboard;
