'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Download } from 'lucide-react';
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTooltip, VictoryPie, VictoryLine, VictoryLegend, VictoryContainer } from 'victory';
import { toast } from 'sonner';
import { Tables as SupabaseTables } from '@/types/supabase'; // Assuming your types are exported like this

// Use SupabaseTables for props, matching your schema
interface ReportsProps {
  leads?: SupabaseTables<'leads'>[];
  deals?: SupabaseTables<'deals'>[];
  contacts?: SupabaseTables<'contacts'>[];
  tasks?: SupabaseTables<'tasks'>[];
  loading?: boolean;
}

// Interfaces for chart data
interface TimeSeriesPoint {
  x: string;
  originalDate: Date;
  y: number;
}

interface PieData {
  name: string;
  value: number;
}

interface TeamPerformanceData {
  name: string; // Will be "Overall Performance" or similar
  deals: number;
  revenue: number;
}

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#8b5cf6', '#3b82f6', '#06b6d4', '#f97316', '#10b981'];

function getPeriodKey(date: Date, timeUnit: 'day' | 'month'): string {
  if (timeUnit === 'day') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  }
}

function aggregateDataByPeriod<T extends { created_at?: string | null; value?: number | null }>(
  items: T[],
  timeUnit: 'day' | 'month',
  aggregationType: 'sum' | 'count',
  valueKey?: keyof T // Make valueKey optional for count
): TimeSeriesPoint[] {
  const aggregated: Record<string, { sum: number; count: number; firstDateInPeriod: Date }> = {};

  items.forEach(item => {
    if (!item.created_at) return;
    const date = new Date(item.created_at);
    const key = getPeriodKey(date, timeUnit);

    if (!aggregated[key]) {
      aggregated[key] = { sum: 0, count: 0, firstDateInPeriod: date };
    }
    if (aggregationType === 'sum' && valueKey) {
      aggregated[key].sum += Number(item[valueKey] || 0);
    }
    aggregated[key].count += 1;
    if (date < aggregated[key].firstDateInPeriod) {
        aggregated[key].firstDateInPeriod = date;
    }
  });

  return Object.entries(aggregated)
    .map(([key, value]) => ({
      x: key,
      originalDate: value.firstDateInPeriod,
      y: aggregationType === 'sum' ? value.sum : value.count,
    }))
    .sort((a, b) => a.originalDate.getTime() - b.originalDate.getTime());
}

function processPieData<T>(
    items: T[],
    keyField: keyof T,
    defaultName: string = 'Unknown'
): PieData[] {
    const counts: Record<string, number> = {};
    items.forEach(item => {
        const keyValue = item[keyField];
        // Ensure keyValue is treated as a string, even if it's an enum from Supabase types
        const key = String(keyValue || defaultName);
        counts[key] = (counts[key] || 0) + 1;
    });
    const formatted = Object.entries(counts).map(([name, value]) => ({ name, value }));
    return formatted.length > 0 ? formatted : [{ name: 'No Data', value: 1 }];
}

