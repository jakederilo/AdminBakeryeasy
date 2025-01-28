import { Doughnut } from "react-chartjs-2";
import { useEffect, useState } from "react";
import "./pieChartBox.scss";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  endpoint: string;
  title: string;
}

const PieChart: React.FC<PieChartProps> = ({ endpoint, title }) => {
  const [data, setData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: ["#9370DB", "#FFD700", "#00BFFF", "#FF6347"],
        borderColor: ["#fff"],
        borderWidth: 1,
      },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(endpoint);
        const result = await response.json();

        const labels = result.map(
          (item: { category: string }) => item.category
        );
        const values = result.map(
          (item: { totalQuantity: number }) => item.totalQuantity
        );

        setData({
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: [
                "#9370DB", // Wedding Cake
                "#FFD700", // Anniversary Cake
                "#00BFFF", // Birthday Cake
                "#FF6347", // Holiday Cake
              ],
              borderColor: ["#fff"],
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error("Error fetching pie chart data:", error);
      }
    };

    fetchData();
  }, [endpoint]);

  const options = {
    plugins: {
      tooltip: {
        callbacks: {
          label: function (context: any) {
            return `${context.label}: ${context.raw} items`; // Tooltip shows the quantity
          },
        },
      },
    },
  };

  return (
    <div className="chart-box">
      <h2>{title}</h2>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default PieChart;
