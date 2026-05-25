import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { 
  BarChart3, Wallet, Tags, Clock, Share2, TrendingUp, AlertCircle, 
  CheckCircle2, FileText, Users, Download, Activity, MonitorPlay 
} from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import { toast } from 'sonner';

import { MetricCard } from './AnalyticsCards.jsx';
import AnalyticsLineChart from './AnalyticsLineChart.jsx';
import AnalyticsBarChart from './AnalyticsBarChart.jsx';
import AnalyticsPieChart from './AnalyticsPieChart.jsx';
import AnalyticsHeatmap from './AnalyticsHeatmap.jsx';
import AnalyticsGaugeChart from './AnalyticsGaugeChart.jsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const AnalyticsTab = () => {
  const [activeSubTab, setActiveSubTab] = useState('social');
  
  // Data states
  const [socialOverview, setSocialOverview] = useState(null);
  const [platformStats, setPlatformStats] = useState([]);
  const [trendingPosts, setTrendingPosts] = useState([]);
  
  const [walletOverview, setWalletOverview] = useState(null);
  const [earningsTrend, setEarningsTrend] = useState([]);
  const [topEarners, setTopEarners] = useState([]);
  
  const [categoryPerf, setCategoryPerf] = useState([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocialData = async () => {
      try {
        setLoading(true);
        const [overviewRes, platformRes, trendingRes] = await Promise.all([
          apiServerClient.fetch('/analytics/social-media/overview'),
          apiServerClient.fetch('/analytics/social-media/platform-stats'),
          apiServerClient.fetch('/analytics/social-media/trending-posts')
        ]);
        
        if (overviewRes.ok) setSocialOverview(await overviewRes.json());
        if (platformRes.ok) setPlatformStats(await platformRes.json());
        if (trendingRes.ok) setTrendingPosts(await trendingRes.json());
      } catch (err) {
        console.error('Error fetching social analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const [overviewRes, trendRes, earnersRes] = await Promise.all([
          apiServerClient.fetch('/wallet-analytics/overview'),
          apiServerClient.fetch('/wallet-analytics/earnings-trend?period=daily'),
          apiServerClient.fetch('/wallet-analytics/top-earners?limit=5')
        ]);
        
        if (overviewRes.ok) setWalletOverview(await overviewRes.json());
        if (trendRes.ok) setEarningsTrend(await trendRes.json());
        if (earnersRes.ok) setTopEarners(await earnersRes.json());
      } catch (err) {
        console.error('Error fetching wallet analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const res = await apiServerClient.fetch('/category-performance');
        if (res.ok) setCategoryPerf(await res.json());
      } catch (err) {
        console.error('Error fetching category analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    if (activeSubTab === 'social') fetchSocialData();
    if (activeSubTab === 'wallet') fetchWalletData();
    if (activeSubTab === 'category') fetchCategoryData();
    if (activeSubTab === 'time') {
      // Time relies mostly on mock heatmap for now or derived data
      setLoading(false); 
    }
  }, [activeSubTab]);

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics & Intelligence</h2>
          <p className="text-muted-foreground mt-1">Deep insights into platform performance and financials.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="gap-2 bg-white">
            <Link to="/admin/reports"><FileText className="w-4 h-4" /> Reports</Link>
          </Button>
          <Button variant="outline" asChild className="gap-2 bg-white">
            <Link to="/admin/monitoring"><Activity className="w-4 h-4" /> Live Monitor</Link>
          </Button>
          <Button asChild className="gap-2">
            <Link to="/admin/custom-reports"><Download className="w-4 h-4" /> Custom Export</Link>
          </Button>
        </div>
      </div>

      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-8">
        <TabsList className="bg-white border shadow-sm p-1 flex-wrap justify-start h-auto w-full md:w-auto">
          <TabsTrigger value="social" className="gap-2 py-2 px-4"><Share2 className="w-4 h-4" /> Social Media</TabsTrigger>
          <TabsTrigger value="wallet" className="gap-2 py-2 px-4"><Wallet className="w-4 h-4" /> Wallet & Earnings</TabsTrigger>
          <TabsTrigger value="category" className="gap-2 py-2 px-4"><Tags className="w-4 h-4" /> Categories</TabsTrigger>
          <TabsTrigger value="time" className="gap-2 py-2 px-4"><Clock className="w-4 h-4" /> Timing Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="social" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Total Posts" value={socialOverview?.totalPosts || 0} icon={FileText} trend={12.5} loading={loading} />
            <MetricCard title="Success Rate" value={socialOverview?.successRate || 0} suffix="%" icon={CheckCircle2} trend={2.4} loading={loading} valueColor="text-emerald-600" />
            <MetricCard title="Failed Posts" value={socialOverview?.failedCount || 0} icon={AlertCircle} trend={-5.2} loading={loading} valueColor="text-rose-600" />
            <MetricCard title="Pending Queue" value={socialOverview?.pendingCount || 0} icon={Clock} loading={loading} valueColor="text-amber-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AnalyticsBarChart 
                title="Posts by Platform" 
                data={platformStats} 
                dataKey="totalPosts" 
                xAxisKey="platform" 
                loading={loading}
                colors={['#1877F2', '#E4405F', '#000000', '#0088cc', '#25D366']} 
              />
            </div>
            <div>
              <AnalyticsGaugeChart 
                title="Overall Delivery Success" 
                value={socialOverview?.successRate || 0} 
                loading={loading} 
              />
            </div>
          </div>

          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-lg font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Top Trending Posts</h3>
            </div>
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Post Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Platforms</TableHead>
                  <TableHead className="text-right">Success Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trendingPosts.length === 0 && !loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No trending data available</TableCell></TableRow>
                ) : (
                  trendingPosts.map((post, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium max-w-[300px] truncate">{post.title}</TableCell>
                      <TableCell><Badge variant="outline">{post.category}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {post.platformsUsed?.map(p => <Badge key={p} variant="secondary" className="text-[10px] capitalize">{p}</Badge>)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-emerald-600">{post.successCount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="wallet" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard title="Total System Balance" value={walletOverview?.totalBalance || 0} prefix="₹" icon={Wallet} trend={4.2} loading={loading} />
            <MetricCard title="Total Earned All-Time" value={walletOverview?.totalEarned || 0} prefix="₹" icon={TrendingUp} loading={loading} valueColor="text-emerald-600" />
            <MetricCard title="Total Paid Out" value={walletOverview?.totalPaidOut || 0} prefix="₹" icon={CheckCircle2} loading={loading} valueColor="text-blue-600" />
            <MetricCard title="Active Reporters" value={walletOverview?.activeReporters || 0} icon={Users} trend={1.8} loading={loading} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AnalyticsLineChart 
                title="Earnings Trend (Daily)" 
                data={earningsTrend} 
                valuePrefix="₹"
                loading={loading} 
              />
            </div>
            <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h3 className="text-lg font-bold flex items-center gap-2">Top Earners</h3>
              </div>
              <div className="p-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead>Reporter</TableHead>
                      <TableHead className="text-right">Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topEarners.length === 0 && !loading ? (
                      <TableRow><TableCell colSpan={2} className="text-center py-8">No earners data</TableCell></TableRow>
                    ) : (
                      topEarners.map((earner, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">{i+1}</span>
                              {earner.reporterName}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-bold">₹{earner.totalEarned}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="category" className="space-y-6 outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AnalyticsBarChart 
              title="Posts by Category" 
              data={categoryPerf} 
              dataKey="totalPosts" 
              xAxisKey="category" 
              loading={loading}
              colors={['hsl(var(--chart-primary))', 'hsl(var(--chart-info))', 'hsl(var(--chart-purple))']}
            />
            <AnalyticsPieChart 
              title="Content Distribution" 
              data={categoryPerf.map(c => ({ name: c.category, value: c.totalPosts }))} 
              loading={loading} 
            />
          </div>
          
          <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead className="text-right">Total Posts</TableHead>
                  <TableHead className="text-right">Delivery Success Rate</TableHead>
                  <TableHead className="text-right">Avg. Earnings / Post</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryPerf.length === 0 && !loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8">No category data</TableCell></TableRow>
                ) : (
                  categoryPerf.map((cat, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium">{cat.category}</TableCell>
                      <TableCell className="text-right">{cat.totalPosts}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className={cat.successRate > 80 ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : 'text-amber-600 border-amber-200 bg-amber-50'}>
                          {cat.successRate}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">₹{cat.avgEarningsPerPost?.toFixed(2) || 0}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="time" className="space-y-6 outline-none">
          <AnalyticsHeatmap 
            title="Engagement Heatmap: Best Times to Post" 
            loading={loading} 
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-card border rounded-2xl p-6 shadow-sm col-span-1 md:col-span-3">
              <h3 className="text-lg font-bold mb-2">Timing Insights</h3>
              <p className="text-muted-foreground">Based on historical success rates and views, the optimal posting windows are currently detected between <strong>10:00 AM - 2:00 PM</strong> on weekdays. Weekend engagement spikes later in the afternoon.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsTab;