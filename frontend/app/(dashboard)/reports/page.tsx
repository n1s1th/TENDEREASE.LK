'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, Download, FileSpreadsheet, FileText, Filter } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';

// Mock Data
const cycleTimeData = [
  { name: 'Jan', days: 25 }, { name: 'Feb', days: 28 }, { name: 'Mar', days: 24 },
  { name: 'Apr', days: 30 }, { name: 'May', days: 27 }, { name: 'Jun', days: 32 },
];

const smeData = [
  { name: 'SME', value: 35 }, { name: 'Others', value: 65 },
];
const COLORS = ['#FFB401', '#E0E0E0'];

const awardValueData = [
  { name: 'Jan', value: 4000 }, { name: 'Feb', value: 3000 }, { name: 'Mar', value: 5000 },
  { name: 'Apr', value: 4500 }, { name: 'May', value: 6000 }, { name: 'Jun', value: 5500 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-1">Detailed KPI Report</h1>
          <p className="text-sm text-gray-3">Cycle time • SME participation • Award value trends</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="text-sm">
            <FileText className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button variant="outline" className="text-sm">
            <FileSpreadsheet className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-3" />
              <Input placeholder="mm/dd/yyyy" className="pl-9" />
            </div>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-3" />
              <Input placeholder="mm/dd/yyyy" className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="health">Health</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="goods">Goods</SelectItem>
                <SelectItem value="works">Works</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-secondary hover:bg-secondary/90 text-white">
              <Filter className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cycle Time Trend */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Cycle Time Trend</CardTitle>
            <Button variant="outline" size="sm" className="h-8 text-xs">Trend</Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cycleTimeData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="days" stroke="#953002" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-3 mt-2">Shows average cycle time (days) for the selected period.</p>
          </CardContent>
        </Card>

        {/* SME Participation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">SME Participation</CardTitle>
            <Button variant="outline" size="sm" className="h-8 text-xs">Share</Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={smeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {smeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <p className="text-3xl font-bold text-gray-1">35%</p>
                <p className="text-xs text-gray-3">SME Vendors</p>
              </div>
            </div>
            <p className="text-xs text-gray-3 mt-2">Percentage of bids submitted by SME vendors within the selected period.</p>
          </CardContent>
        </Card>

        {/* Award Value Trends */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Award Value Trends</CardTitle>
            <Button variant="outline" size="sm" className="h-8 text-xs">Totals</Button>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={awardValueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip />
                  <Line type="monotone" dataKey="value" stroke="#FFB401" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-3 mt-2">Displays awarded totals over time for selected filters.</p>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-3">Avg Cycle Time</span>
              <span className="text-sm font-semibold text-gray-1">28 days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-3">SME Participation</span>
              <span className="text-sm font-semibold text-gray-1">35%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-3">Total Award Value</span>
              <span className="text-sm font-semibold text-gray-1">LKR 18.2M</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-3">Total Awards</span>
              <span className="text-sm font-semibold text-gray-1">12</span>
            </div>
            <div className="pt-4 border-t">
              <p className="text-xs text-gray-3">Export buttons download the report in PDF/Excel format.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}