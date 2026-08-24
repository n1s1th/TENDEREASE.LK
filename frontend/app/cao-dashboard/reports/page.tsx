"use client";

import { useEffect, useState, useMemo } from 'react';
import { Download, TrendingUp, Package, CheckCircle, Clock, BarChart2, Award } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line, Doughnut, Bar, Pie } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const PRIMARY = '#953002', AMBER = '#f0b323', EMERALD = '#059669', BLUE = '#3b82f6', SLATE = '#64748b';
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.tenderease.me';

async function fetchAllTenders(): Promise<any[]> {
  const res = await fetch(API_BASE + '/api/v1/cao/tenders?size=1000');
  const j = await res.json();
  return j.content || j.data || [];
}


async function fetchAllVendors(): Promise<any[]> {
  try {
    const res = await fetch(API_BASE + '/api/v1/vendors?size=1000');
    const j = await res.json();
    return j.content || j.data || [];
  } catch { return []; }
}

function applyFilters(tenders: any[], params: any) {
  let t = [...tenders];
  if (params.department) t = t.filter((x: any) => (x.departmentName || x.department || '') === params.department);
  if (params.ministry)   t = t.filter((x: any) => (x.ministryName || '') === params.ministry);
  if (params.category)   t = t.filter((x: any) => (x.procurementType || '').toUpperCase() === params.category.toUpperCase());
  if (params.period && params.period !== 'all_time') {
    const now = new Date();
    t = t.filter((x: any) => {
      const d = new Date(x.createdAt || x.publishedAt || Date.now());
      if (params.period === 'today')      return d.toDateString() === now.toDateString();
      if (params.period === 'this_week')  { const s = new Date(now); s.setDate(now.getDate() - now.getDay()); return d >= s; }
      if (params.period === 'this_month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      if (params.period === 'this_year')  return d.getFullYear() === now.getFullYear();
      return true;
    });
  }
  return t;
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: any; icon: any; color: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ width: 44, height: 44, borderRadius: 10, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={22} color={color} />
      </div>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600, marginTop: '0.25rem', textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>{label}</div>
      </div>
    </div>
  );
}

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      <div style={{ marginBottom: "1.25rem" }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111', margin: 0 }}>{title}</h3>
        {subtitle && <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0.2rem 0 0 0', fontWeight: 500 }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function ReportsPage() {
  const [allTenders, setAllTenders] = useState<any[]>([]);
  const [allVendors, setAllVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState('');
  const [ministry, setMinistry]     = useState('');
  const [category, setCategory]     = useState('');
  const [period, setPeriod]         = useState('all_time');

  useEffect(() => {
    (async () => {
      try { setLoading(true); const [t, v] = await Promise.all([fetchAllTenders(), fetchAllVendors()]); setAllTenders(t); setAllVendors(v); }
      catch(e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const departments = useMemo(() => [...new Set(allTenders.map((t: any) => t.departmentName || t.department).filter(Boolean))], [allTenders]);
  const ministries  = useMemo(() => [...new Set(allTenders.map((t: any) => t.ministryName).filter(Boolean))], [allTenders]);
  const categories  = useMemo(() => [...new Set(allTenders.map((t: any) => t.procurementType).filter(Boolean))], [allTenders]);
  const tenders     = useMemo(() => applyFilters(allTenders, { department, ministry, category, period }), [allTenders, department, ministry, category, period]);

  const kpi = useMemo(() => {
    const awarded  = tenders.filter((t: any) => t.status === 'AWARDED');
    const active   = tenders.filter((t: any) => ['PUBLISHED','PENDING_OPENING','PENDING_APPROVAL'].includes(t.status));
    const rejected = tenders.filter((t: any) => t.status === 'REJECTED');
    let totalCycle = 0;
    awarded.forEach((t: any) => {
      totalCycle += Math.max(1, Math.ceil((new Date(t.updatedAt||Date.now()).getTime()-new Date(t.createdAt||Date.now()).getTime())/86400000));
    });
    const avgCycle = awarded.length ? Math.round(totalCycle/awarded.length) : 0;
    const totalAwardVal = awarded.reduce((s: number, t: any) => s+(t.estimatedBudget||0), 0);
    const byStatus: Record<string,number> = {}, byType: Record<string,number> = {}, byMethod: Record<string,number> = {};
    tenders.forEach((t: any) => {
      byStatus[t.status] = (byStatus[t.status]||0)+1;
      byType[t.procurementType||'Unknown'] = (byType[t.procurementType||'Unknown']||0)+1;
      byMethod[t.biddingMethod||'Unknown'] = (byMethod[t.biddingMethod||'Unknown']||0)+1;
    });
    const cm = new Date().getMonth();
    const cycleMap = new Map<number,{total:number;count:number}>();
    const activeMap = new Map<number,number>();
    const awardMap  = new Map<number,number>();
    for(let i=0;i<=cm;i++){cycleMap.set(i,{total:0,count:0});activeMap.set(i,0);awardMap.set(i,0);}
    tenders.forEach((t: any) => {
      const m = new Date(t.createdAt||Date.now()).getMonth(); if(m>cm) return;
      if(['PUBLISHED','PENDING_OPENING','PENDING_APPROVAL'].includes(t.status)) activeMap.set(m,(activeMap.get(m)||0)+1);
      if(t.status==='AWARDED'){
        const days = Math.max(1,Math.ceil((new Date(t.updatedAt||Date.now()).getTime()-new Date(t.createdAt||Date.now()).getTime())/86400000));
        const c = cycleMap.get(m)!; c.total+=days; c.count+=1;
        awardMap.set(m,(awardMap.get(m)||0)+(t.estimatedBudget||0));
      }
    });
    const cycleTimeTrend = MONTHS.slice(0,cm+1).map((l,i)=>{const c=cycleMap.get(i)!;return{label:l,value:c.count>0?Math.round(c.total/c.count):0};});
    const activeTrend    = MONTHS.slice(0,cm+1).map((l,i)=>({label:l,value:activeMap.get(i)||0}));
    const awardTrend     = MONTHS.slice(0,cm+1).map((l,i)=>({label:l,value:parseFloat(((awardMap.get(i)||0)/1e6).toFixed(2))}));

    // SME Participation: cross-reference bidders with vendor org type
    const smeTypes = ['SOLE_PROPRIETORSHIP', 'PARTNERSHIP'];
    const smeVendorIds = new Set(allVendors.filter((v: any) => smeTypes.includes(v.organizationType)).map((v: any) => v.vendorId));
    const totalVendors = allVendors.length;
    const smeCount = allVendors.filter((v: any) => smeTypes.includes(v.organizationType)).length;
    const nonSmeCount = totalVendors - smeCount;
    const smePercent = totalVendors > 0 ? Math.round((smeCount / totalVendors) * 100) : 0;
    // Breakdown by org type
    const byOrgType: Record<string,number> = {};
    allVendors.forEach((v: any) => {
      const t = v.organizationType || 'Unknown';
      byOrgType[t] = (byOrgType[t] || 0) + 1;
    });
    return {total:tenders.length,awarded:awarded.length,active:active.length,rejected:rejected.length,avgCycle,totalAwardVal,byStatus,byType,byMethod,cycleTimeTrend,activeTrend,awardTrend,smeCount,nonSmeCount,smePercent,totalVendors,byOrgType};
  }, [tenders, allVendors]);

  const tip = {backgroundColor:'#1e293b',padding:10,cornerRadius:8,titleFont:{size:12,weight:'bold' as const},bodyFont:{size:11}};
  const sharedOpts = (yLabel?: string) => ({responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:tip},scales:{x:{grid:{display:false},ticks:{font:{size:11}}},y:{grid:{color:'#f1f5f9'},ticks:{font:{size:11}},title:yLabel?{display:true,text:yLabel,font:{size:10},color:SLATE}:undefined}}});
  const donutOpts = {responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right' as const,labels:{font:{size:11},padding:14,boxWidth:12}},tooltip:tip},cutout:'60%'};
  const pieOpts   = {responsive:true,maintainAspectRatio:false,plugins:{legend:{position:'right' as const,labels:{font:{size:11},padding:14,boxWidth:12}},tooltip:tip}};

  const statusColors = Object.keys(kpi.byStatus).map(s => s==='AWARDED'?EMERALD:s==='REJECTED'?'#ef4444':s==='PUBLISHED'?BLUE:s==='PENDING_APPROVAL'?AMBER:s==='PENDING_OPENING'?'#8b5cf6':SLATE);
  const statusData   = {labels:Object.keys(kpi.byStatus).map(s=>s.replace(/_/g," ")),datasets:[{data:Object.values(kpi.byStatus),backgroundColor:statusColors,borderWidth:0}]};
  const typeData     = {labels:Object.keys(kpi.byType),datasets:[{data:Object.values(kpi.byType),backgroundColor:[PRIMARY,AMBER,EMERALD,BLUE,SLATE],borderWidth:0}]};
  const methodData   = {labels:Object.keys(kpi.byMethod),datasets:[{label:'Tenders',data:Object.values(kpi.byMethod),backgroundColor:[PRIMARY,AMBER,EMERALD,BLUE].slice(0,Object.keys(kpi.byMethod).length),borderRadius:6}]};
  const cycleData    = {labels:kpi.cycleTimeTrend.map(d=>d.label),datasets:[{label:'Avg Cycle (days)',data:kpi.cycleTimeTrend.map(d=>d.value),borderColor:PRIMARY,backgroundColor:'rgba(149,48,2,0.1)',fill:true,tension:0.4,pointRadius:5,pointBackgroundColor:PRIMARY}]};
  const activeCD     = {labels:kpi.activeTrend.map(d=>d.label),datasets:[{label:'Active Tenders',data:kpi.activeTrend.map(d=>d.value),backgroundColor:BLUE,borderRadius:5}]};
  const awardCD      = {labels:kpi.awardTrend.map(d=>d.label),datasets:[{label:'Award Value (Rs. Mn)',data:kpi.awardTrend.map(d=>d.value),backgroundColor:EMERALD,borderRadius:5}]};


  const smeData = {
    labels: ['SME (Sole Prop / Partnership)', 'Other Entities'],
    datasets: [{ data: [kpi.smeCount, kpi.nonSmeCount], backgroundColor: [EMERALD, '#e2e8f0'], borderWidth: 0 }],
  };
  const orgTypeData = {
    labels: Object.keys(kpi.byOrgType).map(s => s.replace(/_/g, ' ')),
    datasets: [{ data: Object.values(kpi.byOrgType), backgroundColor: [PRIMARY, AMBER, EMERALD, BLUE, SLATE], borderWidth: 0 }],
  };

  const fmt = (n: number) => n>=1e6?'Rs. '+(n/1e6).toFixed(1)+'M':n>=1000?'Rs. '+(n/1000).toFixed(0)+'K':'Rs. '+n;
  const none = (msg: string) => <p style={{color:'#94a3b8',fontSize:'0.85rem',textAlign:'center' as const,marginTop:'4rem'}}>{msg}</p>;

  const exportCSV = () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['KPI REPORT'],['Generated',new Date().toLocaleString()],['Period',period],['Department',department||'All'],['Ministry',ministry||'All'],['Category',category||'All'],[],['Metric','Value'],['Total Tenders',kpi.total],['Awarded',kpi.awarded],['Active',kpi.active],['Rejected',kpi.rejected],['Avg Cycle Time (days)',kpi.avgCycle],['Total Award Value (Rs.)',kpi.totalAwardVal]]),'Summary');
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Status','Count'],...Object.entries(kpi.byStatus)]),'By Status');
    XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Month','Avg Cycle','Active','Award Mn'],...kpi.cycleTimeTrend.map((c,i)=>[c.label,c.value,kpi.activeTrend[i]?.value,kpi.awardTrend[i]?.value])]),'Trends');
    XLSX.writeFile(wb,'KPI_Report.xlsx');
  };

  const exportPDF = async () => {
    const doc = new jsPDF('p','pt','a4'); const pw = doc.internal.pageSize.getWidth();
    doc.setFillColor(149,48,2); doc.rect(0,0,pw,70,'F');
    doc.setTextColor(255,255,255); doc.setFontSize(18); doc.setFont('helvetica','bold');
    doc.text('TenderEase - KPI Report',pw/2,42,{align:'center'});
    doc.setFontSize(10); doc.setFont('helvetica','normal');
    doc.text('Generated: '+new Date().toLocaleString()+'  |  Dept: '+(department||'All'),pw/2,58,{align:'center'});
    autoTable(doc,{startY:90,head:[['Metric','Value']],body:[['Total',kpi.total],['Awarded',kpi.awarded],['Active',kpi.active],['Rejected',kpi.rejected],['Avg Cycle',kpi.avgCycle+' days'],['Award Value','Rs. '+kpi.totalAwardVal.toLocaleString()]],headStyles:{fillColor:[149,48,2],textColor:255,fontStyle:'bold'},alternateRowStyles:{fillColor:[248,248,248]},theme:'grid'});
    doc.save('KPI_Report.pdf');
  };

  return (
    <div className="dash-section">
      <div style={{maxWidth:1280,margin:"0 auto",padding:"1.5rem"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"1.75rem",flexWrap:"wrap",gap:"1rem"}}>
          <div>
            <h1 style={{fontSize:"1.5rem",fontWeight:800,color:"#111",margin:0,display:"flex",alignItems:"center",gap:"0.6rem"}}>
              <TrendingUp size={22} color={PRIMARY}/> KPI Report
            </h1>
            <p style={{fontSize:"0.875rem",color:"#64748b",margin:"0.3rem 0 0",fontWeight:500}}>Performance analytics from live TenderEase database</p>
          </div>
          <div style={{display:"flex",gap:"0.75rem"}}>
            <button onClick={exportPDF} className="dash-btn dash-btn--outline dash-btn--sm" style={{display:"flex",alignItems:"center",gap:"0.4rem"}}><Download size={14}/> Export PDF</button>
            <button onClick={exportCSV} className="dash-btn dash-btn--outline dash-btn--sm" style={{display:"flex",alignItems:"center",gap:"0.4rem"}}><Download size={14}/> Export Excel</button>
          </div>
        </div>

        <div style={{display:"flex",gap:"0.75rem",flexWrap:"wrap",marginBottom:"1.75rem",padding:"1rem 1.25rem",background:"#fff",border:"1px solid #e2e8f0",borderRadius:12,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
          <select className="dash-select" style={{minWidth:150}} value={period} onChange={e=>setPeriod(e.target.value)}>
            <option value="all_time">All Time</option>
            <option value="this_year">This Year</option>
            <option value="this_month">This Month</option>
            <option value="this_week">This Week</option>
            <option value="today">Today</option>
          </select>
          <select className="dash-select" style={{minWidth:180}} value={department} onChange={e=>setDepartment(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map((d: any) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="dash-select" style={{minWidth:200}} value={ministry} onChange={e=>setMinistry(e.target.value)}>
            <option value="">All Ministries</option>
            {ministries.map((m: any) => <option key={m} value={m}>{m}</option>)}
          </select>
          <select className="dash-select" style={{minWidth:160}} value={category} onChange={e=>setCategory(e.target.value)}>
            <option value="">All Procurement Types</option>
            {categories.map((c: any) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{textAlign:"center",padding:"5rem",color:"#94a3b8",fontSize:"0.95rem",fontWeight:600}}>Loading KPI data from live database...</div>
        ) : (
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(165px,1fr))",gap:"1rem",marginBottom:"1.75rem"}}>
              <StatCard label="Total Tenders"     value={kpi.total}              icon={BarChart2}    color={SLATE}   />
              <StatCard label="Awarded"           value={kpi.awarded}            icon={Award}        color={EMERALD} />
              <StatCard label="Active"            value={kpi.active}             icon={TrendingUp}   color={BLUE}    />
              <StatCard label="Avg Cycle Time"    value={kpi.avgCycle + "d"}     icon={Clock}        color={AMBER}   />
              <StatCard label="Total Award Value" value={fmt(kpi.totalAwardVal)} icon={Package}      color={PRIMARY} />
              <StatCard label="Rejected"          value={kpi.rejected}           icon={CheckCircle}  color="#ef4444" />
              <StatCard label="Total Vendors (Registered)" value={kpi.totalVendors} icon={Package} color="#8b5cf6" />
              <StatCard label="SME Vendors" value={kpi.smeCount + " (" + kpi.smePercent + "%)"} icon={TrendingUp} color={EMERALD} />
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"1rem",marginBottom:"1rem"}}>
              <ChartCard title="Tender Status Breakdown" subtitle="Distribution by current status">
                <div style={{height:230}}> {Object.keys(kpi.byStatus).length>0?<Doughnut data={statusData} options={donutOpts}/>:none("No data for selected filters")} </div>
              </ChartCard>
              <ChartCard title="Procurement Type" subtitle="Tenders by procurement category">
                <div style={{height:230}}> {Object.keys(kpi.byType).length>0?<Pie data={typeData} options={pieOpts}/>:none("No data")} </div>
              </ChartCard>
              <ChartCard title="Bidding Method" subtitle="NCB, DC, LIB and other methods">
                <div style={{height:230}}> {Object.keys(kpi.byMethod).length>0?<Bar data={methodData} options={sharedOpts("Tenders")}/>:none("No data")} </div>
              </ChartCard>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1rem"}}>
              <ChartCard title="Avg. Procurement Cycle Time" subtitle="Monthly avg days from creation to award">
                <div style={{height:240}}> {kpi.cycleTimeTrend.some((d: any)=>d.value>0)?<Line data={cycleData} options={sharedOpts("Days")}/>:none("No awarded tenders to compute cycle time")} </div>
              </ChartCard>
              <ChartCard title="Active Tenders per Month" subtitle="Count of live or pending tenders each month">
                <div style={{height:240}}> {kpi.activeTrend.some((d: any)=>d.value>0)?<Bar data={activeCD} options={sharedOpts("Tenders")}/>:none("No active tenders in selected period")} </div>
              </ChartCard>
            </div>

            <div style={{marginBottom:"1.75rem"}}>
              <ChartCard title="Estimated Award Value by Month" subtitle="Total estimated budget of awarded tenders in millions">
                <div style={{height:260}}> {kpi.awardTrend.some((d: any)=>d.value>0)?<Bar data={awardCD} options={sharedOpts("Millions (Rs.)")}/>:none("No awarded tender values in selected period")} </div>
              </ChartCard>
            </div>


            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1rem",marginBottom:"1rem"}}>
              <ChartCard title="SME Participation" subtitle={"SME vs Non-SME registered vendors — " + kpi.smePercent + "% SME (" + kpi.smeCount + " of " + kpi.totalVendors + " vendors)"}>
                <div style={{height:230}}>
                  {kpi.totalVendors > 0
                    ? <Doughnut data={smeData} options={{...donutOpts, plugins: {...donutOpts.plugins, tooltip: {backgroundColor:'#1e293b', padding:10, cornerRadius:8, callbacks: {label: (ctx: any) => ctx.label + ': ' + ctx.raw + ' vendors (' + (kpi.totalVendors > 0 ? Math.round(ctx.raw/kpi.totalVendors*100) : 0) + '%)'}}}}}/>
                    : none("No vendor data available")}
                </div>
                <div style={{textAlign:"center",marginTop:"0.75rem"}}>
                  <span style={{display:"inline-flex",alignItems:"center",gap:"0.4rem",background:"#d1fae5",color:"#065f46",padding:"0.25rem 0.75rem",borderRadius:999,fontSize:"0.78rem",fontWeight:700}}>
                    &#9679; SME = Sole Proprietorship or Partnership
                  </span>
                </div>
              </ChartCard>
              <ChartCard title="Vendor Organization Types" subtitle="Breakdown of all registered vendors by business type">
                <div style={{height:230}}>
                  {Object.keys(kpi.byOrgType).length > 0
                    ? <Pie data={orgTypeData} options={pieOpts}/>
                    : none("No vendor data available")}
                </div>
              </ChartCard>
            </div>

            <div style={{background:"#fff",border:"1px solid #e2e8f0",borderRadius:14,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
              <div style={{background:"#f8fafc",padding:"1rem 1.5rem",borderBottom:"1px solid #e2e8f0",fontWeight:700,fontSize:"0.9rem",color:"#374151",textTransform:"uppercase",letterSpacing:"0.04em"}}>Summary</div>
              <table style={{width:"100%",borderCollapse:"collapse"}}>
                <tbody>
                  {([
                    ['Total Tenders', kpi.total],
                    ['Awarded', kpi.awarded],
                    ['Active', kpi.active],
                    ['Rejected', kpi.rejected],
                    ['Avg. Cycle Time', kpi.avgCycle + ' days'],
                    ['Total Award Value (Est.)', 'Rs. ' + kpi.totalAwardVal.toLocaleString()],
                    ['SME Vendor Participation', kpi.smePercent + '% (' + kpi.smeCount + ' of ' + kpi.totalVendors + ' registered vendors)'],
                    ['Filters Applied', (period||'all_time') + ' | ' + (department||'All Depts') + ' | ' + (ministry||'All Ministries') + ' | ' + (category||'All Types')],
                  ] as [string, any][]).map(([label, value], i) => (
                    <tr key={i} style={{borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#fafafa"}}>
                      <td style={{padding:"0.875rem 1.5rem",color:"#64748b",fontWeight:600,fontSize:"0.875rem"}}>{label}</td>
                      <td style={{padding:"0.875rem 1.5rem",color:"#111",fontWeight:700,fontSize:"0.9rem"}}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{padding:"0.75rem 1.5rem",fontSize:"0.75rem",color:"#94a3b8",fontStyle:"italic"}}>All data is pulled from the live TenderEase database. Filters affect all charts and metrics above.</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}