export default function Reports({
  leads = [],
  deals = [],
  contacts = [], // contacts are used for filtering by date if they have created_at
  tasks = [],
  loading: initialLoading = false
}: ReportsProps) {
  const [timeRange, setTimeRange] = useState('year');
  const [loading, setLoading] = useState(initialLoading);

  const [salesData, setSalesData] = useState<TimeSeriesPoint[]>([]);
  const [leadSourceData, setLeadSourceData] = useState<PieData[]>([]);
  const [dealStageData, setDealStageData] = useState<PieData[]>([]);
  const [teamPerformanceData, setTeamPerformanceData] = useState<TeamPerformanceData[]>([]);
  const [newLeadsTrendData, setNewLeadsTrendData] = useState<TimeSeriesPoint[]>([]);
  const [dealsCreatedTrendData, setDealsCreatedTrendData] = useState<TimeSeriesPoint[]>([]);
  const [leadStatusData, setLeadStatusData] = useState<PieData[]>([]);
  const [tasksCreatedTrendData, setTasksCreatedTrendData] = useState<TimeSeriesPoint[]>([]);
  const [taskStatusData, setTaskStatusData] = useState<PieData[]>([]);

  // Store timeUnit for use in chart rendering (e.g. VictoryGroup offset)
  // const [currentTimeUnit, setCurrentTimeUnit] = useState<'day' | 'month'>('month'); // Not actively used for rendering decisions, but set.


  useEffect(() => {
    setLoading(true);
    try {
      const now = new Date();
      let startDate = new Date(now);
      let timeUnitForTrends: 'day' | 'month' = 'month';

      if (timeRange === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29); // Approx last 30 days
        timeUnitForTrends = 'day';
      } else if (timeRange === 'quarter') {
        // Last 3 full months including current partial month. E.g., if June, then April, May, June.
        startDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
        timeUnitForTrends = 'month';
      } else { // year - "last 12 months"
        // Go back 11 months from the current month and take the 1st day.
        // e.g., if current is June 2024, start date is July 1, 2023. (July '23 - June '24)
        startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        timeUnitForTrends = 'month';
      }
      startDate.setHours(0, 0, 0, 0);
      // setCurrentTimeUnit(timeUnitForTrends); // Store for chart rendering - Not strictly needed if not used elsewhere.
      const endDate = new Date(); // Up to now

      const filterByDateRange = (item: { created_at?: string | null }) => {
        if (!item.created_at) return false;
        const itemDate = new Date(item.created_at);
        return itemDate >= startDate && itemDate <= endDate;
      };

      const filteredLeads = leads.filter(filterByDateRange);
      const filteredDeals = deals.filter(filterByDateRange);
      // const filteredContacts = contacts.filter(filterByDateRange); // Not directly used for charts after schema review
      const filteredTasks = tasks.filter(filterByDateRange);

      setSalesData(aggregateDataByPeriod(filteredDeals, timeUnitForTrends, 'sum', 'value'));
      setNewLeadsTrendData(aggregateDataByPeriod(filteredLeads, timeUnitForTrends, 'count'));
      setDealsCreatedTrendData(aggregateDataByPeriod(filteredDeals, timeUnitForTrends, 'count'));
      setTasksCreatedTrendData(aggregateDataByPeriod(filteredTasks, timeUnitForTrends, 'count'));

      setLeadSourceData(processPieData(filteredLeads, 'source' as keyof SupabaseTables<'leads'>));
      setDealStageData(processPieData(filteredDeals, 'stage' as keyof SupabaseTables<'deals'>));
      setLeadStatusData(processPieData(filteredLeads, 'status' as keyof SupabaseTables<'leads'>));
      setTaskStatusData(processPieData(filteredTasks, 'status' as keyof SupabaseTables<'tasks'>));
      
      const overallPerformance = { name: "Overall Performance", deals: 0, revenue: 0 };
      filteredDeals.forEach(deal => {
        overallPerformance.deals += 1;
        overallPerformance.revenue += deal.value || 0;
      });
      setTeamPerformanceData(filteredDeals.length > 0 ? [overallPerformance] : [{ name: 'No Data', deals: 0, revenue: 0 }]);

    } catch (error) {
      console.error('Error processing report data:', error);
      toast.error('Error', { description: 'Failed to process report data. Please try again.' });
    } finally {
      setLoading(false);
    }
  }, [timeRange, leads, deals, contacts, tasks]);

  const handleExportData = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Category,SubCategory,Period_Or_Name,Value1,Value2\n";

    salesData.forEach(item => csvContent += `Sales Overview,Revenue,${item.x.replace(/,/g, '')},${item.y}\n`);
    leadSourceData.forEach(item => csvContent += `Lead Analytics,Lead Source,${item.name.replace(/,/g, '')},${item.value}\n`);
    dealStageData.forEach(item => csvContent += `Deal Pipeline,Deal Stage,${item.name.replace(/,/g, '')},${item.value}\n`);
    teamPerformanceData.forEach(item => csvContent += `Team Performance,Overall,${item.name.replace(/,/g, '')},${item.deals},${item.revenue}\n`);
    newLeadsTrendData.forEach(item => csvContent += `Lead Analytics,New Leads Trend,${item.x.replace(/,/g, '')},${item.y}\n`);
    dealsCreatedTrendData.forEach(item => csvContent += `Lead Analytics,Deals Created Trend,${item.x.replace(/,/g, '')},${item.y}\n`);
    leadStatusData.forEach(item => csvContent += `Lead Analytics,Lead Status,${item.name.replace(/,/g, '')},${item.value}\n`);
    tasksCreatedTrendData.forEach(item => csvContent += `Task Analytics,Tasks Created Trend,${item.x.replace(/,/g, '')},${item.y}\n`);
    taskStatusData.forEach(item => csvContent += `Task Analytics,Task Status,${item.name.replace(/,/g, '')},${item.value}\n`);

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crm_report_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export successful', { description: 'Report data has been exported to CSV.' });
  };
  
  const getTimeRangeDescription = () => {
    if (timeRange === 'month') return 'last 30 days';
    if (timeRange === 'quarter') return 'last 3 months';
    return 'last 12 months';
  };

  const chartTheme = {
    axis: { style: { axis: { stroke: "#6b7280" }, tickLabels: { fill: "#d1d5db", fontSize: 10 }, grid: { stroke: "#374151", strokeDasharray: "3, 3" }}},
    tooltip: { style: { fill: "#e5e7eb", fontSize: 10 }, flyoutStyle: { fill: "#1f2937", stroke: "#374151", strokeWidth: 0.5 } },
    bar: { style: { labels: { fill: "#e5e7eb", fontSize: 10 }}},
    line: { style: { labels: { fill: "#e5e7eb", fontSize: 10 }}},
    pie: { style: { labels: { fill: "#e5e7eb", fontSize: 10, padding: 8 }}},
    legend: { style: { labels: { fill: "#d1d5db", fontSize: 10 }}},
    group: { colorScale: COLORS }
  };

  const ChartPlaceholder = ({ message, height = "350px" }: { message: string; height?: string }) => (
    <div style={{ height }} className="flex items-center justify-center text-gray-400">{message}</div>
  );

  return (
    <>
      <div className="space-y-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Reports & Analytics</h2>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Label htmlFor="timeRange" className="text-gray-300 whitespace-nowrap">Time Range:</Label>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger id="timeRange" className="w-full md:w-[180px] bg-gray-800/60 border-gray-700 text-gray-200">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="month" className="text-gray-200 focus:bg-gray-700">Last 30 Days</SelectItem>
              <SelectItem value="quarter" className="text-gray-200 focus:bg-gray-700">Last 3 Months</SelectItem>
              <SelectItem value="year" className="text-gray-200 focus:bg-gray-700">Last 12 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="flex items-center gap-2 border-gray-700 bg-gray-800/60 text-gray-200 hover:bg-gray-700/60" onClick={handleExportData} disabled={loading}>
            <Download className="h-4 w-4" /><span>Export</span>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-5 bg-gray-800/60 border-gray-700">
          {['Sales', 'Leads', 'Deals', 'Team', 'Tasks'].map(tab => (
            <TabsTrigger key={tab.toLowerCase()} value={tab.toLowerCase()} className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500/20 data-[state=active]:to-purple-500/20 data-[state=active]:text-indigo-300 text-gray-400">{tab}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="sales" className="mt-4">
          <Card className="border-gray-700 bg-gray-900/80 backdrop-blur-sm">
            <CardHeader><CardTitle className="text-white">Sales Overview</CardTitle><CardDescription className="text-gray-400">Revenue performance for the {getTimeRangeDescription()}</CardDescription></CardHeader>
            <CardContent>
              {loading ? <ChartPlaceholder message="Loading sales data..." /> :
               !salesData.length ? <ChartPlaceholder message="No sales data for this period." /> : (
                <div className="h-full">
                  <VictoryChart domainPadding={{ x: [20, 20]}} theme={chartTheme} containerComponent={<VictoryContainer style={{ touchAction: 'auto' }} />}>
                    <VictoryAxis fixLabelOverlap />
                    <VictoryAxis dependentAxis tickFormat={(t) => `$${(t/1000)}k`} />
                    <VictoryBar data={salesData} x="x" y="y" style={{ data: { fill: "url(#gradient)" } }} labels={({ datum }) => `$${datum.y.toLocaleString()}`} labelComponent={<VictoryTooltip />} />
                  </VictoryChart>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="mt-4 space-y-6">
          <Card className="border-gray-700 bg-gray-900/80 backdrop-blur-sm">
            <CardHeader><CardTitle className="text-white">Leads vs Deals Created</CardTitle><CardDescription className="text-gray-400">Trend for the {getTimeRangeDescription()}</CardDescription></CardHeader>
            <CardContent>
              {loading ? <ChartPlaceholder message="Loading data..." /> :
              (!newLeadsTrendData.length && !dealsCreatedTrendData.length) ? <ChartPlaceholder message="No lead or deal data for this period." /> : (
                <div className="h-full]">
                  <VictoryChart theme={chartTheme} domainPadding={{ x: [20, 20]}} containerComponent={<VictoryContainer style={{ touchAction: 'auto' }} />}>
                    <VictoryAxis fixLabelOverlap />
                    <VictoryAxis dependentAxis />
                    <VictoryLegend x={50} y={10} orientation="horizontal" gutter={20} data={[ { name: "Leads Created", symbol: { fill: COLORS[0] } }, { name: "Deals Created", symbol: { fill: COLORS[1] } }]} />
                    <VictoryLine data={newLeadsTrendData} x="x" y="y" labels={({ datum }) => `${datum.y} leads`} labelComponent={<VictoryTooltip />} style={{data: {stroke: COLORS[0]}}} />
                    <VictoryLine data={dealsCreatedTrendData} x="x" y="y" labels={({ datum }) => `${datum.y} deals`} labelComponent={<VictoryTooltip />} style={{data: {stroke: COLORS[1]}}}/>
                  </VictoryChart>
                </div>
              )}
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gray-700 bg-gray-900/80 backdrop-blur-sm">
              <CardHeader><CardTitle className="text-white">Lead Sources</CardTitle><CardDescription className="text-gray-400">Distribution by source ({getTimeRangeDescription()})</CardDescription></CardHeader>
              <CardContent>
                {loading ? <ChartPlaceholder message="Loading..." height="300px" /> :
                 leadSourceData.length === 0 || (leadSourceData.length === 1 && leadSourceData[0].name === 'No Data') ? <ChartPlaceholder message="No lead source data." height="300px" /> : (
                  <div className="h-[300px]">
                    <VictoryPie
                      data={leadSourceData}
                      x="name"
                      y="value"
                      theme={chartTheme}
                      colorScale={COLORS}
                      style={{ labels: { fill: "white", fontSize: 12 } }}
                      labelRadius={({ innerRadius }) => Number(innerRadius || 0) * 1.7}
                      labels={({ datum }) => `${datum.name}: ${datum.value}`}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-gray-700 bg-gray-900/80 backdrop-blur-sm">
              <CardHeader><CardTitle className="text-white">Lead Status</CardTitle><CardDescription className="text-gray-400">Distribution by status ({getTimeRangeDescription()})</CardDescription></CardHeader>
              <CardContent>
                {loading ? <ChartPlaceholder message="Loading..." height="300px" /> :
                 leadStatusData.length === 0 || (leadStatusData.length === 1 && leadStatusData[0].name === 'No Data') ? <ChartPlaceholder message="No lead status data." height="300px" /> : (
                  <div className="h-[300px]">
                    <VictoryPie
                      data={leadStatusData}
                      x="name"
                      y="value"
                      theme={chartTheme}
                      colorScale={COLORS}
                      style={{ labels: { fill: "white", fontSize: 12 } }}
                      labelRadius={({ innerRadius }) => Number(innerRadius || 0) * 1.7}
                      labels={({ datum }) => `${datum.name}: ${datum.value}`}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deals" className="mt-4 space-y-6">
          <Card className="border-gray-700 bg-gray-900/80 backdrop-blur-sm">
            <CardHeader><CardTitle className="text-white">Deal Stages</CardTitle><CardDescription className="text-gray-400">Distribution by stage ({getTimeRangeDescription()})</CardDescription></CardHeader>
            <CardContent>
              {loading ? <ChartPlaceholder message="Loading..." /> :
               dealStageData.length === 0 || (dealStageData.length === 1 && dealStageData[0].name === 'No Data') ? <ChartPlaceholder message="No deal stage data." /> : (
                <div className="h-[350px]">
                  <VictoryPie
                    data={dealStageData}
                    x="name"
                    y="value"
                    theme={chartTheme}
                    colorScale={COLORS}
                    style={{ labels: { fill: "white", fontSize: 12 } }}
                    labelRadius={({ innerRadius }) => Number(innerRadius || 0) * 1.7}
                    labels={({ datum }) => `${datum.name}: ${datum.value}`}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card className="border-gray-700 bg-gray-900/80 backdrop-blur-sm">
            <CardHeader><CardTitle className="text-white">Team Performance</CardTitle><CardDescription className="text-gray-400">Deals closed and revenue generated ({getTimeRangeDescription()})</CardDescription></CardHeader>
            <CardContent>
              {loading ? <ChartPlaceholder message="Loading team data..." /> :
               teamPerformanceData.length === 0 || (teamPerformanceData.length === 1 && teamPerformanceData[0].name === 'No Data') ? <ChartPlaceholder message="No team performance data." /> : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/40 rounded-lg p-6 flex flex-col items-center justify-center">
                    <h3 className="text-lg font-medium text-gray-300 mb-2">Total Deals Closed</h3>
                    <p className="text-4xl font-bold text-indigo-400">{teamPerformanceData[0].deals}</p>
                  </div>
                  <div className="bg-gray-800/40 rounded-lg p-6 flex flex-col items-center justify-center">
                    <h3 className="text-lg font-medium text-gray-300 mb-2">Total Revenue</h3>
                    <p className="text-4xl font-bold text-purple-400">${teamPerformanceData[0].revenue.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks" className="mt-4 space-y-6">
          <Card className="border-gray-700 bg-gray-900/80 backdrop-blur-sm">
            <CardHeader><CardTitle className="text-white">Tasks Created</CardTitle><CardDescription className="text-gray-400">Trend for the {getTimeRangeDescription()}</CardDescription></CardHeader>
            <CardContent>
              {loading ? <ChartPlaceholder message="Loading task data..." /> :
               !tasksCreatedTrendData.length ? <ChartPlaceholder message="No task data for this period." /> : (
                <div className="h-full">
                  <VictoryChart theme={chartTheme} domainPadding={{ x: [20, 20]}} containerComponent={<VictoryContainer style={{ touchAction: 'auto' }} />}>
                    <VictoryAxis fixLabelOverlap />
                    <VictoryAxis dependentAxis />
                    <VictoryBar data={tasksCreatedTrendData} x="x" y="y" style={{ data: { fill: COLORS[2] } }} labels={({ datum }) => `${datum.y} tasks`} labelComponent={<VictoryTooltip />} />
                  </VictoryChart>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="border-gray-700 bg-gray-900/80 backdrop-blur-sm">
            <CardHeader><CardTitle className="text-white">Task Status</CardTitle><CardDescription className="text-gray-400">Distribution by status ({getTimeRangeDescription()})</CardDescription></CardHeader>
            <CardContent>
              {loading ? <ChartPlaceholder message="Loading..." /> :
               taskStatusData.length === 0 || (taskStatusData.length === 1 && taskStatusData[0].name === 'No Data') ? <ChartPlaceholder message="No task status data." /> : (
                <div className="h-[350px]">
                  <VictoryPie
                    data={taskStatusData}
                    x="name"
                    y="value"
                    theme={chartTheme}
                    colorScale={COLORS}
                    style={{ labels: { fill: "white", fontSize: 12 } }}
                    labelRadius={({ innerRadius }) => Number(innerRadius || 0) * 1.7}
                    labels={({ datum }) => `${datum.name}: ${datum.value}`}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </>
  );
}