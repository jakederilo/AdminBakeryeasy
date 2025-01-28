import { Line } from "react-chartjs-2";
import { useEffect, useState } from "react";
import PieChartBox from "../../components/pieCartBox/PieChartBox";
import "./home.scss";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    fill: boolean;
    yAxisID?: string; // Add yAxisID to support dual y-axes
  }[];
}

interface ChartBoxProps {
  title: string;
  period: string;
  color: string;
  endpoint: string;
}

const KPIBox = ({
  title,
  value,
  change,
}: {
  title: string;
  value: string;
  change: string;
}) => (
  <div className="kpi-box">
    <h3>{title}</h3>
    <p className="value">{value}</p>
    <p className="change">{change}</p>
  </div>
);

const ChartBox: React.FC<ChartBoxProps> = ({
  title,
  period,
  color,
  endpoint,
}) => {
  const [data, setData] = useState<ChartData>({
    labels: [],
    datasets: [
      {
        label: title,
        data: [],
        borderColor: color,
        fill: false,
      },
    ],
  });

  const [, setTotalCollection] = useState<number | null>(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        // Fetch chart data for accepted orders
        const chartResponse = await fetch(`${endpoint}?period=${period}`);
        const chartResult = await chartResponse.json();

        const labels = chartResult.map((item: { _id: string }) => item._id);
        const totalAmountData = chartResult.map(
          (item: { totalAmount: number }) => item.totalAmount
        );
        const orderCountData = chartResult.map(
          (item: { orderCount: number }) => item.orderCount
        );

        setData({
          labels,
          datasets: [
            {
              label: `${title} - Total Amount`,
              data: totalAmountData,
              borderColor: color,
              fill: false,
              yAxisID: "y", // Bind to left y-axis
            },
            {
              label: `${title} - Order Count`,
              data: orderCountData,
              borderColor: "rgba(255, 165, 0, 1)",
              fill: false,
              yAxisID: "y1", // Bind to right y-axis
            },
          ],
        });

        // Fetch total collection data
        const totalCollectionEndpoint = endpoint.replace(
          "accepted-orders",
          "total-collection"
        );
        const totalResponse = await fetch(
          `${totalCollectionEndpoint}?period=${period}`
        );
        const totalResult = await totalResponse.json();

        setTotalCollection(totalResult.totalAmount || 0);
      } catch (error) {
        console.error("Error fetching chart data or total collection:", error);
      }
    };

    fetchChartData();
  }, [period, endpoint, title, color]);

  return (
    <div className="chart-box">
      <h2>{title}</h2>
      <Line
        data={data}
        options={{
          responsive: true,
          plugins: {
            legend: {
              display: true,
            },
            tooltip: {
              enabled: true,
            },
          },
          scales: {
            y: {
              type: "linear",
              display: true,
              position: "left", // Left y-axis for Total Amount
              title: {
                display: true,
              },
            },
            y1: {
              type: "linear",
              display: true,
              position: "right", // Right y-axis for Order Count
              title: {
                display: true,
              },
              grid: {
                drawOnChartArea: false, // Avoid grid line overlap
              },
            },
          },
        }}
      />
    </div>
  );
};

const Home = () => {
  const [kpiData, setKpiData] = useState({
    users: 0,
    products: 0,
    transactions: 0,
    collections: 0,
  });

  useEffect(() => {
    const fetchKPIData = async () => {
      try {
        const [
          usersResponse,
          productsResponse,
          transactionsResponse,
          collectionsResponse,
        ] = await Promise.all([
          fetch("http://localhost:5001/users"),
          fetch("http://localhost:5001/items"),
          fetch("http://localhost:5001/transactions"),
          fetch("http://localhost:5001/reports/total-collection?period=month"),
        ]);

        const users = (await usersResponse.json()).data.length;
        const products = (await productsResponse.json()).data.length;
        const transactions = (await transactionsResponse.json()).data.length;
        const collections = (await collectionsResponse.json()).totalAmount || 0;

        setKpiData({ users, products, transactions, collections });
      } catch (error) {
        console.error("Error fetching KPI data:", error);
      }
    };

    fetchKPIData();
  }, []);

  return (
    <div className="dashboard">
      <h1>Performance Overview</h1>
      <div className="kpi-grid">
        <KPIBox
          title="Total Users"
          value={kpiData.users.toLocaleString()}
          change=""
        />
        <KPIBox
          title="Total Products"
          value={kpiData.products.toLocaleString()}
          change=""
        />
        <KPIBox
          title="Total Transactions"
          value={kpiData.transactions.toLocaleString()}
          change=""
        />
        <KPIBox
          title="Total Collections"
          value={`₱${kpiData.collections.toLocaleString()}`}
          change=""
        />
      </div>
      <div className="chart-grid">
        <ChartBox
          title="Accepted Orders Per Day"
          period="day"
          color="rgba(128, 0, 128, 1)"
          endpoint="http://localhost:5001/reports/accepted-orders"
        />
        <ChartBox
          title="Accepted Orders Per Week"
          period="week"
          color="rgba(0, 0, 255, 1)"
          endpoint="http://localhost:5001/reports/accepted-orders"
        />
        <ChartBox
          title="Accepted Orders Per Month"
          period="month"
          color="rgba(0, 128, 0, 1)"
          endpoint="http://localhost:5001/reports/accepted-orders"
        />
        <PieChartBox
          title="Number of Items by Category"
          endpoint="http://localhost:5001/items-by-category"
        />
      </div>
    </div>
  );
};

export default Home;
