import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import "./chartBox.scss";
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

type Props = {
  color: string;
  icon: string;
  title: string;
  dataKey: string;
  number: number | string;
  percentage: number;
  period: string;
  reportType: string;
};

const ChartBox = (props: Props) => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "",
        data: [],
        borderColor: props.color,
        fill: false,
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/reports/${props.reportType}?period=${props.period}`
        );
        const result = await response.json();

        const labels = result.map((item: { _id: string }) => item._id);
        const data = result.map(
          (item: { totalAmount: number }) => item.totalAmount
        );

        setChartData({
          labels,
          datasets: [
            {
              label: `${props.title} (${props.period})`,
              data,
              borderColor: props.color,
              fill: false,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [props.period, props.reportType, props.title, props.color]);

  return (
    <div className="chartBox">
      <div className="boxInfo">
        <div className="title">
          <img src={props.icon} alt="" />
          <span>{props.title}</span>
        </div>
        <h1>{props.number}</h1>
        <Link to="/" style={{ color: props.color }}>
          View all
        </Link>
      </div>
      <div className="chartInfo">
        <div className="chart">
          <Line data={chartData} />
        </div>
        <div className="texts">
          <span
            className="percentage"
            style={{ color: props.percentage < 0 ? "tomato" : "limegreen" }}
          >
            {props.percentage}%
          </span>
          <span className="duration">{props.period}</span>
        </div>
      </div>
    </div>
  );
};

export default ChartBox;
